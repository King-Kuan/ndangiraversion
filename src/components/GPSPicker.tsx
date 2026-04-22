import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Target, AlertCircle } from 'lucide-react';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

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
      map.flyTo(newPos, map.getZoom());
    }
  });

  return (
    <Marker position={position} icon={DefaultIcon} />
  );
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 15);
  }, [center, map]);
  return null;
}

export default function GPSPicker({ initialPos, onLocationChange }: GPSPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialPos);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Only update if the incoming initialPos is significantly different from current internal position
    // to avoid cycles or resetting a custom pin drop
    const dist = Math.sqrt(Math.pow(position[0] - initialPos[0], 2) + Math.pow(position[1] - initialPos[1], 2));
    if (dist > 0.0001) {
      setPosition(initialPos);
    }
  }, [initialPos]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        console.log("Location successfully captured:", newPos);
        setPosition(newPos);
        onLocationChange(newPos[0], newPos[1]);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error detail:", error);
        setIsLocating(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permission denied. Ensure location access is allowed in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Position unavailable. Try moving to a clearer area or outdoor space.");
            break;
          case error.TIMEOUT:
            setLocationError("Timed out. Your device took too long to respond. Try again.");
            break;
          default:
            setLocationError("Unable to retrieve your exact location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds for better satellite lock
        maximumAge: 0    // Fresh location every time
      }
    );
  }, [onLocationChange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-widest text-stone-400">Exact Location (GPS)</label>
          <button 
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className={`flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${isLocating ? 'animate-pulse' : ''}`}
          >
            <Target size={14} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating Real-time...' : 'Use My Current Location'}</span>
          </button>
        </div>
        
        {locationError && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-[10px] font-bold">
            <AlertCircle size={14} />
            {locationError}
          </div>
        )}
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
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur shadow-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-stone-500 flex items-center gap-2 border border-stone-100 uppercase tracking-tighter">
          <MapPin size={12} className="text-emerald-600" />
          <span>Tap Map to Pin Exact Building</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-inner">
          <span className="text-[10px] font-black uppercase text-stone-400 block mb-1 tracking-widest">Latitude</span>
          <code className="text-sm font-black text-stone-900 tracking-tight">{position[0].toFixed(6)}</code>
        </div>
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-inner">
          <span className="text-[10px] font-black uppercase text-stone-400 block mb-1 tracking-widest">Longitude</span>
          <code className="text-sm font-black text-stone-900 tracking-tight">{position[1].toFixed(6)}</code>
        </div>
      </div>
    </div>
  );
}
