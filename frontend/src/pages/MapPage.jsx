import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mapService, foodListingService } from '../services';
import { useAuth } from '../context/AuthContext';
import {
  Map as MapIcon, List, Filter, Clock, Package, MapPin,
  Building2, Truck, Leaf, Loader2, X, Search
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const markerIcons = {
  donor: createIcon('#16a34a'),
  food: createIcon('#16a34a'),
  organization: createIcon('#2563eb'),
  ngo: createIcon('#2563eb'),
  volunteer: createIcon('#8b5cf6'),
  biofarm: createIcon('#d97706'),
};

function LocationSetter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
}

export default function MapPage() {
  const { user } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('map');
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([28.6139, 77.2090]); // Default: New Delhi
  const [filters, setFilters] = useState({ category: '', type: '' });

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {} // Use default on error
      );
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [markersRes, listingsRes] = await Promise.allSettled([
        mapService.getMarkers(),
        foodListingService.getAll({ status: 'active' }),
      ]);
      if (markersRes.status === 'fulfilled' && markersRes.value?.success) {
        setMarkers(markersRes.value.data || []);
      }
      if (listingsRes.status === 'fulfilled' && listingsRes.value?.success) {
        const listingData = listingsRes.value.data || [];
        setListings(listingData);
        // If no markers from map API, create from listings
        if ((!markersRes.value?.data || markersRes.value.data.length === 0) && listingData.length > 0) {
          const listingMarkers = listingData
            .filter(l => l.latitude && l.longitude)
            .map(l => ({
              id: l.id,
              type: 'food',
              lat: l.latitude,
              lng: l.longitude,
              title: l.foodName || l.name,
              subtitle: `${l.quantity} ${l.unit} • ${l.category}`,
              details: l,
            }));
          setMarkers(listingMarkers);
        }
      }
    } catch (err) {
      console.error('Map data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkers = markers.filter(m => {
    if (filters.type && m.type !== filters.type) return false;
    if (filters.category && m.details?.category !== filters.category) return false;
    return true;
  });

  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapIcon className="w-7 h-7 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Food Rescue Map</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('map')}
            className={`p-2 rounded-lg transition-colors ${view === 'map' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <MapIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.type}
          onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
        >
          <option value="">All Types</option>
          <option value="food">Food Listings</option>
          <option value="donor">Donors</option>
          <option value="organization">Organizations</option>
          <option value="volunteer">Volunteers</option>
          <option value="biofarm">Biofarms</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
        >
          <option value="">All Categories</option>
          <option value="cooked_meals">Cooked Meals</option>
          <option value="raw_ingredients">Raw Ingredients</option>
          <option value="packaged_food">Packaged Food</option>
          <option value="bakery">Bakery</option>
          <option value="fruits_vegetables">Fruits & Vegetables</option>
        </select>
        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Food</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> NGO</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> Volunteer</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-600 inline-block" /> Biofarm</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : view === 'map' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '65vh' }}>
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            />
            <LocationSetter position={center} />
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat || marker.latitude, marker.lng || marker.longitude]}
                icon={markerIcons[marker.type] || markerIcons.food}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-gray-900">{marker.title || marker.name}</h3>
                    {marker.subtitle && <p className="text-sm text-gray-500">{marker.subtitle}</p>}
                    {marker.details?.pickupAddress && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        📍 {marker.details.pickupAddress}
                      </p>
                    )}
                    {marker.details?.pickupEndTime && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⏰ Pickup by: {getTimeRemaining(marker.details.pickupEndTime)}
                      </p>
                    )}
                    {marker.details?.estimatedServings && (
                      <p className="text-xs text-green-600 mt-1">
                        🍽️ ~{marker.details.estimatedServings} servings
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* List View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMarkers.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No locations found</p>
            </div>
          ) : (
            filteredMarkers.map((marker) => (
              <div key={marker.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    marker.type === 'food' || marker.type === 'donor' ? 'bg-green-100 text-green-600'
                    : marker.type === 'organization' || marker.type === 'ngo' ? 'bg-blue-100 text-blue-600'
                    : marker.type === 'volunteer' ? 'bg-purple-100 text-purple-600'
                    : 'bg-amber-100 text-amber-600'
                  }`}>
                    {marker.type === 'food' || marker.type === 'donor' ? <Package className="w-5 h-5" />
                    : marker.type === 'organization' || marker.type === 'ngo' ? <Building2 className="w-5 h-5" />
                    : marker.type === 'volunteer' ? <Truck className="w-5 h-5" />
                    : <Leaf className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{marker.title || marker.name}</h3>
                    {marker.subtitle && <p className="text-xs text-gray-500 truncate">{marker.subtitle}</p>}
                    {marker.details?.distance != null && (
                      <p className="text-xs text-gray-400 mt-1">{marker.details.distance} km away</p>
                    )}
                    {marker.details?.pickupEndTime && (
                      <p className="text-xs text-orange-600 mt-1">
                        Pickup: {getTimeRemaining(marker.details.pickupEndTime)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
