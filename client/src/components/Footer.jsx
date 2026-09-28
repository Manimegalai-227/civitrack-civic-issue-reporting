import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">
            CIVITRACK<span style={{ color: 'var(--amber)' }}>.</span>
          </div>
          <div className="footer-note">
            Crowdsourced Civic Issue Reporting &amp; Resolution System &mdash; City of Madurai
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#8a94a6' }}>
          &copy; {new Date().getFullYear()} CIVITRACK Portal. Designed for college full-stack demonstration.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
