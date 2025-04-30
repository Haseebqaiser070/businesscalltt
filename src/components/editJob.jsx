import { useAppContext } from '../context/AppContext'
import './styles.css'
import React, { useEffect, useState } from 'react'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { useNavigate, useParams } from 'react-router-dom'
import MapSelector from './MapSelector'
import TagsInput from './TagsInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faFile,
  faImage,
  faMusic,
  faVideo,
} from '@fortawesome/free-solid-svg-icons'
import Loader from './Loader'
import { toast } from 'react-hot-toast'

export default function EditJob() {
  const { updateDocument, setDocument, fetchCollection } = useAppContext()
  const storage = getStorage()
  const navigate = useNavigate()
  const { jobId } = useParams()
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState(null)

  const [locationInfo, setLocationInfo] = useState({
    address: '',
    lat: null,
    lng: null,
  })

  const [idImageLink, setIdImageLink] = useState('')
  const [imagesUrls, setImagesUrls] = useState([])
  const [audioUrls, setAudioUrls] = useState([])
  const [videoUrls, setVideoUrls] = useState([])
  const [documentUrls, setDocumentUrls] = useState([])

  // Loading states for each upload type
  const [loadingImages, setLoadingImages] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingIdImage, setLoadingIdImage] = useState(false)

  const [formData, setFormData] = useState({
    isContactShared: false,
    isIdShared: false,
    file: null,
    files: {
      images: [],
      audio: [],
      video: [],
      documents: [],
    },
    jobName: '',
    category: 'default',
    location: '',
    keywords: '',
    contactInfo: {
      contact_number: '',
      show: false,
    },
    idInfo: {
      id_number: '',
      show: false,
    },
    description: '',
    whatsapp_no: '',
  })

  // Fetch the job data and categories
  const fetchJobData = async () => {
    setLoading(true)
    try {
      // Fetch all jobs
      const jobs = await fetchCollection('jobs')

      // Find the specific job by ID
      const jobData = jobs.find((job) => job.id === jobId)

      if (!jobData) {
        toast.error('Job not found')
        navigate('/all-jobs')
        return
      }

      setJob(jobData)

      // Set form data from job
      setFormData({
        jobName: jobData.job_name || '',
        category: jobData.categories_ids[0] || 'default',
        description: jobData.description || '',
        isContactShared: jobData.contact_info?.show || false,
        isIdShared: jobData.id_info?.show || false,
        contactInfo: {
          contact_number: jobData.contact_info?.contact_number || '',
          show: jobData.contact_info?.show || false,
        },
        idInfo: {
          id_number: jobData.id_info?.id_number || '',
          show: jobData.id_info?.show || false,
        },
        whatsapp_no: jobData.whatsapp_no || '',
      })

      setIdImageLink(jobData.id_image || '')

      // Set location info
      setLocationInfo({
        address: jobData.location_info?.address || '',
        lat: jobData.location_info?.lat || null,
        lng: jobData.location_info?.lng || null,
      })

      // Set tags/keywords
      setTags(jobData.keyword_list || [])

      // Set media URLs
      if (jobData.images && jobData.images.length > 0) {
        setImagesUrls(
          jobData.images.map((url) => ({
            url,
            path: extractPathFromUrl(url),
            name: extractNameFromUrl(url),
          }))
        )
      }

      if (jobData.audios && jobData.audios.length > 0) {
        setAudioUrls(
          jobData.audios.map((url) => ({
            url,
            path: extractPathFromUrl(url),
            name: extractNameFromUrl(url),
          }))
        )
      }

      if (jobData.videos && jobData.videos.length > 0) {
        setVideoUrls(
          jobData.videos.map((url) => ({
            url,
            path: extractPathFromUrl(url),
            name: extractNameFromUrl(url),
          }))
        )
      }

      if (jobData.documents && jobData.documents.length > 0) {
        setDocumentUrls(
          jobData.documents.map((url) => ({
            url,
            path: extractPathFromUrl(url),
            name: extractNameFromUrl(url),
          }))
        )
      }

      // Fetch categories
      await getCategories()
    } catch (error) {
      console.error('Error fetching job data:', error)
      toast.error('Failed to load job data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to extract path from URL
  const extractPathFromUrl = (url) => {
    try {
      const urlObj = new URL(url)
      const pathWithToken = urlObj.pathname

      // Remove the /v0/b/[project-id].appspot.com/o/ prefix and decode the path
      const match = pathWithToken.match(/\/v0\/b\/[^/]+\/o\/(.+)/)
      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }
      // Fallback
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    } catch (e) {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
  }

  // Helper function to extract file name from URL
  const extractNameFromUrl = (url) => {
    try {
      const path = extractPathFromUrl(url)
      const parts = path.split('/')
      return parts[parts.length - 1]
    } catch (e) {
      return `file-${Date.now()}`
    }
  }

  const getCategories = async () => {
    try {
      const res = await fetchCollection('categories')
      setCategories(res)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  // Toggle function for shared contact and ID
  const toggleShare = (field) => {
    setFormData((prevData) => {
      const newState = {
        ...prevData,
        [field]: !prevData[field],
      }

      if (field === 'isContactShared') {
        newState.contactInfo = {
          ...prevData.contactInfo,
          show: !prevData[field],
        }
      }

      if (field === 'isIdShared') {
        newState.idInfo = {
          ...prevData.idInfo,
          show: !prevData[field],
        }
      }

      return newState
    })
  }

  const handleLocationSelect = ({ address, lat, lng }) => {
    setLocationInfo({
      address: address || '',
      lat: lat || null,
      lng: lng || null,
    })
  }

  // Image upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoadingImages(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `images/${Date.now()}-${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return { url, path, name: file.name }
      })

      const newImages = await Promise.all(uploadPromises)
      setImagesUrls((prev) => [...prev, ...newImages])
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setLoadingImages(false)
    }
  }

  const handleIDImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoadingIdImage(true)
    try {
      const path = `images/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setIdImageLink(url)
    } catch (error) {
      console.error('Error uploading ID image:', error)
      toast.error('Failed to upload ID image')
    } finally {
      setLoadingIdImage(false)
    }
  }

  // Audio upload handler
  const handleAudioUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoadingAudio(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `audio/${Date.now()}-${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return { url, path, name: file.name }
      })

      const newAudios = await Promise.all(uploadPromises)
      setAudioUrls((prev) => [...prev, ...newAudios])
    } catch (error) {
      console.error('Error uploading audio:', error)
      toast.error('Failed to upload audio')
    } finally {
      setLoadingAudio(false)
    }
  }

  // Video upload handler
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoadingVideo(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `video/${Date.now()}-${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return { url, path, name: file.name }
      })

      const newVideos = await Promise.all(uploadPromises)
      setVideoUrls((prev) => [...prev, ...newVideos])
    } catch (error) {
      console.error('Error uploading videos:', error)
      toast.error('Failed to upload videos')
    } finally {
      setLoadingVideo(false)
    }
  }

  // Document upload handler
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setLoadingDocuments(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `documents/${Date.now()}-${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        return { url, path, name: file.name }
      })

      const newDocuments = await Promise.all(uploadPromises)
      setDocumentUrls((prev) => [...prev, ...newDocuments])
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast.error('Failed to upload documents')
    } finally {
      setLoadingDocuments(false)
    }
  }

  // Delete image handler
  const handleDeleteImage = async (index) => {
    try {
      // No need to delete from storage as we're just updating references
      setImagesUrls((prev) => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
  }

  const handleDeleteIdImage = async () => {
    if (!idImageLink) return
    try {
      const storageRef = ref(storage, idImageLink)
      await deleteObject(storageRef)
      setIdImageLink(null)
    } catch (error) {
      console.error('Error deleting ID image:', error)
      toast.error('Failed to delete ID image')
    }
  }

  // Delete audio handler
  const handleDeleteAudio = async (index) => {
    try {
      setAudioUrls((prev) => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting audio:', error)
      toast.error('Failed to delete audio')
    }
  }

  // Delete video handler
  const handleDeleteVideo = async (index) => {
    try {
      setVideoUrls((prev) => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Failed to delete video')
    }
  }

  // Delete document handler
  const handleDeleteDocument = async (index) => {
    try {
      setDocumentUrls((prev) => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  // Handle form field changes
  const handleInputChange = (e, field) => {
    const { value } = e.target
    if (field === 'contactInfo') {
      setFormData((prevData) => ({
        ...prevData,
        contactInfo: {
          ...prevData.contactInfo,
          contact_number: value,
        },
      }))
    } else if (field === 'idInfo') {
      setFormData((prevData) => ({
        ...prevData,
        idInfo: {
          ...prevData.idInfo,
          id_number: value,
        },
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setSubmitting(true)

    try {
      // Prepare the job payload
      const selectedCategory =
        categories.find((cat) => cat.id === formData.category) || {}

      const payload = {
        job_name: formData.jobName,
        categories_ids: [formData.category],
        categories_names: selectedCategory.cat_name
          ? [selectedCategory.cat_name]
          : [],
        location_info: {
          address: locationInfo.address,
          lat: locationInfo.lat,
          lng: locationInfo.lng,
        },
        keywords: tags.join(', '),
        keyword_list: tags,
        contact_info: {
          contact_number: formData.contactInfo.contact_number,
          show: formData.isContactShared,
        },
        id_info: {
          id_number: formData.idInfo.id_number,
          show: formData.isIdShared,
        },
        // Keep the original user ID
        uid: job.uid || localStorage.getItem('userId'),
        description: formData.description,
        images: imagesUrls.map((img) => img.url),
        videos: videoUrls.map((vid) => vid.url),
        audios: audioUrls.map((aud) => aud.url),
        documents: documentUrls.map((doc) => doc.url),
        // Keep original creation date and add updated_at
        created_at: job.created_at,
        updated_at: new Date().toISOString(),
        whatsapp_no: formData.whatsapp_no,
        id_image: idImageLink,
      }

      // Update the job document
      await updateDocument('jobs', jobId, payload)

      // Update the job_locations document
      const locationPayload = {
        created_at: job.created_at,
        updated_at: new Date().toISOString(),
        created_by: job.uid || localStorage.getItem('userId'),
        id: jobId,
        job_id: jobId,
        location_info: {
          address: locationInfo.address,
          lat: locationInfo.lat,
          lng: locationInfo.lng,
        },
      }

      // Update the location document
      await updateDocument('jobs_locations', jobId, locationPayload)

      // Success handling
      setLoading(false)
      toast.success('Job updated successfully!')
      setTimeout(() => {
        setSubmitting(false)
        navigate('/all-jobs')
      }, 3000)
    } catch (error) {
      console.error('Error in job update process:', error)
      setSubmitting(false)
      setLoading(false)
      toast.error(error.message || 'Failed to update job. Please try again.')
    }
  }

  useEffect(() => {
    fetchJobData()
  }, [jobId])

  if (loading) {
    return <Loader />
  }

  return (
    <section>
      <div className="container-fluid">
        <div className="row d-flex justify-content-center align-items-center p-4">
          <div className="col-md-12 col-lg-12 col-xl-12 p-4">
            <form onSubmit={handleSubmit}>
              <div className="divider mb-4 pb-2">
                <h1 className="fw-bold mb-0">Edit Job</h1>
              </div>

              {/* Upload Buttons */}
              <div className="row mb-4">
                <div className="row mb-4">
                  {/* Image Upload */}
                  <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <label className="btn btn-primary w-100 p-3">
                      <FontAwesomeIcon icon={faImage} /> Upload Images
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={loadingImages}
                      />
                    </label>
                    {loadingImages && (
                      <div
                        className="spinner-border spinner-border-sm mt-2"
                        role="status"
                      ></div>
                    )}

                    {/* Image Previews */}
                    {imagesUrls.length > 0 && (
                      <div className="mt-3">
                        <h6>Uploaded Images ({imagesUrls.length})</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {imagesUrls.map((image, index) => (
                            <div key={index} className="position-relative">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="img-thumbnail"
                                style={{
                                  height: '80px',
                                  width: '80px',
                                  objectFit: 'cover',
                                }}
                              />
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteImage(index)}
                                style={{ padding: '2px 6px' }}
                              >
                                <FontAwesomeIcon icon={faCircleXmark} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audio Upload */}
                  <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <label className="btn btn-warning w-100 p-3">
                      <FontAwesomeIcon icon={faMusic} /> Upload Audio
                      <input
                        type="file"
                        className="d-none"
                        accept="audio/*"
                        multiple
                        onChange={handleAudioUpload}
                        disabled={loadingAudio}
                      />
                    </label>
                    {loadingAudio && (
                      <div
                        className="spinner-border spinner-border-sm mt-2"
                        role="status"
                      ></div>
                    )}

                    {/* Audio Previews */}
                    {audioUrls.length > 0 && (
                      <div className="mt-3">
                        <h6>Uploaded Audio ({audioUrls.length})</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {audioUrls.map((audio, index) => (
                            <div
                              key={index}
                              className="position-relative border rounded p-2 bg-light"
                            >
                              <div className="d-flex align-items-center">
                                <i className="fas fa-music me-2"></i>
                                <span
                                  className="text-truncate"
                                  style={{ maxWidth: '100px' }}
                                >
                                  {audio.name}
                                </span>
                              </div>
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteAudio(index)}
                                style={{ padding: '2px 6px' }}
                              >
                                <FontAwesomeIcon icon={faCircleXmark} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <label className="btn btn-danger w-100 p-3">
                      <FontAwesomeIcon icon={faVideo} />
                      Upload Video
                      <input
                        type="file"
                        className="d-none"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        disabled={loadingVideo}
                      />
                    </label>
                    {loadingVideo && (
                      <div
                        className="spinner-border spinner-border-sm mt-2"
                        role="status"
                      ></div>
                    )}

                    {/* Video Previews */}
                    {videoUrls.length > 0 && (
                      <div className="mt-3">
                        <h6>Uploaded Videos ({videoUrls.length})</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {videoUrls.map((video, index) => (
                            <div
                              key={index}
                              className="position-relative border rounded p-2 bg-light"
                            >
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faVideo}
                                  className="me-2"
                                />
                                <span
                                  className="text-truncate"
                                  style={{ maxWidth: '100px' }}
                                >
                                  {video.name}
                                </span>
                              </div>
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteVideo(index)}
                                style={{ padding: '2px 6px' }}
                              >
                                <FontAwesomeIcon icon={faCircleXmark} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Upload */}
                  <div className="col-12 col-md-6 col-lg-3 mb-3">
                    <label className="btn btn-success w-100 p-3">
                      <FontAwesomeIcon icon={faFile} /> Upload Documents
                      <input
                        type="file"
                        className="d-none"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        onChange={handleDocumentUpload}
                        disabled={loadingDocuments}
                      />
                    </label>
                    {loadingDocuments && (
                      <div
                        className="spinner-border spinner-border-sm mt-2"
                        role="status"
                      ></div>
                    )}

                    {/* Document Previews */}
                    {documentUrls.length > 0 && (
                      <div className="mt-3">
                        <h6>Uploaded Documents ({documentUrls.length})</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {documentUrls.map((document, index) => (
                            <div
                              key={index}
                              className="position-relative border rounded p-2 bg-light"
                            >
                              <div className="d-flex align-items-center">
                                <i className="fas fa-file-alt me-2"></i>
                                <span
                                  className="text-truncate"
                                  style={{ maxWidth: '100px' }}
                                >
                                  {document.name}
                                </span>
                              </div>
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteDocument(index)}
                                style={{ padding: '2px 6px' }}
                              >
                                <FontAwesomeIcon icon={faCircleXmark} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Title */}
              <div className="form-outline mb-4">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter job title"
                  value={formData.jobName}
                  onChange={(e) => handleInputChange(e, 'jobName')}
                />
              </div>

              <div className="row mb-3">
                <div className="col-6 mb-4">
                  <div className="form-outline mb-2">
                    <label className="form-label">Select Category</label>
                    <select
                      className="form-control form-control-lg"
                      value={formData.category}
                      onChange={(e) => handleInputChange(e, 'category')}
                    >
                      <option value="default" disabled>
                        Choose a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.cat_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Keywords/Tags */}

                <div className="col-6 mb-4">
                  <div className="form-outline mb-4">
                    <label className="form-label">Keywords/Tags</label>
                    <TagsInput tags={tags} setTags={setTags} />
                  </div>
                </div>
              </div>

              {/* Contact info and ID # in one row */}
              <div className="row">
                <div className="col-6 mb-4">
                  <div className="form-outline">
                    <label className="form-label">Contact info</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter contact info"
                      value={formData.contactInfo.contact_number}
                      onChange={(e) => handleInputChange(e, 'contactInfo')}
                    />
                  </div>
                  <p className="small d-flex justify-content-end align-items-center mt-2 mb-2 pt-1 mb-0">
                    Only you can see this until you choose to{' '}
                    <button
                      type="button"
                      className="btn btn-link link-danger p-0 ms-1"
                      onClick={() => toggleShare('isContactShared')}
                    >
                      {formData.isContactShared ? 'Unshare' : 'Share'}
                    </button>
                  </p>
                </div>
                <div className="col-6 mb-4">
                  <div className="form-outline">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter WhatsApp number"
                      value={formData.whatsapp_no || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          whatsapp_no: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-6 mb-4">
                  <div className="form-outline">
                    <label className="form-label">ID # for verification</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter ID # for verification"
                      value={formData.idInfo.id_number}
                      onChange={(e) => handleInputChange(e, 'idInfo')}
                    />
                  </div>
                  <p className="small d-flex justify-content-end align-items-center mt-2 mb-2 pt-1 mb-0">
                    Only you can see this until you choose to{' '}
                    <button
                      type="button"
                      className="btn btn-link link-danger p-0 ms-1"
                      onClick={() => toggleShare('isIdShared')}
                    >
                      {formData.isIdShared ? 'Unshare' : 'Share'}
                    </button>
                  </p>
                </div>
                <div className="col-6 mb-4">
                  <div className="form-outline">
                    <label className="form-label">
                      Photo for ID verification
                    </label>

                    <label className="btn btn-primary w-100 p-3">
                      <FontAwesomeIcon icon={faImage} /> Upload ID
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        onChange={handleIDImageUpload}
                        disabled={loadingIdImage}
                      />
                    </label>
                    {loadingIdImage && (
                      <div
                        className="spinner-border spinner-border-sm mt-2"
                        role="status"
                      ></div>
                    )}

                    {/* Image Previews */}
                    {idImageLink && (
                      <div className="mt-3">
                        <h6>Uploaded Image</h6>
                        <div className="d-flex flex-wrap gap-2">
                          <div className="position-relative">
                            <img
                              src={idImageLink}
                              alt={'ID Image'}
                              className="img-thumbnail"
                              style={{
                                height: '80px',
                                width: '80px',
                                objectFit: 'cover',
                              }}
                            />
                            <span
                              type="button"
                              className=" position-absolute top-0 end-0"
                              onClick={handleDeleteIdImage}
                              style={{ padding: '2px 6px' }}
                            >
                              <FontAwesomeIcon icon={faCircleXmark} />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="form-outline mb-4">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control form-control-lg"
                  rows="4"
                  placeholder="Enter a brief description"
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, 'description')}
                ></textarea>
              </div>

              <div className="col-12 mb-4">
                <div className="form-outline mb-2">
                  <label className="form-label">Select Location</label>
                  <MapSelector
                    onLocationSelect={handleLocationSelect}
                    editLocation={locationInfo}
                  />
                </div>
              </div>

              <div className="text-center text-lg-start mt-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  Update Job
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg ms-3"
                  onClick={() => navigate('/all-jobs')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
