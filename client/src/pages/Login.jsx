import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from another page with message
  const redirectMessage = location.state?.message;

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
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

  const handleDemoFill = () => {
    setFormData({
      email: 'citizen@civi.track',
      password: 'password123',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate(location.state?.from || '/my-reports');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cases-container" style={{ maxWidth: '520px' }}>
      <div className="form-card">
        <div className="form-header">
          <h2>Citizen Login</h2>
          <p>Sign in to file reports and track resolution updates.</p>
        </div>

        {redirectMessage && (
          <Alert type="info" message={redirectMessage} onClose={() => {}} />
        )}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. citizen@madurai.gov.in"
              className={`form-input ${errors.email ? 'invalid' : ''}`}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`form-input ${errors.password ? 'invalid' : ''}`}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>

          <button
            type="button"
            className="demo-quickfill"
            onClick={handleDemoFill}
            title="Click to automatically fill demo citizen credentials"
          >
            &bull; Quick Demo Fill: citizen@civi.track
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
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--ink)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
