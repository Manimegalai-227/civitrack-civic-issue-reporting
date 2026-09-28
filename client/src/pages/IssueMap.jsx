import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState('m'); // 'm' = roadmap, 'k' = satellite, 'p' = terrain
  const [zoomLevel, setZoomLevel] = useState(15);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapSrc, setMapSrc] = useState(
    'https://maps.google.com/maps?q=Madurai,Tamil+Nadu,India&t=m&z=13&output=embed'
  );

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await getIssues();
        if (res.success && res.data) {
          setIssues(res.data);
          if (res.data.length > 0) {
            setSelected(res.data[0]);
            updateMap(res.data[0].location, mapType, zoomLevel);
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

  const updateMap = (location, type = mapType, zoom = zoomLevel) => {
    const query = encodeURIComponent(location + ', Tamil Nadu, India');
    setMapSrc(`https://maps.google.com/maps?q=${query}&t=${type}&z=${zoom}&output=embed`);
  };

  const handleSelect = (issue) => {
    setSelected(issue);
    updateMap(issue.location, mapType, zoomLevel);
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
    if (selected) {
      updateMap(selected.location, type, zoomLevel);
    } else {
      setMapSrc(`https://maps.google.com/maps?q=Madurai,Tamil+Nadu,India&t=${type}&z=${zoomLevel}&output=embed`);
    }
  };

  const handleZoomChange = (delta) => {
    const newZoom = Math.min(Math.max(zoomLevel + delta, 10), 19);
    setZoomLevel(newZoom);
    if (selected) {
      updateMap(selected.location, mapType, newZoom);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = encodeURIComponent(searchQuery + ', Tamil Nadu, India');
    setMapSrc(`https://maps.google.com/maps?q=${query}&t=${mapType}&z=15&output=embed`);
  };

  const openGoogleMaps = (location) => {
    const q = encodeURIComponent(location + ', Tamil Nadu, India');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const openWorkerDirections = (location) => {
    const dest = encodeURIComponent(location + ', Tamil Nadu, India');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const filtered = issues.filter(i => {
    const matchesStatus = filter === 'All' || i.status === filter;
    const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.caseNumber && i.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 65px)', overflow: 'hidden', background: '#111827' }}>

      {/* ========================================= */}
      {/* FULL-SCREEN REAL GOOGLE MAPS BACKGROUND   */}
      {/* ========================================= */}
      <iframe
        key={mapSrc}
        src={mapSrc}
        title="Google Maps Civic Tracker"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          zIndex: 0,
        }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* ========================================= */}
      {/* TOP FLOATING SEARCH & FILTER BAR          */}
      {/* ========================================= */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: sidebarOpen ? '340px' : '16px',
        right: '16px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Main Search & Map Controls */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.92)',
          backdropFilter: 'blur(16px)',
          borderRadius: '14px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          flexWrap: 'wrap',
        }}>
          {/* Logo Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🗺️</span>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 900,
              fontSize: '13px',
              color: '#FFCC00',
              letterSpacing: '1px',
            }}>
              CIVITRACK RADAR
            </span>
          </div>

          {/* Location Search Bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="🔍 Search issue location, area, or case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </form>

          {/* Map Layer Switchers (Roadmap, Satellite, Terrain) */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => handleMapTypeChange('m')}
              style={{
                background: mapType === 'm' ? '#2563EB' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Standard Street Map"
            >
              🗺️ Map
            </button>
            <button
              onClick={() => handleMapTypeChange('k')}
              style={{
                background: mapType === 'k' ? '#2563EB' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Satellite Photo View"
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => handleMapTypeChange('p')}
              style={{
                background: mapType === 'p' ? '#2563EB' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Terrain Topo View"
            >
              ⛰️ Terrain
            </button>
          </div>

          {/* Zoom Buttons */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              onClick={() => handleZoomChange(1)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => handleZoomChange(-1)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
              title="Zoom Out"
            >
              -
            </button>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => navigate('/report')}
            style={{
              background: '#E11D48',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(225,29,72,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            ➕ Report Issue
          </button>
        </div>

        {/* Status Filter Badges */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}>
          {['All', 'Pending', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '30px',
                border: `1.5px solid ${filter === st ? (statusColors[st] || '#FFCC00') : 'rgba(255,255,255,0.2)'}`,
                background: filter === st ? (statusColors[st] || '#FFCC00') : 'rgba(17, 24, 39, 0.85)',
                color: filter === st ? (st === 'All' ? '#000' : '#fff') : '#e2e8f0',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {st === 'All' ? `📍 ALL ISSUES (${stats.total})`
                : st === 'Pending' ? `🔴 PENDING (${stats.pending})`
                : st === 'In Progress' ? `🟠 IN PROGRESS (${stats.inProgress})`
                : `🟢 RESOLVED (${stats.resolved})`}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* FLOATING LEFT SIDEBAR DRAWER              */}
      {/* ========================================= */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: sidebarOpen ? '16px' : '-340px',
        bottom: '16px',
        width: '310px',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15, 23, 42, 0.98)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#FFCC00', fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
                MADURAI CIVIC LEDGER
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
                Select issue to view exact GPS map
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                width: '26px',
                height: '26px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Mini Dashboard Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderBottom: '3px solid #EF4444', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
              <div style={{ color: '#EF4444', fontWeight: 900, fontSize: '16px' }}>{stats.pending}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 700 }}>PENDING</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderBottom: '3px solid #F59E0B', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
              <div style={{ color: '#F59E0B', fontWeight: 900, fontSize: '16px' }}>{stats.inProgress}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 700 }}>ACTIVE</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderBottom: '3px solid #10B981', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
              <div style={{ color: '#10B981', fontWeight: 900, fontSize: '16px' }}>{stats.resolved}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 700 }}>RESOLVED</div>
            </div>
          </div>
        </div>

        {/* Issue Cards Scrollable List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px', fontSize: '12px' }}>
              Loading civic reports...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px', fontSize: '12px' }}>
              No issues matching current filters.
            </div>
          ) : (
            filtered.map((issue) => {
              const isSelected = selected?._id === issue._id;
              return (
                <div
                  key={issue._id}
                  onClick={() => handleSelect(issue)}
                  style={{
                    background: isSelected ? 'rgba(37, 99, 235, 0.28)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${isSelected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                    borderLeft: `4px solid ${statusColors[issue.status] || '#FFCC00'}`,
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'translateX(4px)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#93C5FD', fontWeight: 700 }}>
                      {issue.caseNumber || 'CASE-001'}
                    </span>
                    <span style={{ fontSize: '14px' }}>{categoryEmoji[issue.category] || '📌'}</span>
                  </div>

                  <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '13px', marginBottom: '6px', lineHeight: 1.3 }}>
                    {issue.title}
                  </div>

                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.location}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '6px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: statusColors[issue.status] || '#666',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 800,
                    }}>
                      {issue.status.toUpperCase()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWorkerDirections(issue.location);
                      }}
                      style={{
                        background: '#2563EB',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Navigate Worker directly via Google Maps"
                    >
                      🚀 Route
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Button to open sidebar if closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'absolute',
            top: '12px',
            left: '16px',
            zIndex: 60,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📋 Cases ({filtered.length})
        </button>
      )}

      {/* ========================================= */}
      {/* FLOATING SELECTED ISSUE BOTTOM HUD CARD   */}
      {/* ========================================= */}
      {selected && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: sidebarOpen ? '340px' : '16px',
          right: '16px',
          zIndex: 50,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderLeft: `6px solid ${statusColors[selected.status] || '#3B82F6'}`,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            fontSize: '32px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {categoryEmoji[selected.category] || '📌'}
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#93C5FD', fontWeight: 800 }}>
                {selected.caseNumber || 'CASE-001'}
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                background: statusColors[selected.status] || '#666',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
              }}>
                {selected.status}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                Dept: {selected.department || 'Public Works'}
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF', marginBottom: '2px' }}>
              {selected.title}
            </div>

            <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📍</span>
              <strong>{selected.location}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/issues/${selected._id}`)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📄 Case Details
            </button>

            <button
              onClick={() => openWorkerDirections(selected.location)}
              style={{
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
              }}
            >
              🧭 Worker GPS Route
            </button>

            <button
              onClick={() => openGoogleMaps(selected.location)}
              style={{
                background: '#10B981',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
              }}
            >
              🌐 Open Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueMap;
