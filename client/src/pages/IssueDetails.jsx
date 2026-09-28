import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, updateIssueStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getIssueById(id);
      if (res.success && res.data) {
        setIssue(res.data);
      } else {
        setAlert({ type: 'error', message: 'Issue record not found' });
      }
    } catch (err) {
      console.error('Error fetching issue:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load case details',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!isAuthenticated) {
      setAlert({
        type: 'error',
        message: 'Please login to update the case status.',
      });
      return;
    }

    try {
      setUpdatingStatus(true);
      const res = await updateIssueStatus(issue._id, newStatus);
      if (res.success && res.data) {
        setIssue(res.data);
        setAlert({
          type: 'success',
          message: `Status updated to "${newStatus}" successfully!`,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update status',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open Google Maps with location text
  const openGoogleMaps = (location) => {
    const query = encodeURIComponent(location + ', Tamil Nadu, India');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'status-resolved';
      case 'In Progress':
        return 'status-in-progress';
      case 'Pending':
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="cases-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p className="mono">Loading case file from ledger...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="cases-container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <Alert type="error" message="Civic Issue not found." />
        <button className="btn" onClick={() => navigate('/issues')}>
          &larr; Return to All Cases
        </button>
      </div>
    );
  }

  return (
    <div className="issue-details-container">
      <button
        onClick={() => navigate('/issues')}
        className="btn ghost"
        style={{ marginBottom: '20px', padding: '6px 14px', fontSize: '13px' }}
      >
        &larr; Back to Open Cases
      </button>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="case-sheet">
        <div className="case-sheet-header">
          <div>
            <span className="card-case-no">{issue.caseNumber} &bull; MUNICIPAL RECORD</span>
            <h1>{issue.title}</h1>
          </div>
          <span className={`status-badge stamp ${getStatusClass(issue.status)}`}>
            {issue.status}
          </span>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <strong>Category</strong>
            <span>{issue.category}</span>
          </div>
          <div className="meta-item">
            <strong>Location</strong>
            <span>{issue.location}</span>
            <a
              onClick={() => openGoogleMaps(issue.location)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                padding: '7px 14px',
                background: '#1A73E8',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(26,115,232,0.4)',
                transition: 'all 0.2s ease',
                border: 'none',
                width: 'fit-content',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#1557b0'}
              onMouseOut={e => e.currentTarget.style.background = '#1A73E8'}
            >
              <img
                src="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                alt="maps"
                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
              />
              📍 View on Google Maps
            </a>
          </div>
          <div className="meta-item">
            <strong>Department Routed</strong>
            <span>{issue.department || 'Civic Administration'}</span>
          </div>
          <div className="meta-item">
            <strong>Date Reported</strong>
            <span>{formatDate(issue.date || issue.createdAt)}</span>
          </div>
          <div className="meta-item">
            <strong>Reporter</strong>
            <span>{issue.reporterName || issue.reportedBy?.name || 'Citizen'}</span>
          </div>
          <div className="meta-item">
            <strong>Reporter Contact</strong>
            <span>{issue.reporterContact || issue.reportedBy?.phone || 'Not specified'}</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Issue Description</h3>
        <div className="case-description">
          <p>{issue.description}</p>
        </div>

        <div className="case-photo-container">
          <h4>EVIDENCE PHOTOGRAPH</h4>
          <img
            src={issue.image || '/assets/default-issue.jpg'}
            alt={issue.title}
            className="case-photo"
            onError={(e) => {
              if (!e.currentTarget.src.includes('default-issue.jpg')) {
                e.currentTarget.src = '/assets/default-issue.jpg';
              }
            }}
          />
        </div>

        {/* Status Updater for Demonstration */}
        <div className="status-changer">
          <label htmlFor="status-select">Update Case Status:</label>
          <select
            id="status-select"
            value={issue.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="form-select"
            style={{ width: 'auto', flex: 1, maxWidth: '240px' }}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
            (Changes sync live to MongoDB)
          </span>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
