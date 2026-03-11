"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  disabled?: boolean
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })
  return position === null ? null : <Marker position={position} />
}

function MapUpdater({ center }: { center: L.LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function LocationPicker({ onLocationSelect, disabled = false }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [center, setCenter] = useState<L.LatLngExpression>([19.0760, 72.8777])
  
  // Use a ref to prevent unnecessary re-fetches if the position hasn't actually changed
  const lastFetchedPos = useRef<string>("")

  const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en'
        }
      })
      
      if (!res.ok) {
        throw new Error(`Geocoding failed: ${res.statusText}`)
      }

      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newLat = parseFloat(lat)
        const newLon = parseFloat(lon)
        const newPos = new L.LatLng(newLat, newLon)
        
        setPosition(newPos)
        setCenter([newLat, newLon])
        onLocationSelect(newLat, newLon, display_name)
      } else {
        console.warn("No results found for your search query.")
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  // Wrap the fetch in useCallback to keep it stable
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    const posKey = `${lat}-${lng}`
    if (lastFetchedPos.current === posKey) return
    lastFetchedPos.current = posKey

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en'
        }
      })

      if (!res.ok) {
        throw new Error(`Reverse geocoding failed: ${res.statusText}`)
      }

      const data = await res.json()
      onLocationSelect(lat, lng, data.display_name || "Unknown location")
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }
  }, [onLocationSelect])

  useEffect(() => {
    if (position) {
      fetchAddress(position.lat, position.lng)
    }
  }, [position, fetchAddress])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && handleSearch(e)}
            placeholder="Search for a location (e.g. Mumbai)"
            className="pl-10 h-11 rounded-xl border-border bg-card/50"
            disabled={disabled}
          />
        </div>
        <Button 
          type="button"
          onClick={(e) => handleSearch(e)}
          disabled={loading || disabled}
          className="h-11 px-6 rounded-xl font-display font-bold"
        >
          {loading ? "..." : "Search"}
        </Button>
      </div>

      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border relative">
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={false} 
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapUpdater center={center} />
        </MapContainer>
      </div>
    </div>
  )
}