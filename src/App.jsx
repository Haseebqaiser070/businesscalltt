import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './components/Login'
import Dashboard from './components/dashboard'
import AllJobs from './components/alljobs'
import Postajob from './components/Postajob'
import Postproductservice from './components/Postproductservice'
import AllServices from './components/allservices'
import MainLayout from './components/mainlayout'
import Signup from './components/Signup'
import EditJob from './components/editJob'
import EditService from './components/editServices'
import DashboardHome from './components/dashboardlogout'

// Protected Route Component to check authentication
const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  if (!isAuthenticated) {
    return <Login />
  }
  return element
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/all-jobs"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <AllJobs />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <Postajob />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/edit-job/:jobId"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <EditJob />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/post-service-product"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <Postproductservice />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/edit-service-product/:serviceId"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <EditService />
                </MainLayout>
              }
            />
          }
        />
        <Route
          path="/all-services-products"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <AllServices />
                </MainLayout>
              }
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
