import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function AllJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchCollection, deleteDocument } = useAppContext();
  const { user, loading: authLoading } = useAuth(); // Get user from AuthContext

  const getJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if we have a user
      if (!user) {
        throw new Error('User not authenticated');
      }

      const allJobs = await fetchCollection('jobs');
      console.log('All jobs:', allJobs); // Debug log
      console.log('Current user UID:', user.uid); // Debug log
      
      // Filter jobs where uid matches current user
      const userJobs = allJobs.filter(job => job.uid === user.uid);
      console.log('Filtered jobs:', userJobs); // Debug log
      
      setJobs(userJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch jobs when auth is done loading and user is available
    if (!authLoading) {
      getJobs();
    }
  }, [user, authLoading]); // Add authLoading to dependencies

  const handleEditJob = (id) => {
    navigate(`/edit-job/${id}`);
  };

  const handleDeleteJob = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this job?');
    if (!confirmDelete) return;

    try {
      await deleteDocument('jobs', id);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    } catch (err) {
      console.error('Failed to delete job:', err);
      setError('Failed to delete job. Please try again.');
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
        <div className="alert alert-warning">Please login to view your jobs</div>
      </div>
    );
  }

  // Show loader while jobs are loading
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
        <h1 className="fw-bold mb-4">My Posted Jobs</h1>
        <div className="table-container mt-4">
          {jobs.length === 0 ? (
            <div className="alert alert-info">
              You haven't posted any jobs yet.
            </div>
          ) : (
            <table className="table table-bordered table-hover mt-4">
              <thead className="thead-dark">
                <tr>
                  <th>#</th>
                  <th>Job Name</th>
                  <th>Keywords</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={job.id}>
                    <td>{index + 1}</td>
                    <td>{job.job_name || 'N/A'}</td>
                    <td>{job.keywords || 'N/A'}</td>
                    <td>{job.location_info?.address || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleEditJob(job.id)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteJob(job.id)}
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