import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  BookmarkCheck,
  Truck,
  CheckCircle2,
  Clock,
  Star,
  Filter,
  SortAsc,
  Loader2,
  X,
  AlertTriangle,
  UtensilsCrossed,
  Package,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
} from 'lucide-react';
import { organizationService, matchingService } from '../services';

const TABS = [
  { key: 'available', label: 'Available Food' },
  { key: 'reservations', label: 'My Reservations' },
  { key: 'pickups', label: 'Active Pickups' },
  { key: 'completed', label: 'Completed' },
];

const CATEGORIES = [
  'All',
  'Cooked Meals',
  'Raw Ingredients',
  'Packaged Food',
  'Beverages',
  'Bakery',
  'Dairy',
  'Fruits & Vegetables',
  'Other',
];

const SORT_OPTIONS = [
  { value: 'match', label: 'Match Score' },
  { value: 'distance', label: 'Distance' },
  { value: 'pickup_time', label: 'Pickup Time' },
];

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  const iconBgMap = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    amber: 'bg-amber-100',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]} transition-shadow hover:shadow-md`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${iconBgMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calculate() {
      const now = new Date();
      const end = new Date(deadline);
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    }
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isUrgent = (() => {
    const diff = new Date(deadline) - new Date();
    return diff > 0 && diff < 2 * 60 * 60 * 1000;
  })();

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-orange-600' : 'text-gray-500'}`}>
      <Clock className="h-3.5 w-3.5" />
      {timeLeft}
    </span>
  );
}

