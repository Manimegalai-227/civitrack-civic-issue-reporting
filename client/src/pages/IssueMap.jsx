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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await getIssues();
        if (res.success && res.data) {
          setIssues(res.data);
          if (res.data.length > 0) {
            setSelected(res.data[0]);
            updateMap(res.data[0].location);
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

  const updateMap = (location) => {
    const query = encodeURIComponent(location + ', Tamil Nadu, India');
    setMapSrc(`https://maps.google.com/maps?q=${query}&output=embed&z=15`);
  };

  const handleSelect = (issue) => {
    setSelected(issue);
    updateMap(issue.location);
  };

  const openGoogleMaps = (location) => {
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
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      {/* ============================= */}
      {/* GOOGLE MAPS — FULL BACKGROUND */}
      {/* ============================= */}
      <iframe
        key={mapSrc}
        src={mapSrc}
        title="Google Maps"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 0,
        }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* ============================= */}
      {/* FLOATING TOP BAR             */}
      {/* ============================= */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: sidebarOpen ? '330px' : '12px',
        right: '12px',
        zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'left 0.3s ease',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '18px' }}>🗺️</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '13px',
          color: '#1A2233',
          marginRight: '8px',
        }}>CIVITRACK MAP</span>

        {/* Filter pills */}
        {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: filter === f ? (statusColors[f] || '#1A2233') : 'rgba(0,0,0,0.15)',
            background: filter === f ? (statusColors[f] || '#1A2233') : 'rgba(255,255,255,0.8)',
            color: filter === f ? '#fff' : '#333',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {f === 'All' ? `📍 ALL (${stats.total})`
              : f === 'Pending' ? `🔴 PENDING (${stats.pending})`
              : f === 'In Progress' ? `🟠 ACTIVE (${stats.inProgress})`
              : `🟢 DONE (${stats.resolved})`}
          </button>
        ))}

        {/* Selected location open button */}
        {selected && (
          <button
            onClick={() => openGoogleMaps(selected.location)}
            style={{
              marginLeft: 'auto',
              background: '#1A73E8',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(26,115,232,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            🔗 Navigate in Google Maps
          </button>
        )}
      </div>

      {/* ============================= */}
      {/* FLOATING LEFT SIDEBAR        */}
      {/* ============================= */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: sidebarOpen ? '12px' : '-320px',
        bottom: '12px',
        width: '310px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        transition: 'left 0.3s ease',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>

        {/* Sidebar Header */}
        <div style={{
          background: 'rgba(17,24,39,0.97)',
          padding: '14px 14px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#D98E04', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
              ISSUE TRACKER
            </span>
            <button onClick={() => setSidebarOpen(false)} style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none', color: '#fff', borderRadius: '6px',
              width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px',
            }}>✕</button>
          </div>
          {/* Mini stats */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { v: stats.pending, c: '#FF3B30', l: 'Pending' },
              { v: stats.inProgress, c: '#FF9500', l: 'Active' },
              { v: stats.resolved, c: '#34C759', l: 'Resolved' },
            ].map(s => (
              <div key={s.l} style={{
                flex: 1, background: 'rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '6px', textAlign: 'center',
                borderBottom: `3px solid ${s.c}`,
              }}>
                <div style={{ color: s.c, fontWeight: 900, fontSize: '18px', lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', marginTop: '2px' }}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(17,24,39,0.94)',
          padding: '8px',
        }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '30px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              Loading issues...
            </div>
          ) : filtered.map(issue => (
            <div
              key={issue._id}
              onClick={() => handleSelect(issue)}
              style={{
                background: selected?._id === issue._id
                  ? 'rgba(26,115,232,0.25)'
                  : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${selected?._id === issue._id ? '#1A73E8' : 'rgba(255,255,255,0.07)'}`,
                borderLeft: `4px solid ${statusColors[issue.status]}`,
                borderRadius: '10px',
                padding: '11px',
                marginBottom: '7px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: selected?._id === issue._id ? 'translateX(3px)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
                  {issue.caseNumber}
                </span>
                <span style={{ fontSize: '14px' }}>{categoryEmoji[issue.category]}</span>
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '4px', lineHeight: 1.3 }}>
                {issue.title}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '8px', display: 'flex', gap: '4px' }}>
                <span>📍</span><span>{issue.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '10px',
                  background: statusColors[issue.status],
                  color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
                }}>
                  {issue.status.toUpperCase()}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); openGoogleMaps(issue.location); }}
                  style={{
                    marginLeft: 'auto',
                    background: '#1A73E8', color: '#fff',
                    border: 'none', padding: '3px 10px',
                    borderRadius: '6px', fontSize: '10px',
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  📍 Maps
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle sidebar button (when closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'absolute',
            top: '12px', left: '12px',
            zIndex: 100,
            background: 'rgba(17,24,39,0.92)',
            color: '#fff', border: 'none',
            padding: '10px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px', fontWeight: 700,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          📋 Issues
        </button>
      )}

      {/* ============================= */}
      {/* SELECTED ISSUE BOTTOM CARD   */}
      {/* ============================= */}
      {selected && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: sidebarOpen ? '340px' : '12px',
          right: '12px',
          zIndex: 100,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          borderLeft: `5px solid ${statusColors[selected.status]}`,
          transition: 'left 0.3s ease',
        }}>
          <span style={{ fontSize: '24px' }}>{categoryEmoji[selected.category]}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1A2233', marginBottom: '2px' }}>
              {selected.title}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              📍 {selected.location}
            </div>
          </div>
          <span style={{
            padding: '5px 14px', borderRadius: '20px',
            background: statusColors[selected.status],
            color: '#fff', fontSize: '11px', fontWeight: 700,
          }}>
            {selected.status}
          </span>
          <button
            onClick={() => openGoogleMaps(selected.location)}
            style={{
              background: '#1A73E8', color: '#fff',
              border: 'none', padding: '10px 20px',
              borderRadius: '10px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(26,115,232,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            🔗 Open in Google Maps
          </button>
        </div>
      )}
    </div>
  );
};

export default IssueMap;
