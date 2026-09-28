import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getIssues } from '../services/api';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

// Custom colored marker
function createColorMarker(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

// City coordinates for Tamil Nadu
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
  'Ambattur': [13.1143, 80.1548],
  'Kodambakkam': [13.0509, 80.2261],
};

function parseLocation(location) {
  for (const [city, coords] of Object.entries(cityCoords)) {
    if (location && location.includes(city)) {
      return [
        coords[0] + (Math.random() - 0.5) * 0.025,
        coords[1] + (Math.random() - 0.5) * 0.025,
      ];
    }
  }
  return [13.0827 + (Math.random() - 0.5) * 0.5, 80.2707 + (Math.random() - 0.5) * 0.5];
}

// Component to fly to selected issue
function FlyToIssue({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

const IssueMap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
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

  const handleCardClick = (issue) => {
    setSelected(issue);
    setFlyTo(issue.coords);
  };

  const openGoogleMaps = (location) => {
    const q = encodeURIComponent(location + ', Tamil Nadu, India');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 60px)', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>

      {/* ===== FULL SCREEN MAP ===== */}
      {loading ? (
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#e8e4d9', gap: '12px',
        }}>
          <div style={{ fontSize: '48px' }}>🗺️</div>
          <p style={{ fontFamily: 'var(--font-mono)', color: '#666' }}>Loading Google Maps view...</p>
        </div>
      ) : (
        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={11}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          {/* Google Maps Satellite-like tile */}
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />

          {flyTo && <FlyToIssue coords={flyTo} />}

          {filtered.map((issue) => (
            <Marker
              key={issue._id}
              position={issue.coords}
              icon={createColorMarker(statusColors[issue.status] || '#999')}
              eventHandlers={{ click: () => setSelected(issue) }}
            >
              <Popup>
                <div style={{ fontFamily: 'Arial, sans-serif', minWidth: '200px', fontSize: '13px' }}>
                  <div style={{
                    background: statusColors[issue.status],
                    color: '#fff',
                    padding: '6px 10px',
                    margin: '-14px -14px 10px',
                    borderRadius: '4px 4px 0 0',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '1px',
                  }}>
                    {issue.status.toUpperCase()} • {issue.caseNumber}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: '#1a1a1a' }}>
                    {categoryEmoji[issue.category]} {issue.title}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>
                    📍 {issue.location}
                  </div>
                  <button
                    onClick={() => openGoogleMaps(issue.location)}
                    style={{
                      background: '#1A73E8',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      width: '100%',
                    }}
                  >
                    📍 Open in Google Maps
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* ===== TOP BAR OVERLAY ===== */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(26,34,51,0.92)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '10px 20px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <span style={{ color: '#E7E3D9', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, marginRight: '4px' }}>
          🗺️ CIVITRACK MAP
        </span>
        {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px',
            borderRadius: '20px',
            border: '2px solid',
            borderColor: filter === f ? '#fff' : 'rgba(255,255,255,0.3)',
            background: filter === f
              ? f === 'Pending' ? '#FF3B30'
                : f === 'In Progress' ? '#FF9500'
                  : f === 'Resolved' ? '#34C759'
                    : '#fff'
              : 'transparent',
            color: filter === f ? '#fff' : 'rgba(255,255,255,0.8)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {f === 'All' ? `ALL (${stats.total})` : f === 'Pending' ? `🔴 PENDING (${stats.pending})` : f === 'In Progress' ? `🟠 ACTIVE (${stats.inProgress})` : `🟢 DONE (${stats.resolved})`}
          </button>
        ))}
      </div>

      {/* ===== RIGHT SIDEBAR — Issue List ===== */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '12px',
        bottom: '12px',
        width: '300px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowY: 'auto',
        paddingRight: '4px',
      }}>
        {filtered.map(issue => (
          <div
            key={issue._id}
            onClick={() => handleCardClick(issue)}
            style={{
              background: selected?._id === issue._id
                ? 'rgba(26,115,232,0.95)'
                : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              padding: '12px',
              cursor: 'pointer',
              boxShadow: selected?._id === issue._id
                ? '0 4px 20px rgba(26,115,232,0.5)'
                : '0 2px 12px rgba(0,0,0,0.15)',
              borderLeft: `4px solid ${statusColors[issue.status]}`,
              transition: 'all 0.2s ease',
              transform: selected?._id === issue._id ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: selected?._id === issue._id ? 'rgba(255,255,255,0.8)' : '#888',
              marginBottom: '4px',
              letterSpacing: '0.5px',
            }}>
              {issue.caseNumber} • {categoryEmoji[issue.category]}
            </div>
            <div style={{
              fontWeight: 700,
              fontSize: '13px',
              color: selected?._id === issue._id ? '#fff' : '#1a1a1a',
              marginBottom: '4px',
              lineHeight: 1.3,
            }}>
              {issue.title}
            </div>
            <div style={{
              fontSize: '11px',
              color: selected?._id === issue._id ? 'rgba(255,255,255,0.8)' : '#666',
              marginBottom: '8px',
            }}>
              📍 {issue.location}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{
                padding: '2px 10px',
                borderRadius: '12px',
                background: statusColors[issue.status],
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}>
                {issue.status.toUpperCase()}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); openGoogleMaps(issue.location); }}
                style={{
                  marginLeft: 'auto',
                  background: selected?._id === issue._id ? 'rgba(255,255,255,0.2)' : '#1A73E8',
                  color: '#fff',
                  border: 'none',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                📍 Maps
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== LEGEND ===== */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '12px',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#333' }}>MAP LEGEND</div>
        {[
          { color: '#FF3B30', label: 'Pending' },
          { color: '#FF9500', label: 'In Progress' },
          { color: '#34C759', label: 'Resolved' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              width: '12px', height: '12px', borderRadius: '50% 50% 50% 0',
              background: l.color, transform: 'rotate(-45deg)',
              display: 'inline-block', border: '2px solid white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
            <span style={{ color: '#333' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueMap;
