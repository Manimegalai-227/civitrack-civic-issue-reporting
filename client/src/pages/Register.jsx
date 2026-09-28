import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errs.name = 'Name should only contain alphabets';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.trim())) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'phone') {
      sanitized = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setAlert({
        type: 'success',
        message: 'Account registered successfully! Redirecting...',
      });

      setTimeout(() => {
        navigate('/my-reports');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cases-container" style={{ maxWidth: '520px' }}>
      <div className="form-card">
        <div className="form-header">
          <h2>Citizen Registration</h2>
          <p>Create a verified account to file civic reports in your area.</p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              className={`form-input ${errors.name ? 'invalid' : ''}`}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@example.com"
              className={`form-input ${errors.email ? 'invalid' : ''}`}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (10 digits)</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className={`form-input ${errors.phone ? 'invalid' : ''}`}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 6 characters)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              className={`form-input ${errors.password ? 'invalid' : ''}`}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`form-input ${errors.confirmPassword ? 'invalid' : ''}`}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Registering...' : 'Register Citizen Account'}
          </button>
        </form>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--ink-soft)',
          }}
        >
          Already registered?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--ink)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
