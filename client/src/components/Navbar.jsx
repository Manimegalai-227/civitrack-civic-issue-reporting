import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-brand">
        <Link to="/" onClick={closeMenu} className="logo">
          CIVITRACK<span className="dot">.</span>
        </Link>
      </div>

      <nav>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          &#9776;
        </button>

        <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
          <li>
            <NavLink to="/" onClick={closeMenu}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/issues" onClick={closeMenu}>
              All Issues
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" onClick={closeMenu}>
              Report Issue
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" onClick={closeMenu}>
              🗺️ Map
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <NavLink to="/my-reports" onClick={closeMenu}>
                  My Reports
                </NavLink>
              </li>
              <li className="nav-user-badge">
                <span>{user?.name || 'Citizen'}</span>
                <button onClick={handleLogout} className="btn-nav-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" onClick={closeMenu}>
                  Login
                </NavLink>
              </li>
              <li>
                <Link to="/register" onClick={closeMenu} className="btn-nav-login">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
