import { useState, useEffect } from 'react';
import { notificationService } from '../services';
import {
  Bell, CheckCircle2, Package, Truck, Shield, AlertTriangle,
  Info, Loader2, CheckCheck, Trash2
} from 'lucide-react';

const typeIcons = {
  donation: Package,
  pickup: Truck,
  safety: Shield,
  match: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  default: Bell,
};

const typeColors = {
  donation: 'text-green-600 bg-green-100',
  pickup: 'text-blue-600 bg-blue-100',
  safety: 'text-purple-600 bg-purple-100',
  match: 'text-emerald-600 bg-emerald-100',
  warning: 'text-orange-600 bg-orange-100',
  info: 'text-gray-600 bg-gray-100',
  default: 'text-gray-600 bg-gray-100',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getAll();
      if (response?.success) {
        setNotifications(response.data || []);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

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
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'unread', 'donation', 'pickup', 'safety', 'match', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const Icon = typeIcons[notification.type] || typeIcons.default;
            const colorClass = typeColors[notification.type] || typeColors.default;
            return (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.read ? 'border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {notification.title || notification.message}
                  </p>
                  {notification.description && (
                    <p className="text-xs text-gray-400 mt-1">{notification.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
