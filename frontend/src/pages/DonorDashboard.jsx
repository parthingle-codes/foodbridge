import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  UtensilsCrossed,
  Star,
  Plus,
  Clock,
  ArrowRight,
  Trophy,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { donorService, rewardService } from '../services';

const STATUS_STYLES = {
  ACTIVE: 'bg-green-100 text-green-700',
  MATCHED: 'bg-blue-100 text-blue-700',
  RESERVED: 'bg-orange-100 text-orange-700',
  PICKED_UP: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
};

function StatCard({ icon: Icon, label, value, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`${bgColor} ${textColor} p-3 rounded-xl`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, listingsRes, donationsRes, leaderboardRes] = await Promise.allSettled([
          donorService.getStats(),
          donorService.getListings(),
          donorService.getRecentDonations(),
          rewardService.getLeaderboard(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.data);
        }
        if (listingsRes.status === 'fulfilled' && listingsRes.value?.success) {
          setListings(listingsRes.value.data || []);
        }
        if (donationsRes.status === 'fulfilled' && donationsRes.value?.success) {
          setRecentDonations(donationsRes.value.data || []);
        }
        if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value?.success) {
          setLeaderboard((leaderboardRes.value.data || []).slice(0, 3));
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 rounded-xl p-8">
          <p className="text-red-600 font-medium text-lg">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Donor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="text-green-600 font-semibold">{firstName}</span>! 🎉
          </p>
        </div>
        <Link
          to="/donor/create-listing"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl shadow-sm hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create New Listing
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Total Donations"
          value={stats?.totalDonations ?? 0}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Food Rescued"
          value={stats?.foodRescued ? `${stats.foodRescued} kg` : '0 kg'}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Estimated Servings"
          value={stats?.estimatedServings ?? 0}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
        <StatCard
          icon={Star}
          label="Credits Earned"
          value={stats?.creditsEarned ?? 0}
          bgColor="bg-amber-100"
          textColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Listings - takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Active Listings
            </h2>
            <Link
              to="/donor/listings"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active listings yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first food listing to get started!</p>
              <Link
                to="/donor/create-listing"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Food Name</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden sm:table-cell">Category</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden md:table-cell">Quantity</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500">Status</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-500 hidden lg:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing._id || listing.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <Link
                          to={`/donor/listings/${listing._id || listing.id}`}
                          className="text-gray-900 font-medium hover:text-green-600 transition"
                        >
                          {listing.foodName || listing.name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-gray-600 hidden sm:table-cell">{listing.category}</td>
                      <td className="py-3 px-3 text-gray-600 hidden md:table-cell">
                        {listing.quantity} {listing.unit}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="py-3 px-3 text-gray-400 hidden lg:table-cell">
                        {listing.createdAt
                          ? new Date(listing.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right sidebar column */}
        <div className="space-y-6">
          {/* Recent Donation History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Donations
            </h2>
            {recentDonations.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No recent donations</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentDonations.slice(0, 5).map((donation, idx) => (
                  <li
                    key={donation._id || donation.id || idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {donation.foodName || donation.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {donation.completedAt || donation.createdAt
                          ? new Date(donation.completedAt || donation.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                        {donation.quantity ? ` · ${donation.quantity} ${donation.unit || ''}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={donation.status || 'COMPLETED'} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Donors Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Donors
            </h2>
            {leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Leaderboard coming soon</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {leaderboard.map((donor, idx) => {
                  const rankColors = [
                    'bg-amber-100 text-amber-700',
                    'bg-gray-100 text-gray-600',
                    'bg-orange-100 text-orange-700',
                  ];
                  const rankIcons = ['🥇', '🥈', '🥉'];
                  return (
                    <li
                      key={donor._id || donor.id || idx}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${rankColors[idx] || 'bg-gray-100 text-gray-500'}`}
                      >
                        {rankIcons[idx] || idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{donor.name}</p>
                        <p className="text-xs text-gray-400">{donor.totalDonations ?? donor.donations ?? 0} donations</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{donor.credits ?? donor.points ?? 0}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to="/leaderboard"
              className="mt-4 block text-center text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View Full Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
