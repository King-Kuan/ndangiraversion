import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Target } from 'lucide-react';

interface GPSPickerProps {
  initialPos: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition, onLocationChange }: { 
  position: [number, number]; 
  setPosition: (pos: [number, number]) => void;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationChange(newPos[0], newPos[1]);
    },
    dragend() {
      // In case we want to support dragging markers later
    }
  });

  return (
    <Marker position={position} />
  );
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center]);
  return null;
}

export default function GPSPicker({ initialPos, onLocationChange }: GPSPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPos);

  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setPosition(initialPos);
  }, [initialPos]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        onLocationChange(newPos[0], newPos[1]);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please ensure GPS is enabled.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-widest text-stone-400">Exact Location (GPS)</label>
        <button 
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className={`flex items-center gap-2 text-emerald-600 font-bold text-xs hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all ${isLocating ? 'opacity-50 animate-pulse' : ''}`}
        >
          <Target size={14} className={isLocating ? 'animate-spin' : ''} />
          <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
        </button>
      </div>

      <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border border-stone-200 relative z-0">
        <MapContainer center={position} zoom={15} className="w-full h-full">
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange} />
        </MapContainer>
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur shadow-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-stone-500 flex items-center gap-2">
          <MapPin size={12} className="text-emerald-600" />
          <span>Click on map to set Pin drop</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
          <span className="text-[10px] font-black uppercase text-stone-400 block mb-1">Latitude</span>
          <code className="text-sm font-bold text-stone-700">{position[0].toFixed(6)}</code>
        </div>
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
          <span className="text-[10px] font-black uppercase text-stone-400 block mb-1">Longitude</span>
          <code className="text-sm font-bold text-stone-700">{position[1].toFixed(6)}</code>
        </div>
      </div>
    </div>
  );
}
