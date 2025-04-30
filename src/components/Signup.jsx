import { Link, useNavigate } from 'react-router-dom'
import './styles.css'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await signup(email, password)

      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('accessToken', res.user.accessToken)
      localStorage.setItem('userId', res.user.uid)
      navigate('/dashboard')
    } catch (error) {
      setError('Failed to sign up. Please check your credentials.')
      console.error(error)
    }
  }

  return (
    <section className="vh-100">
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid"
              alt="Sample image"
            />
          </div>
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <form onSubmit={handleSignup}>
              <div className="divider d-flex align-items-center my-4">
                <h3 className="text-center fw-bold mx-3 mb-0">Register</h3>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {/* <div data-mdb-input-init className="form-outline mb-4">
              <label className="form-label" htmlFor="form3Example3">
                  Name
                </label>
                <input
                  type="text"
                  id="form3Example3"
                  className="form-control form-control-lg"
                  placeholder="Enter full name"
                />
              </div> */}

              <div data-mdb-input-init className="form-outline mb-4">
                <label className="form-label" htmlFor="form3Example3">
                  Email address
                </label>
                <input
                  type="email"
                  id="form3Example3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="Enter a valid email address"
                />
              </div>

              <div data-mdb-input-init className="form-outline mb-3">
                <label className="form-label" htmlFor="form3Example4">
                  Password
                </label>
                <input
                  type="password"
                  id="form3Example4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="Enter password"
                />
              </div>

              <div className="text-center text-lg-start mt-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  Sign up
                </button>
                <p className="small fw-bold mt-2 pt-1 mb-0">
                  Already have an account?{' '}
                  <Link to="/" className="link-danger">
                    {' '}
                    {/* Use Link for navigation */}
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
