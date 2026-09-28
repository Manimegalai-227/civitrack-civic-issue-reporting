import React, { useEffect, useState } from 'react';
import { getIssues } from '../services/api';
import IssueCard from '../components/IssueCard';

const FILTER_BUTTONS = [
  { label: 'All Categories', value: 'all' },
  { label: 'Road', value: 'road' },
  { label: 'Streetlight', value: 'light' },
  { label: 'Garbage', value: 'garbage' },
  { label: 'Water', value: 'water' },
  { label: 'Drainage', value: 'drain' },
];

const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFilteredIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await getIssues(params);
      if (res.success && res.data) {
        setIssues(res.data);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredIssues();
  }, [activeCategory, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredIssues();
  };

  return (
    <div className="cases-container">
      <div className="page-header">
        <span className="case-tag">PUBLIC CIVIC DATABASE</span>
        <h2>All Civic Issues &amp; Cases</h2>
        <p>
          Browse public reports filed across municipal zones. Click any case card
          to inspect full progress details and departmental routing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-row">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by case no, title, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn" style={{ padding: '8px 18px' }}>
            Search
          </button>
        </form>

        <select
          className="select-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Category Pills matching reference project */}
      <div className="filter-bar">
        {FILTER_BUTTONS.map((btn) => (
          <button
            key={btn.value}
            className={activeCategory === btn.value ? 'active' : ''}
            onClick={() => setActiveCategory(btn.value)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--ink-soft)' }}>
          <p className="mono">Loading civic cases from MongoDB...</p>
        </div>
      ) : issues.length > 0 ? (
        <div className="grid">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
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
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>No civic cases match your filter criteria.</p>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
            Try resetting your filters or search keywords.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllIssues;
