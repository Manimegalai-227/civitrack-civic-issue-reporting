import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIssues } from '../services/api';
import IssueCard from '../components/IssueCard';

const Home = () => {
  const navigate = useNavigate();
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await getIssues();
        if (res.success && res.data) {
          const all = res.data;
          setRecentIssues(all.slice(0, 3));

          const resolvedCount = all.filter((i) => i.status === 'Resolved').length;
          const progressCount = all.filter((i) => i.status === 'In Progress').length;
          const pendingCount = all.filter((i) => i.status === 'Pending').length;

          setStats({
            total: all.length,
            resolved: resolvedCount,
            inProgress: progressCount,
            pending: pendingCount,
          });
        }
      } catch (err) {
        console.error('Error fetching home issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-inner">
          <span className="case-tag">CASE NO. 00184 &mdash; CITY OF MADURAI</span>
          <h1>
            Every civic issue
            <br />
            gets a paper trail.
          </h1>
          <p>
            Report a pothole, a broken streetlight, a garbage pile-up &mdash; it
            gets an official case number, a routed department, and a transparent
            public timeline until it's resolved.
          </p>
          <div className="hero-actions">
            <button className="btn" onClick={() => navigate('/report')}>
              File a Report
            </button>
            <button
              className="btn ghost"
              onClick={() => navigate('/issues')}
            >
              Browse Open Cases
            </button>
          </div>
        </div>

        <div className="ticket-stub" aria-hidden="true">
          <div className="stub-row">
            <span>OFFICIAL RECEIPT</span>
            <span>MADURAI CORP</span>
          </div>
          <div className="stub-row">
            <span>DATE</span>
            <span>{new Date().toLocaleDateString('en-GB')}</span>
          </div>
          <div className="stub-row">
            <span>STATUS</span>
            <span style={{ color: 'var(--amber)', fontWeight: 'bold' }}>
              REGISTERED
            </span>
          </div>
          <div className="perforation"></div>
          <div className="stub-row small">
            <span>KEEP THIS RECEIPT &bull; CV-2026-TRACK</span>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Bar */}
      <section className="stats">
        <div className="stat">
          <strong>{loading ? '...' : stats.total || 6}</strong>
          <span>Cases Filed</span>
        </div>
        <div className="stat">
          <strong>{loading ? '...' : stats.resolved || 2}</strong>
          <span>Cases Resolved</span>
        </div>
        <div className="stat">
          <strong>{loading ? '...' : stats.inProgress || 2}</strong>
          <span>In Progress</span>
        </div>
        <div className="stat">
          <strong>{loading ? '...' : stats.pending || 2}</strong>
          <span>Pending Action</span>
        </div>
      </section>

      {/* How a Case Moves */}
      <section id="how" className="how">
        <h2>How a Case Moves</h2>
        <div className="steps">
          <div className="step">
            <span className="step-no">01</span>
            <h3>Report</h3>
            <p>
              Citizen submits an issue with location, category, and an optional
              photo. A permanent case number is generated immediately.
            </p>
          </div>
          <div className="step">
            <span className="step-no">02</span>
            <h3>Route</h3>
            <p>
              The system automatically classifies and routes the issue to the
              appropriate municipal department for field dispatch.
            </p>
          </div>
          <div className="step">
            <span className="step-no">03</span>
            <h3>Resolve</h3>
            <p>
              Municipal crews address the concern on the ground. Once verified,
              the status updates to Resolved on the public ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Cases Preview */}
      <section className="cases-container" style={{ paddingTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '20px',
          }}
        >
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h2>Recent Community Reports</h2>
            <p>Live civic reports from citizens across Madurai districts</p>
          </div>
          <Link
            to="/issues"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--ink)',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            View all cases &rarr;
          </Link>
        </div>

        {recentIssues.length > 0 ? (
          <div className="grid">
            {recentIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            No recent reports available.
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
