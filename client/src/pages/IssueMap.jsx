import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getIssues } from '../services/api';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Status colors for circle markers
const statusColors = {
  'Pending': '#D98E04',
  'In Progress': '#2A5C8A',
  'Resolved': '#1E7A5F',
};

// Category icons mapping to emojis
const categoryEmoji = {
  'Road / Pothole': '🚧',
  'Streetlight': '💡',
  'Garbage': '🗑️',
  'Water Leak / Supply': '💧',
  'Drainage / Sewage': '🚰',
  'Other': '📌',
};

// Tamil Nadu city coordinates for sample mapping
const cityCoords = {
  'Chennai': [13.0827, 80.2707],
  'Madurai': [9.9252, 78.1198],
  'Coimbatore': [11.0168, 76.9558],
  'Trichy': [10.7905, 78.7047],
  'Salem': [11.6643, 78.1460],
  'Tambaram': [12.9249, 80.1000],
  'Velachery': [12.9816, 80.2209],
  'Anna Nagar': [13.0850, 80.2101],
  'Porur': [13.0358, 80.1574],
  'Adyar': [13.0012, 80.2565],
  'Perambur': [13.1167, 80.2333],
  'Nungambakkam': [13.0569, 80.2425],
  'KK Nagar': [13.0447, 80.1955],
  'T Nagar': [13.0418, 80.2341],
  'Pallavaram': [12.9675, 80.1491],
  'Chromepet': [12.9516, 80.1462],
  'Sholinganallur': [12.9009, 80.2276],
  'Virugambakkam': [13.0564, 80.1873],
  'Valasaravakkam': [13.0469, 80.1698],
  'Madipakkam': [12.9583, 80.2002],
};

// Parse location string to coordinates
function parseLocation(location) {
  for (const [city, coords] of Object.entries(cityCoords)) {
    if (location && location.includes(city)) {
      // Add small random offset so markers don't stack
      return [
        coords[0] + (Math.random() - 0.5) * 0.03,
        coords[1] + (Math.random() - 0.5) * 0.03,
      ];
    }
  }
  // Default: Tamil Nadu center with random offset
  return [11.1271 + (Math.random() - 0.5) * 2, 78.6569 + (Math.random() - 0.5) * 2];
}

const IssueMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await getIssues();
        if (res.success && res.data) {
          const mapped = res.data.map(issue => ({
            ...issue,
            coords: parseLocation(issue.location),
          }));
          setIssues(mapped);
          setStats({
            total: res.data.length,
            pending: res.data.filter(i => i.status === 'Pending').length,
            inProgress: res.data.filter(i => i.status === 'In Progress').length,
            resolved: res.data.filter(i => i.status === 'Resolved').length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-sans)' }}>
      {/* Page Header */}
      <div style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '40px 48px 30px',
        borderBottom: '4px solid var(--amber)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '2px',
          color: 'var(--amber)',
          textTransform: 'uppercase',
        }}>
          CIVIC ISSUE TRACKER — LIVE MAP VIEW
        </span>
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '2.2rem',
          fontWeight: 800,
          margin: '8px 0 6px',
          letterSpacing: '-1px',
        }}>
          🗺️ Issue Heat Map
        </h1>
        <p style={{ opacity: 0.7, fontSize: '14px', margin: 0 }}>
          Real-time visualization of all reported civic issues across Tamil Nadu
        </p>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          gap: '32px',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Total Issues', value: stats.total, color: '#fff' },
            { label: 'Pending', value: stats.pending, color: '#D98E04' },
            { label: 'In Progress', value: stats.inProgress, color: '#5BA3D9' },
            { label: 'Resolved', value: stats.resolved, color: '#2ECC8E' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {loading ? '...' : s.value}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginTop: '4px' }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--card)',
        padding: '16px 48px',
        borderBottom: '1px solid rgba(26,34,51,0.1)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-soft)', marginRight: '8px' }}>
          FILTER BY STATUS:
        </span>
        {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 18px',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: filter === f ? 'var(--ink)' : 'rgba(26,34,51,0.2)',
              background: filter === f ? 'var(--ink)' : 'transparent',
              color: filter === f ? 'var(--paper)' : 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px',
            }}
          >
            {f === 'Pending' && '🟡 '}
            {f === 'In Progress' && '🔵 '}
            {f === 'Resolved' && '🟢 '}
            {f === 'All' && '📍 '}
            {f.toUpperCase()}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-soft)' }}>
          {filtered.length} MARKERS SHOWN
        </span>
      </div>

      {/* Map Container */}
      <div style={{ position: 'relative' }}>
        {loading ? (
          <div style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e8e4d9',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ fontSize: '40px' }}>🗺️</div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)' }}>Loading map data...</p>
          </div>
        ) : (
          <MapContainer
            center={[11.1271, 78.6569]}
            zoom={7}
            style={{ height: '600px', width: '100%' }}
          >
            {/* Beautiful dark map tile */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {filtered.map((issue) => (
              <CircleMarker
                key={issue._id}
                center={issue.coords}
                radius={10}
                fillColor={statusColors[issue.status] || '#999'}
                color="#fff"
                weight={2}
                opacity={1}
                fillOpacity={0.85}
              >
                <Popup>
                  <div style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    minWidth: '220px',
                    fontSize: '12px',
                  }}>
                    <div style={{
                      background: '#1A2233',
                      color: '#E7E3D9',
                      padding: '8px 12px',
                      margin: '-14px -14px 10px',
                      borderRadius: '4px 4px 0 0',
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '1px',
                    }}>
                      {issue.caseNumber}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>{categoryEmoji[issue.category]} {issue.category}</strong>
                    </div>
                    <div style={{ marginBottom: '4px', fontWeight: 700, fontSize: '13px', color: '#1A2233' }}>
                      {issue.title}
                    </div>
                    <div style={{ color: '#666', marginBottom: '6px', fontSize: '11px' }}>
                      📍 {issue.location}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: statusColors[issue.status],
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                    }}>
                      {issue.status.toUpperCase()}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(26,34,51,0.92)',
          color: '#E7E3D9',
          padding: '14px 18px',
          borderRadius: '8px',
          zIndex: 1000,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '11px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>MAP LEGEND</div>
          {[
            { color: '#D98E04', label: 'Pending' },
            { color: '#2A5C8A', label: 'In Progress' },
            { color: '#1E7A5F', label: 'Resolved' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                width: '12px', height: '12px',
                borderRadius: '50%',
                background: l.color,
                display: 'inline-block',
                border: '2px solid rgba(255,255,255,0.4)',
              }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Issues List Below Map */}
      <div style={{ padding: '40px 48px' }}>
        <h2 style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: '1.4rem',
          marginBottom: '20px',
          color: 'var(--ink)',
        }}>
          📋 Mapped Issues ({filtered.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(issue => (
            <div key={issue._id} style={{
              background: 'var(--card)',
              border: '1px solid rgba(26,34,51,0.1)',
              borderLeft: `4px solid ${statusColors[issue.status]}`,
              borderRadius: '6px',
              padding: '16px',
              transition: 'box-shadow 0.2s',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--ink-soft)',
                marginBottom: '6px',
              }}>
                {issue.caseNumber} • {categoryEmoji[issue.category]} {issue.category}
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', marginBottom: '6px' }}>
                {issue.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>📍 {issue.location}</div>
              <div style={{
                marginTop: '10px',
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '12px',
                background: statusColors[issue.status],
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px',
              }}>
                {issue.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IssueMap;