function MatchScoreBar({ score, reason }) {
  const pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
  const barColor =
    pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          Match Score
        </span>
        <span className="text-xs font-bold text-gray-800">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {reason && <p className="text-xs text-gray-500 mt-1 italic">{reason}</p>}
    </div>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      {category}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    available: 'bg-green-100 text-green-700',
    reserved: 'bg-blue-100 text-blue-700',
    pickup_scheduled: 'bg-purple-100 text-purple-700',
    in_transit: 'bg-amber-100 text-amber-700',
    completed: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const label = (status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function AvailableFoodCard({ item, onAccept, onDecline, onReserve, loadingAction }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.foodName || item.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <CategoryBadge category={item.category} />
            <span className="text-sm text-gray-600">
              {item.quantity} {item.unit}
            </span>
          </div>
        </div>
        {item.matchScore != null && (() => {
          const pct = item.matchScore <= 1 ? Math.round(item.matchScore * 100) : Math.round(item.matchScore);
          return (
            <div className="ml-3 flex-shrink-0 text-center">
              <div className={`text-lg font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                {pct}%
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">match</div>
            </div>
          );
        })()}
      </div>

      <div className="space-y-2 mb-3">
        {item.estimatedServings && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UtensilsCrossed className="h-4 w-4 text-gray-400" />
            <span>~{item.estimatedServings} servings</span>
          </div>
        )}
        {item.distance != null && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{item.distance} km away</span>
          </div>
        )}
        {item.pickupDeadline && (
          <div className="flex items-center gap-2 text-sm">
            <CountdownTimer deadline={item.pickupDeadline} />
          </div>
        )}
        {item.storageNotes && (
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <Package className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{item.storageNotes}</span>
          </div>
        )}
        {item.donorName && (
          <div className="text-sm text-gray-500">
            Donor: <span className="font-medium text-gray-700">{item.donorName}</span>
          </div>
        )}
      </div>

      {item.matchScore != null && (
        <MatchScoreBar score={item.matchScore} reason={item.matchReason} />
      )}

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onAccept(item.id)}
          disabled={!!loadingAction}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingAction === `accept-${item.id}` ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
          Accept
        </button>
        <button
          onClick={() => onReserve(item.id)}
          disabled={!!loadingAction}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingAction === `reserve-${item.id}` ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          Reserve
        </button>
        <button
          onClick={() => onDecline(item.id)}
          disabled={!!loadingAction}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingAction === `decline-${item.id}` ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
          Decline
        </button>
      </div>
    </div>
  );
}

function ReservationCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.foodName || item.name}</h3>
        <StatusBadge status={item.status} />
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{item.quantity} {item.unit}</span>
        </div>
        {item.pickupDeadline && (
          <CountdownTimer deadline={item.pickupDeadline} />
        )}
        {item.donorName && (
          <div>Donor: <span className="font-medium text-gray-700">{item.donorName}</span></div>
        )}
        {item.reservedAt && (
          <div className="text-xs text-gray-400">
            Reserved: {new Date(item.reservedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivePickupCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.foodName || item.name}</h3>
        <StatusBadge status={item.status} />
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{item.quantity} {item.unit}</span>
        </div>
        {item.volunteerName && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-purple-500" />
            <span>Volunteer: <span className="font-medium text-gray-700">{item.volunteerName}</span></span>
          </div>
        )}
        {item.volunteerPhone && (
          <div className="text-xs text-gray-500">Phone: {item.volunteerPhone}</div>
        )}
        {item.estimatedArrival && (
          <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
            <Clock className="h-3.5 w-3.5" />
            ETA: {item.estimatedArrival}
          </div>
        )}
      </div>
    </div>
  );
}

function CompletedCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.foodName || item.name}</h3>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Completed
        </span>
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{item.quantity} {item.unit}</span>
        </div>
        {item.completedAt && (
          <div className="text-xs text-gray-400">
            Distributed: {new Date(item.completedAt).toLocaleString()}
          </div>
        )}
        {item.beneficiariesServed && (
          <div className="text-xs text-green-600 font-medium">
            {item.beneficiariesServed} beneficiaries served
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}

export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const [stats, setStats] = useState({
    availableNearby: 0,
    reserved: 0,
    activePickups: 0,
    completedDistributions: 0,
  });

  const [availableFood, setAvailableFood] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activePickups, setActivePickups] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [showFilters, setShowFilters] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, availableRes, reservationsRes, pickupsRes, completedRes] =
        await Promise.allSettled([
          organizationService.getDashboardStats(),
          matchingService.getAvailableMatches(),
          organizationService.getReservations(),
          organizationService.getActivePickups(),
          organizationService.getCompletedDistributions(),
        ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
      if (availableRes.status === 'fulfilled' && availableRes.value?.success) {
        setAvailableFood(availableRes.value.data || []);
      }
      if (reservationsRes.status === 'fulfilled' && reservationsRes.value?.success) {
        setReservations(reservationsRes.value.data || []);
      }
      if (pickupsRes.status === 'fulfilled' && pickupsRes.value?.success) {
        setActivePickups(pickupsRes.value.data || []);
      }
      if (completedRes.status === 'fulfilled' && completedRes.value?.success) {
        setCompletedItems(completedRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAccept = async (donationId) => {
    try {
      setLoadingAction(`accept-${donationId}`);
      const res = await matchingService.acceptMatch(donationId);
      if (res?.success) {
        setAvailableFood((prev) => prev.filter((item) => item.id !== donationId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Accept failed:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDecline = async (donationId) => {
    try {
      setLoadingAction(`decline-${donationId}`);
      const res = await matchingService.declineMatch(donationId);
      if (res?.success) {
        setAvailableFood((prev) => prev.filter((item) => item.id !== donationId));
      }
    } catch (err) {
      console.error('Decline failed:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReserve = async (donationId) => {
    try {
      setLoadingAction(`reserve-${donationId}`);
      const res = await organizationService.reserveDonation(donationId);
      if (res?.success) {
        setAvailableFood((prev) => prev.filter((item) => item.id !== donationId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Reserve failed:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredFood = availableFood
    .filter((item) => categoryFilter === 'All' || item.category === categoryFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 999) - (b.distance || 999);
        case 'pickup_time':
          return new Date(a.pickupDeadline || 0) - new Date(b.pickupDeadline || 0);
        case 'match':
        default:
          return (b.matchScore || 0) - (a.matchScore || 0);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="rounded-full bg-red-100 p-4 mx-auto w-fit mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Something went wrong</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage food donations and distributions for your organization</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={MapPin}
          label="Available Nearby Food"
          value={stats.availableNearby ?? availableFood.length}
          color="green"
        />
        <StatCard
          icon={BookmarkCheck}
          label="Reserved Donations"
          value={stats.reserved ?? reservations.length}
          color="blue"
        />
        <StatCard
          icon={Truck}
          label="Active Pickups"
          value={stats.activePickups ?? activePickups.length}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Distributions"
          value={stats.completedDistributions ?? completedItems.length}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.key === 'available' && availableFood.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  {availableFood.length}
                </span>
              )}
              {tab.key === 'reservations' && reservations.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {reservations.length}
                </span>
              )}
              {tab.key === 'pickups' && activePickups.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  {activePickups.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Available Food Tab */}
      {activeTab === 'available' && (
        <div>
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              {categoryFilter !== 'All' && (
                <span className="ml-1 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] text-white">1</span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort by: {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {categoryFilter !== 'All' && (
              <button
                onClick={() => setCategoryFilter('All')}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
              >
                {categoryFilter}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoryFilter(cat);
                      setShowFilters(false);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredFood.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No Available Food"
              description={
                categoryFilter !== 'All'
                  ? `No food items found in "${categoryFilter}" category. Try changing your filter.`
                  : 'There are no food donations available near you at the moment. Check back soon!'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFood.map((item) => (
                <AvailableFoodCard
                  key={item.id}
                  item={item}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onReserve={handleReserve}
                  loadingAction={loadingAction}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div>
          {reservations.length === 0 ? (
            <EmptyState
              icon={BookmarkCheck}
              title="No Reservations"
              description="You haven't reserved any food donations yet. Browse the Available Food tab to reserve items."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reservations.map((item) => (
                <ReservationCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Pickups Tab */}
      {activeTab === 'pickups' && (
        <div>
          {activePickups.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No Active Pickups"
              description="There are no pickups in progress. Accepted donations will appear here once a volunteer is assigned."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activePickups.map((item) => (
                <ActivePickupCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === 'completed' && (
        <div>
          {completedItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Completed Distributions"
              description="Your completed food distributions will appear here. Start by accepting available food nearby."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {completedItems.map((item) => (
                <CompletedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
