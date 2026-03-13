import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Info, Wind, Droplets, Volume2, Map as MapIcon } from 'lucide-react';
import { getMapData } from '../api';

const createCustomIcon = (color, value) => L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="background: ${color}; border: 2px solid white; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 10px ${color}">
           ${value}
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const getColor = (type, reading) => {
  if (!reading) return '#64748b';
  if (type === 'air') {
    const aqi = reading.aqi;
    if (aqi <= 100) return '#10b981';
    if (aqi <= 200) return '#fbbf24';
    if (aqi <= 300) return '#ef4444';
    return '#991b1b';
  }
  if (type === 'water') {
    const ph = reading.ph;
    if (ph >= 6.5 && ph <= 8.5) return '#10b981';
    if (ph >= 5.5 || ph <= 9.5) return '#fbbf24';
    return '#ef4444';
  }
  if (type === 'noise') {
    const laeq = reading.laeq;
    if (laeq <= 55) return '#10b981';
    if (laeq <= 75) return '#fbbf24';
    return '#ef4444';
  }
  return '#64748b';
};

const getStatus = (color) => {
  if (color === '#10b981') return 'Good';
  if (color === '#fbbf24') return 'Moderate';
  if (color === '#ef4444') return 'Poor';
  if (color === '#991b1b') return 'Severe';
  return 'N/A';
};

const PollutionMap = () => {
  const [activeTab, setActiveTab] = useState('air');
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMapData(activeTab).then(res => {
      if (res.ok) setMapData(res.data);
      else setMapData([]);
      setLoading(false);
    });
  }, [activeTab]);

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Map Header Tabs */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <MapIcon size={18} color="var(--accent-primary)" />
          Regional Monitoring Map
        </h3>
        
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
          <TabButton active={activeTab === 'air'} onClick={() => setActiveTab('air')} icon={<Wind size={14} />} label="Air" />
          <TabButton active={activeTab === 'water'} onClick={() => setActiveTab('water')} icon={<Droplets size={14} />} label="Water" />
          <TabButton active={activeTab === 'noise'} onClick={() => setActiveTab('noise')} icon={<Volume2 size={14} />} label="Noise" />
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.4)' }}>
            <span className="spinner"></span>
          </div>
        )}
        <MapContainer 
          center={[21.25, 81.62]}
          zoom={6} 
          style={{ height: '100%', width: '100%', background: '#0a0f1c' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {mapData.map(loc => {
            const r = loc.latestReading;
            const color = getColor(activeTab, r);
            const value = activeTab === 'air' ? r?.aqi?.toFixed(0)
              : activeTab === 'water' ? r?.ph?.toFixed(1)
              : r?.laeq?.toFixed(0);
            const statusLabel = getStatus(color);
            const param = activeTab === 'air' ? 'AQI' : activeTab === 'water' ? 'pH' : 'dB(A)';

            return (
              <React.Fragment key={loc.id}>
                <CircleMarker 
                  center={[loc.lat || 21.25, loc.lng || 81.62]}
                  radius={30}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.1, stroke: false }}
                />
                <Marker 
                  position={[loc.lat || 21.25, loc.lng || 81.62]} 
                  icon={createCustomIcon(color, value || '–')}
                >
                  <Popup className="custom-popup">
                    <div style={{ background: '#0f1523', color: 'white', padding: '12px', borderRadius: '8px', minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#94a3b8' }}>{loc.name}</h4>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b' }}>{loc.region?.name || ''}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{value || '—'}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{param}</span>
                        <span style={{ marginLeft: 'auto', background: color, color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase' }}>
                          {statusLabel}
                        </span>
                      </div>
                      {r && <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{new Date(r.timestamp).toLocaleString()}</p>}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
      
      {/* Map Legend */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div> Good</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }}></div> Moderate</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div> Poor</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#991b1b' }}></div> Severe</span>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
      background: active ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
      color: active ? '#60a5fa' : 'var(--text-secondary)',
      border: 'none', transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 500
    }}
  >
    {icon} {label}
  </button>
)

export default PollutionMap;
