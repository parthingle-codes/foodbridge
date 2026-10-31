import { useState, useEffect } from 'react';
import { adminService } from '../services';
import {
  LayoutDashboard, Users, Building2, Truck, Leaf, Package,
  CheckCircle2, Recycle, Shield, Loader2, RefreshCw, Eye, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, verRes] = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getVerificationRequests(),
      ]);
      if (dashRes.status === 'fulfilled' && dashRes.value?.success) {
        setStats(dashRes.value.data);
      }
      if (verRes.status === 'fulfilled' && verRes.value?.success) {
        setVerificationRequests(verRes.value.data || []);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }));
    try {
      const res = await adminService.approveOrganization(id);
      if (res?.success) {
        toast.success('Organization approved');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'reject' }));
    try {
      const res = await adminService.rejectOrganization(id);
      if (res?.success) {
        toast.success('Organization rejected');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Donors', value: stats?.donors || 0, icon: Package, color: 'text-green-600 bg-green-100' },
    { label: 'Verified NGOs', value: stats?.verifiedNGOs || 0, icon: Building2, color: 'text-purple-600 bg-purple-100' },
    { label: 'Volunteers', value: stats?.volunteers || 0, icon: Truck, color: 'text-cyan-600 bg-cyan-100' },
    { label: 'Biofarms', value: stats?.biofarms || 0, icon: Leaf, color: 'text-amber-600 bg-amber-100' },
    { label: 'Food Listings', value: stats?.foodListings || 0, icon: Package, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Distributions', value: stats?.successfulDistributions || 0, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    { label: 'Waste Recovery', value: stats?.wasteRecovery || 0, icon: Recycle, color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" /> Organization Verification Requests
        </h2>
        {verificationRequests.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No pending verification requests</p>
        ) : (
          <div className="space-y-3">
            {verificationRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{req.organizationName || req.name}</p>
                  <p className="text-sm text-gray-500">{req.email} • {req.registrationNumber || 'No reg. number'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applied: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={!!actionLoading[req.id]}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading[req.id] === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={!!actionLoading[req.id]}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading[req.id] === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
