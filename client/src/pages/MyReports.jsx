import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyReports, deleteIssue } from '../services/api';
import Alert from '../components/Alert';

const MyReports = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      const res = await getMyReports();
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Error fetching my reports:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load your reports',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserReports();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleDelete = async (id, caseNumber) => {
    if (!window.confirm(`Are you sure you want to delete case ${caseNumber}?`)) {
      return;
    }

    try {
      const res = await deleteIssue(id);
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Case ${caseNumber} deleted successfully.`,
        });
        setReports((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete report',
      });
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="cases-container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <div className="form-card" style={{ textAlign: 'center' }}>
          <h2>Citizen Authentication Required</h2>
          <p style={{ margin: '14px 0 24px', color: 'var(--ink-soft)' }}>
            Please log in to your account to view your filed civic complaints and resolution history.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/login" state={{ from: '/my-reports' }} className="btn">
              Sign In
            </Link>
            <Link to="/register" className="btn ghost">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    progress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  };

  return (
    <div className="my-reports-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="page-header" style={{ marginBottom: 0 }}>
          <span className="case-tag">CITIZEN RECORD DOSSIER</span>
          <h2>My Filed Reports</h2>
          <p>Logged in as: <strong>{user?.name}</strong> ({user?.email})</p>
        </div>
        <Link to="/report" className="btn" style={{ padding: '8px 18px', fontSize: '13px' }}>
          + Submit New Report
        </Link>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="reports-summary">
        <div className="summary-card">
          <strong>{counts.total}</strong>
          <span>Total Filed</span>
        </div>
        <div className="summary-card">
          <strong style={{ color: 'var(--amber)' }}>{counts.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="summary-card">
          <strong style={{ color: 'var(--progress)' }}>{counts.progress}</strong>
          <span>In Progress</span>
        </div>
        <div className="summary-card">
          <strong style={{ color: 'var(--resolved)' }}>{counts.resolved}</strong>
          <span>Resolved</span>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="mono">Loading your submitted cases...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Case No</th>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{r.caseNumber}</td>
                  <td>
                    <strong>{r.title}</strong>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.location}</td>
                  <td className="mono" style={{ fontSize: '12px' }}>{formatDate(r.date || r.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => navigate(`/issues/${r._id}`)}
                        className="btn ghost"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(r._id, r.caseNumber)}
                        className="btn-danger"
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--card)',
            border: '1.5px dashed var(--rule)',
            padding: '40px 20px',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <h3>You haven't filed any civic complaints yet.</h3>
          <p style={{ margin: '10px 0 20px', color: 'var(--ink-soft)' }}>
            Notice a broken streetlight or pothole in your neighborhood? Submit it with proof.
          </p>
          <Link to="/report" className="btn">
            File a Report Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyReports;
