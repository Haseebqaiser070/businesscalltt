import { useAppContext } from "../context/AppContext";
import "./styles.css";
import React, { useCallback, useEffect, useState } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";
import MapSelector from "./MapSelector";
import TagsInput from "./TagsInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faFile,
  faImage,
  faMusic,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "./Loader";
import { toast } from "react-hot-toast";
import AddCategory from "./addCategory";
import PhoneInput from "react-phone-input-2";
import "./styles.css";

import 'react-phone-input-2/lib/bootstrap.css'

export default function Postajob() {
  const { addDocument, setDocument, fetchCollection } = useAppContext();
  const storage = getStorage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [addCategory, setAddCategory] = useState("");

  const [loading, setLoading] = useState(false);

  const [locationInfo, setLocationInfo] = useState({
    address: "",
    lat: null,
    lng: null,
  });

  const [idImageLink, setIdImageLink] = useState("");
  const [imagesUrls, setImagesUrls] = useState([]);
  const [audioUrls, setAudioUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [documentUrls, setDocumentUrls] = useState([]);

  // Loading states for each upload type
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingIdImage, setLoadingIdImage] = useState(false);

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
    jobName: "",
    category: "default",
    location: "",
    keywords: "",
    contactInfo: {
      contact_number: "",
      show: false,
    },
    idInfo: {
      id_number: "",
      show: false,
    },
    description: "",
    whatsapp_no: "",
  });

  const getCategores = useCallback(async () => {
    setLoading(true);
    const res = await fetchCollection("categories");
    setCategories(res);
    setLoading(false);
  }, [addCategory]);

  // Toggle function for shared contact and ID
  const toggleShare = (field) => {
    setFormData((prevData) => {
      const newState = {
        ...prevData,
        [field]: !prevData[field],
      };

      if (field === "isContactShared") {
        newState.contactInfo = {
          ...prevData.contactInfo,
          show: !prevData[field],
        };
      }

      if (field === "isIdShared") {
        newState.idInfo = {
          ...prevData.idInfo,
          show: !prevData[field],
        };
      }

      return newState;
    });
  };

  const handleLocationSelect = ({ address, lat, lng }) => {
    setLocationInfo({
      address: address || "",
      lat: lat || null,
      lng: lng || null,
    });
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `images/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { url, path, name: file.name };
      });

      const newImages = await Promise.all(uploadPromises);
      setImagesUrls((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleIDImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingIdImage(true);
    try {
      const path = `images/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setIdImageLink(url);
    } catch (error) {
      console.error("Error uploading ID image:", error);
      toast.error("Failed to upload ID image");
    } finally {
      setLoadingIdImage(false);
    }
  };

  // Audio upload handler
  const handleAudioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoadingAudio(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `audio/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { url, path, name: file.name };
      });

      const newAudios = await Promise.all(uploadPromises);
      setAudioUrls((prev) => [...prev, ...newAudios]);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio");
    } finally {
      setLoadingAudio(false);
    }
  };

  // Video upload handler
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoadingVideo(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `video/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { url, path, name: file.name };
      });

      const newVideos = await Promise.all(uploadPromises);
      setVideoUrls((prev) => [...prev, ...newVideos]);
    } catch (error) {
      console.error("Error uploading videos:", error);
      toast.error("Failed to upload videos");
    } finally {
      setLoadingVideo(false);
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoadingDocuments(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `documents/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { url, path, name: file.name };
      });

      const newDocuments = await Promise.all(uploadPromises);
      setDocumentUrls((prev) => [...prev, ...newDocuments]);
    } catch (error) {
      console.error("Error uploading documents:", error);

      toast.error("Failed to upload documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Delete image handler
  const handleDeleteImage = async (index) => {
    try {
      const imageToDelete = imagesUrls[index];
      const storageRef = ref(storage, imageToDelete.path);
      await deleteObject(storageRef);
      setImagesUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleDeleteIdImage = async () => {
    if (!idImageLink) return;
    try {
      const storageRef = ref(storage, idImageLink);
      await deleteObject(storageRef);
      setIdImageLink(null);
    } catch (error) {
      console.error("Error deleting ID image:", error);
      toast.error("Failed to delete ID image");
    }
  };

  // Delete audio handler
  const handleDeleteAudio = async (index) => {
    try {
      const audioToDelete = audioUrls[index];
      const storageRef = ref(storage, audioToDelete.path);
      await deleteObject(storageRef);
      setAudioUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting audio:", error);
      toast.error("Failed to delete audio");
    }
  };

  // Delete video handler
  const handleDeleteVideo = async (index) => {
    try {
      const videoToDelete = videoUrls[index];
      const storageRef = ref(storage, videoToDelete.path);
      await deleteObject(storageRef);
      setVideoUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (index) => {
    try {
      const documentToDelete = documentUrls[index];
      const storageRef = ref(storage, documentToDelete.path);
      await deleteObject(storageRef);
      setDocumentUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Handle form field changes
  const handleInputChange = (e, field) => {
    const { value } = e.target;
    if (field === "contactInfo") {
      setFormData((prevData) => ({
        ...prevData,
        contactInfo: {
          ...prevData.contactInfo,
          contact_number: value,
        },
      }));
    } else if (field === "idInfo") {
      setFormData((prevData) => ({
        ...prevData,
        idInfo: {
          ...prevData.idInfo,
          id_number: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitting(true);

    try {
      // Prepare the job payload
      const selectedCategory =
        categories.find((cat) => cat.id === formData.category) || {};

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
        keywords: tags.join(", "),
        keyword_list: tags,
        contact_info: {
          contact_number: formData.contactInfo.contact_number,
          show: formData.isContactShared,
        },
        id_info: {
          id_number: formData.idInfo.id_number,
          show: formData.isIdShared,
        },
        uid: localStorage.getItem("userId"),
        description: formData.description,
        images: imagesUrls.map((img) => img.url),
        videos: videoUrls.map((vid) => vid.url),
        audios: audioUrls.map((aud) => aud.url),
        documents: documentUrls.map((doc) => doc.url),
        created_at: new Date().toISOString(),
        whatsapp_no: formData.whatsapp_no,
        id_image: idImageLink,
      };

      // Step 1: Create the job document

      const jobId = await addDocument("jobs", payload);

      if (!jobId) {
        throw new Error("Failed to create job - no document ID returned");
      }

      // Step 2: Create the job_locations document

      const locationPayload = {
        created_at: new Date().toISOString(),
        created_by: localStorage.getItem("userId"),
        id: jobId,
        job_id: jobId,
        location_info: {
          address: locationInfo.address,
          lat: locationInfo.lat,
          lng: locationInfo.lng,
        },
      };

      // Add the location document
      const locationDocId = await setDocument(
        "jobs_locations",
        jobId,
        locationPayload
      );

      // Success handling
      setLoading(false);
      toast.success("Job posted successfully!");
      setTimeout(() => {
        setSubmitting(false);
        navigate("/all-jobs");
      }, 3000);
    } catch (error) {
      console.error("Error in job creation process:", error);
      setSubmitting(false);
      setLoading(false);
      toast.error(error.message || "Failed to post job. Please try again.");
    }
  };

  useEffect(() => {
    getCategores();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <section>
      <div className="container-fluid">
        <div className="row d-flex justify-content-center align-items-center p-4">
          <div className="col-md-12 col-lg-12 col-xl-12 p-4">
            <form onSubmit={handleSubmit}>
              <div className="divider mb-4 pb-2">
                <h1 className="fw-bold mb-0">Post a Job</h1>
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
                                  height: "80px",
                                  width: "80px",
                                  objectFit: "cover",
                                }}
                              />
                              <span
                                type="button"
                                className=" position-absolute top-0 end-0"
                                onClick={() => handleDeleteImage(index)}
                                style={{ padding: "2px 6px" }}
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
                                  style={{ maxWidth: "100px" }}
                                >
                                  {audio.name}
                                </span>
                              </div>
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteAudio(index)}
                                style={{ padding: "2px 6px" }}
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
                                  style={{ maxWidth: "100px" }}
                                >
                                  {video.name}
                                </span>
                              </div>
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteVideo(index)}
                                style={{ padding: "2px 6px" }}
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
                                  style={{ maxWidth: "100px" }}
                                >
                                  {document.name}
                                </span>
                              </div>
                              <span
                                type="button"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleDeleteDocument(index)}
                                style={{ padding: "2px 6px" }}
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
                  placeholder="Enter full name"
                  value={formData.jobName}
                  onChange={(e) => handleInputChange(e, "jobName")}
                />
              </div>

              <div className="row mb-3">
                <div className="col-6 mb-4">
                  <div className="form-outline mb-2">
                    <label className="form-label">Select Category</label>
                    <select
                      className="form-control form-control-lg"
                      value={formData.category}
                      onChange={(e) => handleInputChange(e, "category")}
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
                  <div>
                    <AddCategory
                      categoryName={addCategory}
                      setCategoryName={setAddCategory}
                    />
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
                      onChange={(e) => handleInputChange(e, "contactInfo")}
                    />
                  </div>
                  <p className="small d-flex justify-content-end align-items-center mt-2 mb-2 pt-1 mb-0">
                    Only you can see this until you choose to{" "}
                    <button
                      type="button"
                      className="btn btn-link link-danger p-0 ms-1"
                      onClick={() => toggleShare("isContactShared")}
                    >
                      {formData.isContactShared ? "Unshare" : "Share"}
                    </button>
                  </p>
                </div>

                <div className="col-6 mb-4">
                  <div className="form-outline">
                    <label className="form-label">WhatsApp Number</label>
                    <PhoneInput
                      country={"tt"}
                      value={formData.whatsapp_no}
                      onChange={(phone) =>
                        setFormData((prev) => ({
                          ...prev,
                          whatsapp_no: phone,
                        }))
                      }
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        fontSize: "16px",
                      }}
                      buttonStyle={{
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #ced4da",
                      }}
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
                      onChange={(e) => handleInputChange(e, "idInfo")}
                    />
                  </div>
                  <p className="small d-flex justify-content-end align-items-center mt-2 mb-2 pt-1 mb-0">
                    Only you can see this until you choose to{" "}
                    <button
                      type="button"
                      className="btn btn-link link-danger p-0 ms-1"
                      onClick={() => toggleShare("isIdShared")}
                    >
                      {formData.isIdShared ? "Unshare" : "Share"}
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
                              alt={"ID Image"}
                              className="img-thumbnail"
                              style={{
                                height: "80px",
                                width: "80px",
                                objectFit: "cover",
                              }}
                            />
                            <span
                              type="button"
                              className=" position-absolute top-0 end-0"
                              onClick={handleDeleteIdImage}
                              style={{ padding: "2px 6px" }}
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
                  onChange={(e) => handleInputChange(e, "description")}
                ></textarea>
              </div>

              <div className="col-12 mb-4">
                <div className="form-outline mb-2">
                  <label className="form-label">Select Location</label>
                  <MapSelector onLocationSelect={handleLocationSelect} />
                </div>
              </div>

              <div className="text-center text-lg-start mt-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  Post a Job
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
