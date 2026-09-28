import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = '/assets/default-issue.jpg';

const IssueCard = ({ issue }) => {
  const navigate = useNavigate();

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Determine suitable image path with category-aware fallback
  const getCardImage = () => {
    if (issue.image && issue.image.trim()) {
      return issue.image;
    }

    const cat = (issue.category || '').toLowerCase();
    const title = (issue.title || '').toLowerCase();

    if (cat.includes('water') || title.includes('water') || title.includes('leak') || title.includes('pipeline')) {
      return '/assets/water-leak.jpg';
    }
    if (cat.includes('garbage') || title.includes('garbage') || title.includes('waste')) {
      return '/assets/garbage.jpg';
    }
    if (cat.includes('light') || title.includes('light') || title.includes('lamp') || title.includes('pole')) {
      return '/assets/streetlight.jpg';
    }
    if (cat.includes('road') || title.includes('pothole') || title.includes('road') || title.includes('patch')) {
      return '/assets/pothole.jpg';
    }
    if (cat.includes('drain') || title.includes('drain') || title.includes('sewage') || title.includes('manhole')) {
      return '/assets/drainage.jpg';
    }

    return DEFAULT_IMAGE;
  };

  const imageSrc = getCardImage();

  return (
    <div className="card" onClick={() => navigate(`/issues/${issue._id}`)}>
      {/* Every issue card displays an image at the top with consistent size and aspect ratio */}
      <img
        src={imageSrc}
        alt={issue.title}
        className="card-img-thumb"
        onError={(e) => {
          if (!e.currentTarget.src.includes(DEFAULT_IMAGE)) {
            e.currentTarget.src = DEFAULT_IMAGE;
          }
        }}
      />

      <div className="card-top">
        <span className="card-case-no">{issue.caseNumber || 'CASE RECORD'}</span>
        <span className={`status-badge ${getStatusClass(issue.status)}`}>
          {issue.status}
        </span>
      </div>

      <h3>{issue.title}</h3>
      <p className="card-desc">{issue.description}</p>

      <div className="card-footer">
        <span className="card-location">
          📍 {issue.location}
        </span>
        <span className="card-date">{formatDate(issue.date || issue.createdAt)}</span>
      </div>
    </div>
  );
};

export default IssueCard;
