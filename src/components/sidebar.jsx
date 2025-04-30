import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTachometerAlt,
  faBriefcase,
  faPlusCircle,
  faCogs,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
import './styles.css'
import logo from './logo.png'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userId')
    navigate('/')
  }

  return (
    <div className="sidebar" style={{ height: '100vh' }}>
      <div className="d-flex justify-content-center gap-3 mt-auto align-items-center">
        <img src={logo} className="" alt="Logo" width="60" />
        <h4 className="sidebar-title pt-3">
          <b>Business Call TT</b>
        </h4>
      </div>

      <ul className="sidebar-nav mt-4">
        <li>
          <Link to="/dashboard" className="sidebar-link">
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/all-jobs" className="sidebar-link">
            <FontAwesomeIcon icon={faBriefcase} /> All Jobs
          </Link>
        </li>
        <li>
          <Link to="/post-job" className="sidebar-link">
            <FontAwesomeIcon icon={faPlusCircle} /> Post Job
          </Link>
        </li>
        <li>
          <Link to="/all-services-products" className="sidebar-link">
            <FontAwesomeIcon icon={faCogs} /> All Business
          </Link>
        </li>
        <li>
          <Link to="/post-service-product" className="sidebar-link">
            <FontAwesomeIcon icon={faPlusCircle} /> Post Your Business
          </Link>
        </li>

        <li>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ border: 'none', background: 'transparent' }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
