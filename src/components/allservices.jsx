import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import MainLayout from './mainlayout';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AllServices() {
  const { fetchCollection, deleteDocument } = useAppContext();
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if we have a user
      if (!user) {
        throw new Error('User not authenticated');
      }

      const allServices = await fetchCollection('services');
      console.log('All services:', allServices); // Debug log
      console.log('Current user UID:', user.uid); // Debug log
      
      // Filter services where uid matches current user
      const userServices = allServices.filter(service => service.uid === user.uid);
      console.log('Filtered services:', userServices); // Debug log
      
      setServices(userServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch services when auth is done loading and user is available
    if (!authLoading) {
      getServices();
    }
  }, [user, authLoading]);

  const handleEditService = (id) => {
    navigate(`/edit-service-product/${id}`);
  };

  const handleDeleteServices = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');
    if (!confirmDelete) return;

    try {
      await deleteDocument('services', id);
      setServices(prevServices => prevServices.filter(service => service.id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError('Failed to delete service. Please try again.');
    }
  };

  // Show loader while auth is loading
  if (authLoading) {
    return <Loader />;
  }

  // Show login message if no user
  if (!user) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning">Please login to view your services</div>
      </div>
    );
  }

  // Show loader while services are loading
  if (loading) {
    return <Loader />;
  }

  // Show error if any
  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (

      <div className="container-fluid p-4 h-100 m-2">
        <div className="p-4">
          <h1 className="fw-bold mb-4">My Posted Businesses</h1>
          <div className="table-container mt-4">
            {services.length === 0 ? (
              <div className="alert alert-info">
                You haven't posted any services or products yet.
              </div>
            ) : (
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Keywords</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service.id}>
                      <td>{index + 1}</td>
                      <td>{service.business_name || 'N/A'}</td>
                      <td>{service.keywords || 'N/A'}</td>
                      <td>{service.location_info?.address || 'N/A'}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleEditService(service.id)}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteServices(service.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

  );
}