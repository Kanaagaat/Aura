// frontend/src/components/AuraMap.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

// Fix Leaflet's default icon — required or markers show as broken images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

import type { Location } from '../types';

type BeaconMarker = { locationId: number; visibility: string };

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

const LABEL_ZOOM = 15;
type LatLngTuple = [number, number];

// ─── Icon factories ──────────────────────────────────────────────────────────
function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createVenueIcon(
  emoji: string,
  name: string,
  selected: boolean,
  showLabel: boolean
) {
  return L.divIcon({
    html: `
      <div class="aura-map-marker-shell${selected || showLabel ? ' aura-map-marker-shell--labeled' : ''}">
        <div class="aura-map-marker${selected ? ' aura-map-marker--selected' : ''}">${emoji}</div>
        <span class="aura-map-marker-label">${escapeHtml(name)}</span>
      </div>
    `,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function createBeaconPulseIcon(
  emoji: string,
  name: string,
  selected: boolean,
  showLabel: boolean,
  visibility: string = 'all'
) {
  const badge = visibility === 'female' ? '🌸' : visibility === 'male' ? '💙' : '';
  return L.divIcon({
    html: `
      <div class="aura-map-marker-shell${selected || showLabel ? ' aura-map-marker-shell--labeled' : ''}">
        <div class="aura-beacon-marker">
          <div class="aura-beacon-marker__pulse"></div>
          <div class="aura-beacon-marker__core">${emoji}</div>
          ${badge ? `<span class="aura-beacon-marker__badge">${badge}</span>` : ''}
        </div>
        <span class="aura-map-marker-label">${escapeHtml(name)}</span>
      </div>
    `,
    className: '',
    iconAnchor: [20, 20],
  });
}

function createClusterIcon(cluster: { getChildCount: () => number }) {
  return L.divIcon({
    html: `<div class="aura-map-cluster"><span>${cluster.getChildCount()}</span></div>`,
    className: '',
    iconSize: L.point(48, 48, true),
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    html: `
      <div class="aura-user-location">
        <div class="aura-user-location__pulse"></div>
        <div class="aura-user-location__dot"></div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function MapControls({
  onLocate,
}: {
  onLocate: (position: LatLngTuple) => void;
}) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const locate = () => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition: LatLngTuple = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        onLocate(nextPosition);
        map.flyTo(nextPosition, Math.max(map.getZoom(), 15), { duration: 0.7 });
        setLocating(false);
      },
      () => {
        setLocationError(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  };

  return (
    <div className="aura-map-controls" aria-label="Map controls">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="aura-map-control-button"
        aria-label="Zoom in"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="aura-map-control-button"
        aria-label="Zoom out"
      >
        <span className="material-symbols-outlined">remove</span>
      </button>
      <button
        type="button"
        onClick={locate}
        className="aura-map-control-button"
        aria-label="Show my location"
        title={locationError ? 'Location unavailable' : 'Show my location'}
      >
        <span className={`material-symbols-outlined ${locating ? 'aura-map-control-spin' : ''}`}>
          {locating ? 'progress_activity' : 'my_location'}
        </span>
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface AuraMapProps {
  locations: Location[];
  selectedId: number | null;
  activeBeaconLocationIds?: number[];
  beaconMarkers?: BeaconMarker[];
  highlightedIds?: number[];
  onSelect: (id: number) => void;
}

export function AuraMap({
  locations,
  selectedId,
  activeBeaconLocationIds = [],
  beaconMarkers,
  highlightedIds = [],
  onSelect,
}: AuraMapProps) {
  const [zoom, setZoom] = useState(13);
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const selected = locations.find((l) => l.id === selectedId) ?? null;
  const showLabels = zoom >= LABEL_ZOOM;
  const handleZoomChange = useCallback((nextZoom: number) => {
    setZoom(nextZoom);
  }, []);

  return (
    <MapContainer
      center={ALMATY}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />

      <ZoomTracker onZoomChange={handleZoomChange} />
      <FlyToSelected selected={selected} />
      <MapControls onLocate={setUserPosition} />

      {userPosition && (
        <Marker
          position={userPosition}
          icon={createUserLocationIcon()}
          interactive={false}
          zIndexOffset={1200}
        />
      )}

      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        maxClusterRadius={44}
        iconCreateFunction={createClusterIcon}
      >
        {locations.map((loc) => {
          const pos: [number, number] = [
            parseFloat(loc.latitude),
            parseFloat(loc.longitude),
          ];
          const emoji = EMOJI[loc.category] ?? '📍';
          const isSelected = loc.id === selectedId;
          const bm = beaconMarkers?.find((m) => m.locationId === loc.id);
          const hasBeacon = bm != null || activeBeaconLocationIds.includes(loc.id);
          const visibility = bm?.visibility ?? 'all';
          const isHighlighted = highlightedIds.includes(loc.id);

          return (
            <Marker
              key={loc.id}
              position={pos}
              icon={
                hasBeacon
                  ? createBeaconPulseIcon(emoji, loc.name, isSelected || isHighlighted, showLabels, visibility)
                  : isHighlighted
                  ? createVenueIcon(emoji, loc.name, true, showLabels)
                  : createVenueIcon(emoji, loc.name, isSelected, showLabels)
              }
              eventHandlers={{
                click: () => onSelect(loc.id),
              }}
              zIndexOffset={isSelected ? 1000 : isHighlighted ? 500 : 0}
            />
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
