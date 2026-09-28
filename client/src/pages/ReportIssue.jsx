import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIssue } from '../services/api';
import Alert from '../components/Alert';

const CATEGORIES = [
  'Road / Pothole',
  'Streetlight',
  'Garbage',
  'Water Leak / Supply',
  'Drainage / Sewage',
  'Other',
];

const ReportIssue = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    status: 'Pending',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [createdCase, setCreatedCase] = useState(null);

  const validate = () => {
    const errs = {};

    if (!formData.title.trim()) {
      errs.title = 'Issue title is required';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long';
    }

    if (!formData.category) {
      errs.category = 'Please select a category';
    }

    if (!formData.location.trim()) {
      errs.location = 'Location / Landmark is required';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please describe the civic issue';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description should be at least 10 characters long';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          type: 'error',
          message: 'Image size exceeds 5MB limit. Please choose a smaller photo.',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!isAuthenticated) {
      setAlert({
        type: 'error',
        message: 'You must be logged in to submit a civic report. Please sign in or register.',
      });
      return;
    }

    if (!validate()) {
      setAlert({
        type: 'error',
        message: 'Please resolve the highlighted form fields before submitting.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('description', formData.description);
      data.append('status', formData.status);

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await createIssue(data);

      if (res.success && res.data) {
        setCreatedCase(res.data);
        setAlert({
          type: 'success',
          message: res.message || `Case ${res.data.caseNumber} filed successfully!`,
        });

        // Reset form
        setFormData({
          title: '',
          category: '',
          location: '',
          description: '',
          status: 'Pending',
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit report';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cases-container" style={{ maxWidth: '650px' }}>
      <div className="form-card">
        <div className="form-header">
          <span className="case-tag">OFFICIAL CIVIC DISPATCH</span>
          <h2>File a Report</h2>
          <p>
            Submit an infrastructure issue. You'll receive a unique case receipt to track updates in real-time.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="alert alert-info">
            Notice: Please{' '}
            <Link to="/login" state={{ from: '/report' }} style={{ fontWeight: 700, textDecoration: 'underline' }}>
              Sign In
            </Link>{' '}
            or{' '}
            <Link to="/register" style={{ fontWeight: 700, textDecoration: 'underline' }}>
              Register
            </Link>{' '}
            first so your report is tied to your citizen profile.
          </div>
        )}

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {createdCase && (
          <div
            className="ticket-stub"
            style={{ marginBottom: '25px', background: '#fff' }}
          >
            <div className="stub-row">
              <span>RECORD CREATED</span>
              <span>{createdCase.caseNumber}</span>
            </div>
            <div className="stub-row">
              <span>DEPARTMENT</span>
              <span>{createdCase.department}</span>
            </div>
            <div className="stub-row">
              <span>STATUS</span>
              <span style={{ color: 'var(--amber)', fontWeight: 'bold' }}>
                {createdCase.status}
              </span>
            </div>
            <div className="perforation"></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                onClick={() => navigate(`/issues/${createdCase._id}`)}
              >
                View Case Receipt
              </button>
              <button
                type="button"
                className="btn ghost"
                style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                onClick={() => setCreatedCase(null)}
              >
                File Another Issue
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Deep Pothole on Main Bridge Road"
              maxLength={120}
              className={`form-input ${errors.title ? 'invalid' : ''}`}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? 'invalid' : ''}`}
            >
              <option value="">-- Select Issue Category --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error">{errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location / Landmark *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Main Bridge Road, near Central Bus Stand"
              maxLength={200}
              className={`form-input ${errors.location ? 'invalid' : ''}`}
            />
            {errors.location && (
              <span className="field-error">{errors.location}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Initial Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Pending">Pending (Default)</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue, hazards caused, and how long it has been present..."
              maxLength={1500}
              className={`form-textarea ${errors.description ? 'invalid' : ''}`}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>Attach Evidence Photo (Optional)</label>
            {!imagePreview ? (
              <label className="file-dropzone" htmlFor="image-input">
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📷</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  Click to select photo or drag here
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                  PNG, JPG, WEBP up to 5MB
                </div>
                <input
                  type="file"
                  id="image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div className="file-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={handleRemoveImage}
                  title="Remove photo"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={submitting}
          >
            {submitting ? 'Transmitting Report...' : 'Submit Civic Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
