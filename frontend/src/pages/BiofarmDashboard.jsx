import { useState, useEffect, useCallback } from 'react';
import {
  Recycle,
  Truck,
  Scale,
  Factory,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Package,
  Leaf,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Loader2,
  ArrowRight,
  Edit,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { wasteRecoveryService, biofarmService } from '../services';

const TABS = ['Available', 'Accepted', 'In Progress', 'History'];

const CATEGORY_COLORS = {
  'Organic Waste': 'bg-green-100 text-green-700',
  'Spoiled Food': 'bg-red-100 text-red-700',
  'Food Processing Waste': 'bg-orange-100 text-orange-700',
  'Expired Packaged': 'bg-yellow-100 text-yellow-700',
};

const REASON_ICONS = {
  expired: '⏰',
  spoiled: '🚫',
  excess: '📦',
  'processing waste': '🏭',
};

const SUITABILITY_COLORS = {
  High: 'text-green-600 bg-green-50 border-green-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  Low: 'text-red-600 bg-red-50 border-red-200',
};

function getCountdown(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const target = new Date(deadline);
  const diff = target - now;
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

function StatCard({ icon: Icon, label, value, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-5 flex items-center gap-4">
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

function CategoryBadge({ category }) {
  const style = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {category}
    </span>
  );
}

function SuitabilityBadge({ level }) {
  const style = SUITABILITY_COLORS[level] || SUITABILITY_COLORS.Medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${style}`}>
      <Leaf className="w-3 h-3" />
      {level} Suitability
    </span>
  );
}

function AvailableCard({ item, onAccept, onDecline, onReserve, actionLoading }) {
  const countdown = getCountdown(item.collectionDeadline);
  const isUrgent = countdown && !countdown.includes('d') && !countdown.includes('Expired');

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{item.materialName || item.name || 'Unnamed Material'}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <CategoryBadge category={item.category} />
            {item.suitability && <SuitabilityBadge level={item.suitability} />}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-lg font-bold text-amber-700">
            {item.quantity} {item.unit || 'kg'}
          </span>
          {item.distance != null && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.distance} km away
            </span>
          )}
        </div>
      </div>

      {item.reason && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Reason:</span> {REASON_ICONS[item.reason?.toLowerCase()] || '📋'} {item.reason}
        </p>
      )}

      {item.donorName && (
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-medium text-gray-600">Source:</span> {item.donorName}
        </p>
      )}

      <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
        <span className={`flex items-center gap-1 ${isUrgent ? 'text-orange-600 font-semibold' : ''}`}>
          <Clock className="w-3.5 h-3.5" />
          {countdown || 'No deadline'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-200">
        <button
          onClick={() => onAccept(item._id || item.id)}
          disabled={actionLoading === item._id || actionLoading === item.id}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === (item._id || item.id) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsUp className="w-4 h-4" />
          )}
          Accept
        </button>
        <button
          onClick={() => onDecline(item._id || item.id)}
          disabled={actionLoading === item._id || actionLoading === item.id}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ThumbsDown className="w-4 h-4" />
          Decline
        </button>
        <button
          onClick={() => onReserve(item._id || item.id)}
          disabled={actionLoading === item._id || item.id}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bookmark className="w-4 h-4" />
          Reserve
        </button>
      </div>
    </div>
  );
}

function AcceptedCard({ item }) {
  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.materialName || item.name}</h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          <CheckCircle2 className="w-3 h-3" />
          Accepted
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <CategoryBadge category={item.category} />
        <span className="font-medium">{item.quantity} {item.unit || 'kg'}</span>
        {item.donorName && <span>From: {item.donorName}</span>}
      </div>
      {item.collectionDeadline && (
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Collect by: {new Date(item.collectionDeadline).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function InProgressCard({ item, onRecordCollection, onUpdateProcessing, onUpdateStatus }) {
  const [recoveredQty, setRecoveredQty] = useState(item.recoveredQuantity || '');
  const [processingMethod, setProcessingMethod] = useState(item.processingMethod || '');
  const [status, setStatus] = useState(item.status || 'Collected');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProcessing(item._id || item.id, {
        recoveredQuantity: Number(recoveredQty),
        processingMethod,
        status,
      });
      toast.success('Processing updated successfully');
    } catch {
      toast.error('Failed to update processing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{item.materialName || item.name}</h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <ArrowRight className="w-3 h-3" />
          In Progress
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
        <CategoryBadge category={item.category} />
        <span className="font-medium">{item.quantity} {item.unit || 'kg'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Recovered Quantity (kg)</label>
          <input
            type="number"
            min="0"
            value={recoveredQty}
            onChange={(e) => setRecoveredQty(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Processing Method</label>
          <select
            value={processingMethod}
            onChange={(e) => setProcessingMethod(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          >
            <option value="">Select method</option>
            <option value="Composting">Composting</option>
            <option value="Biogas">Biogas</option>
            <option value="Approved Reuse">Approved Reuse</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          >
            <option value="Collected">Collected</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-200">
        {!item.collectedAt && (
          <button
            onClick={() => onRecordCollection(item._id || item.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
          >
            <Truck className="w-4 h-4" />
            Record Collection
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
          Save Updates
        </button>
      </div>
    </div>
  );
}

function HistoryCard({ item }) {
  return (
    <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.materialName || item.name}</h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
        <CategoryBadge category={item.category} />
        <span>Recovered: <strong>{item.recoveredQuantity || item.quantity} {item.unit || 'kg'}</strong></span>
        {item.processingMethod && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
            <Factory className="w-3 h-3" />
            {item.processingMethod}
          </span>
        )}
      </div>
      {item.completedAt && (
        <p className="text-xs text-gray-400 mt-1">
          Completed: {new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}

export default function BiofarmDashboard() {
  const [activeTab, setActiveTab] = useState('Available');
  const [stats, setStats] = useState(null);
  const [available, setAvailable] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, availableRes, historyRes] = await Promise.allSettled([
        biofarmService.getDashboard(),
        wasteRecoveryService.getAvailable(),
        biofarmService.getHistory(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success) {
        const d = dashRes.value.data;
        setStats(d.stats || d);
        setAccepted(d.accepted || []);
        setInProgress(d.inProgress || []);
      }

      if (availableRes.status === 'fulfilled' && availableRes.value?.success) {
        setAvailable(availableRes.value.data || []);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
        setHistory(historyRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      const res = await wasteRecoveryService.accept(id);
      if (res?.success) {
        toast.success('Recovery opportunity accepted!');
        setAvailable((prev) => prev.filter((item) => (item._id || item.id) !== id));
        fetchData();
      } else {
        toast.error(res?.message || 'Failed to accept');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      const res = await wasteRecoveryService.decline(id);
      if (res?.success) {
        toast.success('Opportunity declined');
        setAvailable((prev) => prev.filter((item) => (item._id || item.id) !== id));
      } else {
        toast.error(res?.message || 'Failed to decline');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to decline');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReserve = async (id) => {
    setActionLoading(id);
    try {
      const res = await wasteRecoveryService.reserve(id);
      if (res?.success) {
        toast.success('Reserved successfully!');
        fetchData();
      } else {
        toast.error(res?.message || 'Failed to reserve');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reserve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecordCollection = async (id) => {
    try {
      const res = await wasteRecoveryService.recordCollection(id, { collectedAt: new Date().toISOString() });
      if (res?.success) {
        toast.success('Collection recorded!');
        fetchData();
      } else {
        toast.error(res?.message || 'Failed to record collection');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to record collection');
    }
  };

  const handleUpdateProcessing = async (id, data) => {
    const res = await wasteRecoveryService.updateProcessing(id, data);
    if (res?.success) {
      fetchData();
    } else {
      throw new Error(res?.message || 'Update failed');
    }
  };

  const tabData = {
    Available: available,
    Accepted: accepted,
    'In Progress': inProgress,
    History: history,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 rounded-xl p-8">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          🌱 <strong>Waste Recovery:</strong> Material diverted from landfill for sustainable processing. This is <strong>NOT</strong> food for human consumption.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Recycle className="w-7 h-7 text-amber-600" />
            </div>
            Waste Recovery Dashboard
          </h1>
          <p className="text-gray-500 mt-1.5 ml-14">
            Recover food waste for composting, biogas, and sustainable reuse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium text-gray-500">Biofarm Partner</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Recycle}
          label="Available Recovery"
          value={stats?.availableRecovery ?? available.length}
          bgColor="bg-amber-100"
          textColor="text-amber-600"
        />
        <StatCard
          icon={Truck}
          label="Active Collections"
          value={stats?.activeCollections ?? (accepted.length + inProgress.length)}
          bgColor="bg-orange-100"
          textColor="text-orange-600"
        />
        <StatCard
          icon={Scale}
          label="Total Recovered (kg)"
          value={stats?.totalRecoveredKg ?? 0}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          icon={Factory}
          label="Processing Active"
          value={stats?.processingActive ?? inProgress.length}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-amber-200 mb-6">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
              }`}
            >
              {tab}
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {tabData[tab]?.length || 0}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {tabData[activeTab]?.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-amber-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">No {activeTab.toLowerCase()} items</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'Available' && 'New waste recovery opportunities will appear here.'}
              {activeTab === 'Accepted' && 'Accepted recovery materials will appear here.'}
              {activeTab === 'In Progress' && 'Active collections and processing will appear here.'}
              {activeTab === 'History' && 'Completed processing records will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'Available' &&
              available.map((item) => (
                <AvailableCard
                  key={item._id || item.id}
                  item={item}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onReserve={handleReserve}
                  actionLoading={actionLoading}
                />
              ))}

            {activeTab === 'Accepted' &&
              accepted.map((item) => (
                <AcceptedCard key={item._id || item.id} item={item} />
              ))}

            {activeTab === 'In Progress' &&
              inProgress.map((item) => (
                <InProgressCard
                  key={item._id || item.id}
                  item={item}
                  onRecordCollection={handleRecordCollection}
                  onUpdateProcessing={handleUpdateProcessing}
                />
              ))}

            {activeTab === 'History' &&
              history.map((item) => (
                <HistoryCard key={item._id || item.id} item={item} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
