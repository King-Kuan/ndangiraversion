import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BusinessListing } from '../types';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  businesses: BusinessListing[];
  onMarkerClick?: (businessId: string) => void;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapComponent({ center, zoom, businesses, onMarkerClick }: MapComponentProps) {
  return (
    <div className="w-full h-full relative z-0 border border-stone-200 rounded-3xl overflow-hidden shadow-inner bg-stone-100">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businesses.map((business) => (
          <Marker 
            key={business.id} 
            position={[business.lat, business.lng]}
            eventHandlers={{
              click: () => onMarkerClick?.(business.id),
            }}
          >
            <Popup className="rounded-xl overflow-hidden">
              <div className="p-1">
                <h3 className="font-bold text-emerald-900">{business.name}</h3>
                <p className="text-xs text-stone-600 mb-2">{business.city} • {business.category}</p>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-emerald-600 text-white text-[10px] font-bold py-1 rounded-md"
                >
                  GET DIRECTIONS
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
