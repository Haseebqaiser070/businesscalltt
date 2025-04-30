import React, { useState } from 'react'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { useAppContext } from '../context/AppContext'
import Loader from './Loader'
import { toast } from 'react-hot-toast'

const AddCategory = ({ categoryName, setCategoryName }) => {
  const { addDocument, fetchCollection, updateDocument } = useAppContext()
  const [loading, setLoading] = useState(false)

  const handleCategory = (e) => {
    e.preventDefault()
    setCategoryName(e.target.value)
  }

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()

    const payload = {
      cat_name: categoryName,
      created_at: new Date(),
      created_by: localStorage.getItem('userId'),
    }

    const catId = await addDocument('categories', payload)
    if (!catId) {
      setLoading(false)
      toast.error('Failed to add category')
      return
    } else {
      await updateDocument('categories', catId, { cat_id: catId })
      setLoading(false)
      toast.success('Category added successfully')
      await fetchCollection('categories')
      setCategoryName('')
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Add new category
      </button>
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Add new category
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="form-outline">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={handleCategory}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddCategory
