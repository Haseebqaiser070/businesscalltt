import React, { createContext, useContext, useState } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // Store fetched data per collection name
  const [collections, setCollections] = useState({})

  // Fetch all documents from any collection
  const fetchCollection = async (name) => {
    const snap = await getDocs(collection(db, name))
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    setCollections((prev) => ({ ...prev, [name]: docs }))
    return docs
  }

  // Add a document to any collection
  const addDocument = async (name, data) => {
    const ref = await addDoc(collection(db, name), data)
    await fetchCollection(name)
    return ref.id
  }

  // Add a document with a specific ID
  const setDocument = async (name, id, data) => {
    await setDoc(doc(db, name, id), data)
    await fetchCollection(name)
    return id
  }

  // Update a document by ID in any collection
  const updateDocument = async (name, id, data) => {
    const ref = doc(db, name, id)
    await updateDoc(ref, data)
    await fetchCollection(name)
  }

  // Delete a document by ID in any collection
  const deleteDocument = async (name, id) => {
    const ref = doc(db, name, id)
    await deleteDoc(ref)
    await fetchCollection(name)
  }

  return (
    <AppContext.Provider
      value={{
        collections,
        fetchCollection,
        addDocument,
        setDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
