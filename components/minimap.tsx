"use client"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for the missing marker icon
const icon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] });

export default function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="h-full w-full">
      <MapContainer center={[lat, lng]} zoom={15} zoomControl={false} scrollWheelZoom={false} dragging={false} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  )
}