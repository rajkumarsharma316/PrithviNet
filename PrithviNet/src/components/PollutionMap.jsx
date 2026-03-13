import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { ArrowRight, Info, Wind, Droplets, Volume2, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom icons using Leaflet divIcon
const createCustomIcon = (color, value) => L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="background: ${color}; border: 2px solid white; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 10px ${color}">
           ${value}
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

// Mock Data for Regional Offices & Stations
const mapData = {
  air: [
    { id: 1, name: 'Raipur HQ', lat: 21.2514, lng: 81.6296, value: 145, status: 'Moderate', color: '#fbbf24', param: 'AQI' },
    { id: 2, name: 'Bhilai Steel Plant Area', lat: 21.1938, lng: 81.3509, value: 210, status: 'Poor', color: '#ef4444', param: 'AQI' },
    { id: 3, name: 'Bilaspur RO', lat: 22.0797, lng: 82.1409, value: 85, status: 'Good', color: '#10b981', param: 'AQI' },
    { id: 4, name: 'Korba Industrial', lat: 22.3595, lng: 82.6824, value: 315, status: 'Severe', color: '#991b1b', param: 'AQI' },
  ],
  water: [
    { id: 1, name: 'Mahanadi River Monitor', lat: 21.2514, lng: 81.6296, value: 8.2, status: 'Good', color: '#10b981', param: 'pH' },
    { id: 2, name: 'Shivnath River (Durg)', lat: 21.1938, lng: 81.3509, value: 6.5, status: 'Moderate', color: '#fbbf24', param: 'pH' },
    { id: 4, name: 'Hasdeo River (Korba)', lat: 22.3595, lng: 82.6824, value: 5.8, status: 'Poor', color: '#ef4444', param: 'pH' },
  ],
  noise: [
    { id: 1, name: 'Raipur City Center', lat: 21.2514, lng: 81.6296, value: 78, status: 'Poor', color: '#ef4444', param: 'dB(A)' },
    { id: 2, name: 'Bhilai Industrial', lat: 21.1938, lng: 81.3509, value: 82, status: 'Severe', color: '#991b1b', param: 'dB(A)' },
    { id: 3, name: 'Bilaspur Residential', lat: 22.0797, lng: 82.1409, value: 55, status: 'Good', color: '#10b981', param: 'dB(A)' },
  ]
};

const PollutionMap = () => {
  const [activeTab, setActiveTab] = useState('air');
  const navigate = useNavigate();

  const handleDeepDive = (id) => {
    // In a real app we'd navigate to `/location/${id}`
    alert(`Navigating to detailed view for station ID: ${id}`);
  };

  const currentData = mapData[activeTab];

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Map Header Tabs */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        <MapContainer 
          center={[21.25, 81.62]} // Centered on Chhattisgarh
          zoom={6} 
          style={{ height: '100%', width: '100%', background: '#0a0f1c' }}
          zoomControl={false}
        >
          {/* Dark CartoDB basemap for premium feel */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Render markers for current tab */}
          {currentData.map(station => (
            <React.Fragment key={station.id}>
              {/* Fake heatmap glow using a circle marker underneath */}
              <CircleMarker 
                center={[station.lat, station.lng]}
                radius={30}
                pathOptions={{ color: station.color, fillColor: station.color, fillOpacity: 0.1, stroke: false }}
              />
              
              <Marker 
                position={[station.lat, station.lng]} 
                icon={createCustomIcon(station.color, station.value)}
              >
                <Popup className="custom-popup">
                  <div style={{ background: '#0f1523', color: 'white', padding: '12px', borderRadius: '8px', minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#94a3b8' }}>{station.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{station.value}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{station.param}</span>
                      <span style={{ marginLeft: 'auto', background: station.color, color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase' }}>
                        {station.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeepDive(station.id)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '12px' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <Info size={14} /> Show More Info
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
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
