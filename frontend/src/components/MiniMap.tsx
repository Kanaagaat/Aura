import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';

const EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  spa: '✨',
  other: '📍',
};

function pinIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="
      background:#1C1C1A;color:white;border-radius:100px;
      padding:6px 14px;font-size:13px;font-weight:600;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);white-space:nowrap;
    ">${emoji}</div>`,
    className: '',
    iconAnchor: [20, 20],
  });
}

interface MiniMapProps {
  latitude: string | number;
  longitude: string | number;
  category?: string;
  className?: string;
}

export function MiniMap({ latitude, longitude, category = 'other', className }: MiniMapProps) {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  const emoji = EMOJI[category] ?? '📍';

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return (
    <div className={className ?? 'h-44 rounded-[var(--radius-card)] overflow-hidden border border-border'}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <Marker position={[lat, lng]} icon={pinIcon(emoji)} />
      </MapContainer>
    </div>
  );
}
