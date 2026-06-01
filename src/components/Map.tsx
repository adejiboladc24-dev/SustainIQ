import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Recycle, Leaf, Sun, Droplets, ShoppingBag, MapPin } from 'lucide-react';
import { useSustainIQ } from '../context/SustainIQContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type AssetType = 'recycling' | 'organic' | 'solar' | 'water' | 'market';

interface EcoAsset {
  id: string;
  name: string;
  type: AssetType;
  lat: number;
  lng: number;
  description: string;
  address: string;
}

const ASSET_CONFIG: Record<AssetType, { color: string; label: string; icon: React.ReactNode }> = {
  recycling: { color: '#3b82f6', label: 'Recycling Hub', icon: <Recycle className="w-3.5 h-3.5" /> },
  organic: { color: '#10b981', label: 'Organic Market', icon: <Leaf className="w-3.5 h-3.5" /> },
  solar: { color: '#f59e0b', label: 'Solar Facility', icon: <Sun className="w-3.5 h-3.5" /> },
  water: { color: '#06b6d4', label: 'Water Station', icon: <Droplets className="w-3.5 h-3.5" /> },
  market: { color: '#8b5cf6', label: 'Eco Market', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
};

const LAGOS_ASSETS: EcoAsset[] = [
  { id: 'l1', name: 'Wecyclers Lagos Hub', type: 'recycling', lat: 6.5244, lng: 3.3792, description: 'Community recycling collection and drop-off center', address: 'Yaba, Lagos' },
  { id: 'l2', name: 'Tejuosho Organic Market', type: 'organic', lat: 6.5158, lng: 3.3694, description: 'Fresh organic produce from local farms', address: 'Surulere, Lagos' },
  { id: 'l3', name: 'Lagos Solar Initiative', type: 'solar', lat: 6.4281, lng: 3.4219, description: 'Renewable energy installation and consultation hub', address: 'Victoria Island, Lagos' },
  { id: 'l4', name: 'Lekki Water Harvest Station', type: 'water', lat: 6.4698, lng: 3.5852, description: 'Rainwater harvesting and purification facility', address: 'Lekki, Lagos' },
  { id: 'l5', name: 'Balogun Eco Market', type: 'market', lat: 6.4541, lng: 3.3947, description: 'Sustainable goods and zero-waste products market', address: 'Lagos Island' },
  { id: 'l6', name: 'Alimosho Recycling Center', type: 'recycling', lat: 6.6018, lng: 3.2580, description: 'E-waste and plastic recycling facility', address: 'Alimosho, Lagos' },
  { id: 'l7', name: 'Ikeja Organic Hub', type: 'organic', lat: 6.5954, lng: 3.3378, description: 'Certified organic food cooperative', address: 'Ikeja, Lagos' },
  { id: 'l8', name: 'Eko Solar Park', type: 'solar', lat: 6.5833, lng: 3.7500, description: 'Large-scale solar energy generation facility', address: 'Epe, Lagos' },
];

const CITY_COORDS: Record<string, [number, number]> = {
  lagos: [6.5244, 3.3792],
  abuja: [9.0765, 7.3986],
  london: [51.5074, -0.1278],
  'new york': [40.7128, -74.006],
  nairobi: [-1.2921, 36.8219],
  accra: [5.6037, -0.187],
};

const createMarkerIcon = (type: AssetType) => {
  const { color } = ASSET_CONFIG[type];
  return L.divIcon({
    html: `<div style="
      background:${color};
      width:28px;height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    className: '',
  });
};

const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center, map]);
  return null;
};

export const Map: React.FC = () => {
  const { profile, portfolioMode } = useSustainIQ();
  const [activeFilter, setActiveFilter] = useState<AssetType | 'all'>('all');

  const cityKey = (profile?.city ?? 'Lagos').toLowerCase().split(',')[0].trim();
  const center: [number, number] = CITY_COORDS[cityKey] ?? CITY_COORDS['lagos'];

  const assets = LAGOS_ASSETS;
  const filtered = activeFilter === 'all' ? assets : assets.filter((a) => a.type === activeFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Eco Infrastructure Map</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {profile?.city ?? 'Lagos, Nigeria'} · {filtered.length} locations
          </p>
        </div>
        {portfolioMode && (
          <div className="bg-amber-400/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs px-3 py-1.5 rounded-full font-medium">
            react-leaflet + OpenStreetMap tiles
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            activeFilter === 'all'
              ? 'bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-900 border-emerald-500 dark:border-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All ({assets.length})
        </button>
        {(Object.entries(ASSET_CONFIG) as [AssetType, typeof ASSET_CONFIG[AssetType]][]).map(([type, cfg]) => {
          const count = assets.filter((a) => a.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeFilter === type
                  ? 'text-slate-900 border-transparent'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={activeFilter === type ? { background: cfg.color } : {}}
            >
              {cfg.icon}
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl" style={{ height: '460px' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapRecenter center={center} />
          {filtered.map((asset) => (
            <Marker key={asset.id} position={[asset.lat, asset.lng]} icon={createMarkerIcon(asset.type)}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: ASSET_CONFIG[asset.type].color + '20', color: ASSET_CONFIG[asset.type].color }}
                    >
                      {ASSET_CONFIG[asset.type].icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">{ASSET_CONFIG[asset.type].label}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1">{asset.name}</p>
                  <p className="text-xs text-slate-600 mb-1">{asset.description}</p>
                  <p className="text-xs text-slate-400">{asset.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(ASSET_CONFIG) as [AssetType, typeof ASSET_CONFIG[AssetType]][]).map(([type, cfg]) => (
          <div key={type} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 transition-colors duration-300">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '20', color: cfg.color }}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-slate-900 dark:text-white text-xs font-medium">{cfg.label}</p>
              <p className="text-slate-400 text-[10px]">{assets.filter((a) => a.type === type).length} locations</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
