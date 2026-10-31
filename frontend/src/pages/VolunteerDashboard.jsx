import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Package,
  ArrowRight,
  Shield,
  Key,
  Navigation,
  Loader2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { volunteerService, assignmentService } from '../services';

const DELIVERY_STEPS = [
  { key: 'assigned', label: 'Assigned', icon: Package },
  { key: 'pickup_safety_check', label: 'Safety Check', icon: Shield },
  { key: 'pickup_otp', label: 'Pickup OTP', icon: Key },
  { key: 'in_transit', label: 'In Transit', icon: Navigation },
  { key: 'delivery_otp', label: 'Delivery OTP', icon: Key },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function getStepIndex(status) {
  const statusMap = {
    assigned: 0,
    pickup_safety_check: 1,
    safety_check: 1,
    pickup_otp: 2,
    in_transit: 3,
    delivery_otp: 4,
    completed: 5,
    delivered: 5,
  };
  return statusMap[status] ?? 0;
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  const iconBgMap = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
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

function DeliveryTimeline({ currentStatus, assignmentId }) {
  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="mt-4 mb-2">
      {/* Desktop horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between">
        {DELIVERY_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          let linkTo = null;
          if (isCurrent) {
            switch (step.key) {
              case 'pickup_safety_check':
                linkTo = `/volunteer/safety-check?id=${assignmentId}`;
                break;
              case 'pickup_otp':
                linkTo = `/volunteer/otp?type=pickup&id=${assignmentId}`;
                break;
              case 'delivery_otp':
                linkTo = `/volunteer/otp?type=delivery&id=${assignmentId}`;
                break;
              default:
                break;
            }
          }

          const circleContent = (
            <div
              className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                isCompleted
                  ? 'bg-green-600 border-green-600 text-white'
                  : isCurrent
                  ? 'bg-white border-green-600 text-green-600 ring-4 ring-green-100'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <StepIcon className="h-4 w-4" />
              )}
            </div>
          );

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                {linkTo ? (
                  <Link to={linkTo} className="hover:scale-110 transition-transform">
                    {circleContent}
                  </Link>
                ) : (
                  circleContent
                )}
                <span
                  className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-green-700 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < DELIVERY_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mt-[-16px] ${
                    idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical stepper */}
      <div className="sm:hidden space-y-0">
        {DELIVERY_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          let linkTo = null;
          if (isCurrent) {
            switch (step.key) {
              case 'pickup_safety_check':
                linkTo = `/volunteer/safety-check?id=${assignmentId}`;
                break;
              case 'pickup_otp':
                linkTo = `/volunteer/otp?type=pickup&id=${assignmentId}`;
                break;
              case 'delivery_otp':
                linkTo = `/volunteer/otp?type=delivery&id=${assignmentId}`;
                break;
              default:
                break;
            }
          }

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : isCurrent
                      ? 'bg-white border-green-600 text-green-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-3.5 w-3.5" />
                  )}
                </div>
                {idx < DELIVERY_STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="pb-4">
                {linkTo ? (
                  <Link to={linkTo} className={`text-xs font-medium ${isCurrent ? 'text-green-700 underline' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                  </Link>
                ) : (
                  <span className={`text-xs font-medium ${isCurrent ? 'text-green-700 font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, onTransitConfirm, transitLoading }) {
  const currentIdx = getStepIndex(assignment.status);

  const renderActionButton = () => {
    switch (assignment.status) {
      case 'assigned':
        return (
          <Link
            to={`/volunteer/safety-check?id=${assignment.id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Start Safety Check
            <ArrowRight className="h-4 w-4" />
          </Link>
        );
      case 'pickup_safety_check':
      case 'safety_check':
        return (
          <Link
            to={`/volunteer/otp?type=pickup&id=${assignment.id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Key className="h-4 w-4" />
            Enter Pickup OTP
            <ArrowRight className="h-4 w-4" />
          </Link>
        );
      case 'pickup_otp':
        return (
          <button
            onClick={() => onTransitConfirm(assignment.id)}
            disabled={transitLoading === assignment.id}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {transitLoading === assignment.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Confirm In Transit
          </button>
        );
      case 'in_transit':
        return (
          <Link
            to={`/volunteer/otp?type=delivery&id=${assignment.id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Key className="h-4 w-4" />
            Enter Delivery OTP
            <ArrowRight className="h-4 w-4" />
          </Link>
        );
      case 'delivery_otp':
      case 'completed':
      case 'delivered':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {assignment.foodName || assignment.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">
              <Package className="h-3.5 w-3.5 inline mr-1" />
              {assignment.quantity} {assignment.unit}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            currentIdx < 3
              ? 'bg-blue-100 text-blue-700'
              : currentIdx < 5
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {(assignment.status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {assignment.pickupAddress && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Pickup</span>
              <span>{assignment.pickupAddress}</span>
            </div>
          </div>
        )}
        {assignment.destinationAddress && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Destination</span>
              <span>{assignment.destinationAddress}</span>
            </div>
          </div>
        )}
        {assignment.pickupTimeWindow && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{assignment.pickupTimeWindow}</span>
          </div>
        )}
        {assignment.contactPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <a href={`tel:${assignment.contactPhone}`} className="text-green-600 hover:underline">
              {assignment.contactPhone}
            </a>
          </div>
        )}
        {assignment.foodDetails && (
          <div className="bg-gray-50 rounded-lg p-3 mt-2 text-xs text-gray-600">
            <span className="font-medium text-gray-700 block mb-1">Food Details</span>
            {assignment.foodDetails}
          </div>
        )}
      </div>

      <DeliveryTimeline currentStatus={assignment.status} assignmentId={assignment.id} />

      <div className="mt-4">{renderActionButton()}</div>
    </div>
  );
}

function HistoryCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900">{item.foodName || item.name}</h3>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Delivered
        </span>
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{item.quantity} {item.unit}</span>
        </div>
        {item.completedAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{new Date(item.completedAt).toLocaleDateString()}</span>
          </div>
        )}
        {item.pickupAddress && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-gray-300" />
            <span>{item.pickupAddress} → {item.destinationAddress}</span>
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

export default function VolunteerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transitLoading, setTransitLoading] = useState(null);

  const [stats, setStats] = useState({
    activeAssignments: 0,
    completedDeliveries: 0,
    successRate: '0%',
  });

  const [activeAssignments, setActiveAssignments] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, assignmentsRes, historyRes] = await Promise.allSettled([
        volunteerService.getDashboardStats(),
        assignmentService.getActiveAssignments(),
        assignmentService.getAssignmentHistory(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
      if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value?.success) {
        setActiveAssignments(assignmentsRes.value.data || []);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
        setHistory(historyRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmTransit = async (assignmentId) => {
    try {
      setTransitLoading(assignmentId);
      const res = await assignmentService.confirmInTransit(assignmentId);
      if (res?.success) {
        setActiveAssignments((prev) =>
          prev.map((a) => (a.id === assignmentId ? { ...a, status: 'in_transit' } : a))
        );
      }
    } catch (err) {
      console.error('Transit confirmation failed:', err);
    } finally {
      setTransitLoading(null);
    }
  };

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
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Something went wrong</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
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
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your deliveries and manage active assignments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Truck}
          label="Active Assignments"
          value={stats.activeAssignments ?? activeAssignments.length}
          color="green"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Deliveries"
          value={stats.completedDeliveries ?? history.length}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Success Rate"
          value={stats.successRate ?? '—'}
          color="amber"
        />
      </div>

      {/* Active Assignments Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-lg bg-green-100 p-2">
            <Truck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Assignments</h2>
            <p className="text-sm text-gray-500">
              {activeAssignments.length > 0
                ? `You have ${activeAssignments.length} active assignment${activeAssignments.length > 1 ? 's' : ''}`
                : 'No active assignments'}
            </p>
          </div>
        </div>

        {activeAssignments.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No Active Assignments"
            description="You don't have any active delivery assignments. New assignments will appear here when you're matched with a pickup."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activeAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onTransitConfirm={handleConfirmTransit}
                transitLoading={transitLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assignment History Section */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-lg bg-blue-100 p-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delivery History</h2>
            <p className="text-sm text-gray-500">
              {history.length > 0
                ? `${history.length} completed deliver${history.length > 1 ? 'ies' : 'y'}`
                : 'No delivery history yet'}
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No Delivery History"
            description="Your completed deliveries will show up here. Complete your first assignment to get started!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {history.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
