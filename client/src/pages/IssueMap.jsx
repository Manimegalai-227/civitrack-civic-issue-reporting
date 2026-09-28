import React, { useEffect, useState } from 'react';
import { getIssues } from '../services/api';

const statusColors = {
  'Pending': '#FF3B30',
  'In Progress': '#FF9500',
  'Resolved': '#34C759',
};

const categoryEmoji = {
  'Road / Pothole': '🚧',
  'Streetlight': '💡',
  'Garbage': '🗑️',
  'Water Leak / Supply': '💧',
  'Drainage / Sewage': '🚰',
  'Other': '📌',
};

const IssueMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [mapSrc, setMapSrc] = useState(
    'https://maps.google.com/maps?q=Chennai,Tamil+Nadu,India&output=embed&z=12'
  );

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await getIssues();
        if (res.success && res.data) {
          setIssues(res.data);
          // Auto-select first issue
          if (res.data.length > 0) {
            const first = res.data[0];
            setSelected(first);
            loadMap(first.location);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const loadMap = (location) => {
    const query = encodeURIComponent(location + ', Tamil Nadu, India');
    setMapSrc(`https://maps.google.com/maps?q=${query}&output=embed&z=15`);
  };

  const handleSelect = (issue) => {
    setSelected(issue);
    loadMap(issue.location);
  };

  const openInGoogleMaps = (location) => {
    const q = encodeURIComponent(location + ', Tamil Nadu, India');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 60px)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>

      {/* ===== LEFT SIDEBAR ===== */}
      <div style={{
        width: '360px',
        minWidth: '360px',
        background: '#1A2233',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 16px 12px',
          background: '#111827',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            color: '#D98E04',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            CIVITRACK • LIVE ISSUE MAP
          </div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>
            🗺️ Issue Location Tracker
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Total', value: stats.total, color: '#fff' },
              { label: 'Pending', value: stats.pending, color: '#FF3B30' },
              { label: 'Active', value: stats.inProgress, color: '#FF9500' },
              { label: 'Done', value: stats.resolved, color: '#34C759' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px', padding: '8px 4px', textAlign: 'center',
              }}>
                <div style={{ color: s.color, fontWeight: 900, fontSize: '20px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', marginTop: '3px', letterSpacing: '0.5px' }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1.5px solid',
                borderColor: filter === f ? statusColors[f] || '#fff' : 'rgba(255,255,255,0.2)',
                background: filter === f ? (statusColors[f] || 'rgba(255,255,255,0.15)') : 'transparent',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Issue List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Loading issues...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px', fontSize: '12px' }}>
              No issues found.
            </div>
          ) : (
            filtered.map(issue => (
              <div
                key={issue._id}
                onClick={() => handleSelect(issue)}
                style={{
                  background: selected?._id === issue._id
                    ? 'rgba(26,115,232,0.3)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${selected?._id === issue._id ? '#1A73E8' : 'rgba(255,255,255,0.08)'}`,
                  borderLeft: `4px solid ${statusColors[issue.status]}`,
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: selected?._id === issue._id ? 'translateX(4px)' : 'none',
                }}
              >
                {/* Case number + category */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '6px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px',
                  }}>
                    {issue.caseNumber}
                  </span>
                  <span style={{ fontSize: '16px' }}>{categoryEmoji[issue.category]}</span>
                </div>

                {/* Title */}
                <div style={{
                  color: '#fff', fontWeight: 700, fontSize: '13px',
                  marginBottom: '5px', lineHeight: 1.3,
                }}>
                  {issue.title}
                </div>

                {/* Location */}
                <div style={{
                  color: 'rgba(255,255,255,0.55)', fontSize: '11px',
                  marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '4px',
                }}>
                  <span>📍</span>
                  <span>{issue.location}</span>
                </div>

                {/* Status + Open Maps button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px',
                    background: statusColors[issue.status],
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}>
                    {issue.status.toUpperCase()}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openInGoogleMaps(issue.location); }}
                    style={{
                      marginLeft: 'auto',
                      background: '#1A73E8',
                      color: '#fff', border: 'none',
                      padding: '4px 12px', borderRadius: '6px',
                      fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    📍 Open Maps
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== RIGHT — REAL GOOGLE MAPS IFRAME ===== */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>

        {/* Selected issue banner */}
        {selected && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            zIndex: 100,
            background: 'rgba(26,34,51,0.88)',
            backdropFilter: 'blur(10px)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: `3px solid ${statusColors[selected.status]}`,
          }}>
            <span style={{ fontSize: '20px' }}>{categoryEmoji[selected.category]}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#fff', fontWeight: 700, fontSize: '14px',
              }}>
                {selected.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                📍 {selected.location}
              </div>
            </div>
            <span style={{
              padding: '4px 14px', borderRadius: '20px',
              background: statusColors[selected.status],
              color: '#fff', fontSize: '11px', fontWeight: 700,
            }}>
              {selected.status}
            </span>
            <button
              onClick={() => openInGoogleMaps(selected.location)}
              style={{
                background: '#1A73E8', color: '#fff',
                border: 'none', padding: '8px 16px',
                borderRadius: '8px', fontSize: '12px',
                fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 8px rgba(26,115,232,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              🔗 Open Full Google Maps
            </button>
          </div>
        )}

        {/* Real Google Maps Embed */}
        <iframe
          key={mapSrc}
          src={mapSrc}
          title="Google Maps"
          width="100%"
          height="100%"
          style={{
            border: 'none',
            flex: 1,
            marginTop: selected ? '57px' : '0',
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default IssueMap;
