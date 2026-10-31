import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { foodListingService } from '../services';
import {
  Package, Plus, Eye, Clock, CheckCircle2, AlertTriangle,
  Loader2, Search, Filter, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  active: { label: 'Active', class: 'bg-green-100 text-green-700' },
  matched: { label: 'Matched', class: 'bg-blue-100 text-blue-700' },
  reserved: { label: 'Reserved', class: 'bg-orange-100 text-orange-700' },
  picked_up: { label: 'Picked Up', class: 'bg-purple-100 text-purple-700' },
  in_transit: { label: 'In Transit', class: 'bg-cyan-100 text-cyan-700' },
  delivered: { label: 'Delivered', class: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completed', class: 'bg-gray-100 text-gray-600' },
  expired: { label: 'Expired', class: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-600' },
};

export default function DonorListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await foodListingService.getAll();
      if (response?.success) {
        setListings(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await foodListingService.delete(id);
      if (res?.success) {
        toast.success('Listing deleted');
        setListings(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = !search || (l.foodName || l.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (l.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link to="/donor/create-listing" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
        >
          <option value="">All Status</option>
          {Object.entries(statusConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            {listings.length === 0 ? 'No listings yet. Create your first food donation!' : 'No listings match your filter.'}
          </p>
          {listings.length === 0 && (
            <Link to="/donor/create-listing" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Listing
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => {
            const status = statusConfig[(listing.status || '').toLowerCase()] || statusConfig.active;
            return (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{listing.foodName || listing.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{listing.category}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">Quantity</span>
                    <p className="font-medium">{listing.quantity} {listing.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Servings</span>
                    <p className="font-medium">{listing.estimatedServings || '—'}</p>
                  </div>
                </div>

                {listing.pickupEndTime && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pickup by: {new Date(listing.pickupEndTime).toLocaleString()}
                  </p>
                )}

                {listing.matches && listing.matches.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-700 font-medium">
                      {listing.matches.length} organization(s) matched
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  ID: {listing.id?.substring(0, 8)}... • Created: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> Details
                  </button>
                  {(listing.status || '').toLowerCase() === 'active' && (
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {selectedListing === listing.id && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2 animate-fade-in">
                    {listing.pickupAddress && <p><span className="text-gray-400">Address:</span> {listing.pickupAddress}</p>}
                    {listing.storageInstructions && <p><span className="text-gray-400">Storage:</span> {listing.storageInstructions}</p>}
                    {listing.allergens && <p><span className="text-gray-400">Allergens:</span> {Array.isArray(listing.allergens) ? listing.allergens.join(', ') : listing.allergens}</p>}
                    {listing.foodCondition && <p><span className="text-gray-400">Condition:</span> {listing.foodCondition}</p>}
                    {listing.matches?.map((match, i) => (
                      <div key={i} className="bg-white rounded p-2 border border-gray-200">
                        <p className="font-medium text-gray-700">{match.organizationName || 'Organization'}</p>
                        <p className="text-xs text-gray-500">Match Score: {match.score}% • Status: {match.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
