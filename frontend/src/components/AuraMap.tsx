// frontend/src/components/AuraMap.tsx
import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon — required or markers show as broken images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

import type { Location } from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────
const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';
const ALMATY: [number, number] = [43.238949, 76.889709];

const EMOJI: Record<string, string> = {
  coffee: '☕',
  yoga: '🧘',
  spa: '✨',
  other: '📍',
};

// ─── Icon factories ──────────────────────────────────────────────────────────
function createVenueIcon(emoji: string, name: string, selected: boolean) {
  const shortName = name.length > 18 ? name.slice(0, 16) + '…' : name;
  return L.divIcon({
    html: `<div style="
      background: ${selected ? '#1C1C1A' : 'white'};
      color: ${selected ? 'white' : '#1C1C1A'};
      border-radius: 100px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: ${selected
        ? '0 4px 16px rgba(0,0,0,0.25)'
        : '0 2px 8px rgba(0,0,0,0.12)'};
      border: ${selected ? '1.5px solid #1C1C1A' : '0.5px solid rgba(0,0,0,0.08)'};
      transform: ${selected ? 'scale(1.08)' : 'scale(1)'};
      transition: all 0.15s ease;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">${emoji} ${shortName}</div>`,
    className: '',
    iconAnchor: [0, 0],
  });
}

function createBeaconPulseIcon(emoji: string) {
  return L.divIcon({
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:40px; height:40px;">
        <div style="
          position:absolute;
          width:40px; height:40px;
          border-radius:50%;
          background: rgba(245,158,11,0.25);
          animation: aura-pulse 1.5s ease-out infinite;
        "></div>
        <div style="
          position:relative;
          width:22px; height:22px;
          border-radius:50%;
          background:#F59E0B;
          display:flex; align-items:center; justify-content:center;
          font-size:12px;
          box-shadow: 0 2px 8px rgba(245,158,11,0.6);
        ">${emoji}</div>
      </div>
      <style>
        @keyframes aura-pulse {
          0%   { transform: scale(0.7); opacity: 0.8; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(0.7); opacity: 0; }
        }
      </style>
    `,
    className: '',
    iconAnchor: [20, 20],
  });
}

// ─── Map fly-to controller ────────────────────────────────────────────────────
function FlyToSelected({ selected }: { selected: Location | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!selected || selected.id === prevId.current) return;
    prevId.current = selected.id;
    map.flyTo(
      [parseFloat(selected.latitude), parseFloat(selected.longitude)],
      15,
      { duration: 0.7 }
    );
  }, [selected, map]);

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
interface AuraMapProps {
  locations: Location[];
  selectedId: number | null;
  activeBeaconLocationIds?: number[];
  onSelect: (id: number) => void;
}

export function AuraMap({
  locations,
  selectedId,
  activeBeaconLocationIds = [],
  onSelect,
}: AuraMapProps) {
  const selected = locations.find((l) => l.id === selectedId) ?? null;

  return (
    <MapContainer
      center={ALMATY}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />

      <FlyToSelected selected={selected} />

      {locations.map((loc) => {
        const pos: [number, number] = [
          parseFloat(loc.latitude),
          parseFloat(loc.longitude),
        ];
        const emoji = EMOJI[loc.category] ?? '📍';
        const isSelected = loc.id === selectedId;
        const hasBeacon = activeBeaconLocationIds.includes(loc.id);

        return (
          <Marker
            key={loc.id}
            position={pos}
            icon={
              hasBeacon
                ? createBeaconPulseIcon(emoji)
                : createVenueIcon(emoji, loc.name, isSelected)
            }
            eventHandlers={{
              click: () => onSelect(loc.id),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          />
        );
      })}
    </MapContainer>
  );
}
