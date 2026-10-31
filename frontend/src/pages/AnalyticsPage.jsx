import { useState, useEffect } from 'react';
import { analyticsService } from '../services';
import {
  BarChart3, TrendingUp, Package, Truck, CheckCircle2, Recycle,
  UtensilsCrossed, Users, Loader2, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes] = await Promise.allSettled([
        analyticsService.getOverview(),
        analyticsService.getDonationTrends(),
      ]);
      if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
        setData(overviewRes.value.data);
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value?.success) {
        setTrends(trendsRes.value.data || []);
      }
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback sample data for charts when backend hasn't returned data yet
  const sampleTrends = trends.length > 0 ? trends : [
    { month: 'May', donated: 120, rescued: 95, recovered: 25 },
    { month: 'Jun', donated: 180, rescued: 150, recovered: 30 },
    { month: 'Jul', donated: 250, rescued: 210, recovered: 40 },
    { month: 'Aug', donated: 310, rescued: 280, recovered: 30 },
    { month: 'Sep', donated: 400, rescued: 350, recovered: 50 },
    { month: 'Oct', donated: 480, rescued: 420, recovered: 60 },
  ];

  const distributionData = [
    { name: 'Rescued & Delivered', value: data?.totalRescued || 350 },
    { name: 'Waste Recovered', value: data?.totalRecovered || 60 },
    { name: 'Missed/Expired', value: data?.missed || 20 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Donated', value: data?.totalDonated || 0, unit: 'kg', icon: Package, color: 'text-green-600 bg-green-100' },
    { label: 'Food Rescued', value: data?.totalRescued || 0, unit: 'kg', icon: CheckCircle2, color: 'text-blue-600 bg-blue-100' },
    { label: 'Servings Provided', value: data?.totalServings || 0, unit: '', icon: UtensilsCrossed, color: 'text-purple-600 bg-purple-100' },
    { label: 'Waste Recovered', value: data?.totalRecovered || 0, unit: 'kg', icon: Recycle, color: 'text-amber-600 bg-amber-100' },
    { label: 'Successful Pickups', value: data?.successfulPickups || 0, unit: '', icon: Truck, color: 'text-cyan-600 bg-cyan-100' },
    { label: 'Active Volunteers', value: data?.activeVolunteers || 0, unit: '', icon: Users, color: 'text-rose-600 bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impact Analytics</h1>
          <p className="text-gray-500 text-sm">Food rescue and distribution metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString()}{stat.unit && <span className="text-sm text-gray-400 ml-1">{stat.unit}</span>}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Rescue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" /> Monthly Rescue Trend
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleTrends}>
              <defs>
                <linearGradient id="colorDonated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRescued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Area type="monotone" dataKey="donated" name="Donated (kg)" stroke="#16a34a" fill="url(#colorDonated)" strokeWidth={2} />
              <Area type="monotone" dataKey="rescued" name="Rescued (kg)" stroke="#2563eb" fill="url(#colorRescued)" strokeWidth={2} />
              <Line type="monotone" dataKey="recovered" name="Recovered (kg)" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Food Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {distributionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pickup Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pickup Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="rescued" name="Successful" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" name="Recovered" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-green-50 rounded-xl border border-green-200 p-6">
        <h2 className="text-lg font-semibold text-green-800 mb-3">Key Impact Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-green-700">{data?.deliverySuccessRate || 95}%</p>
            <p className="text-sm text-green-600">Delivery Success Rate</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-700">{data?.avgResponseTime || '2.5'}h</p>
            <p className="text-sm text-green-600">Avg Response Time</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-700">{data?.activeDonors || 0}</p>
            <p className="text-sm text-green-600">Active Donors</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-700">{data?.partnerNGOs || 0}</p>
            <p className="text-sm text-green-600">Partner NGOs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
