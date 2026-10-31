import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';

import {
  LayoutDashboard, Package, Plus, ListOrdered, Trophy, Map,
  Building2, BookmarkCheck, Truck, ClipboardList, Shield, Key,
  Recycle, History, BarChart3, Bell, Settings, LogOut, Menu, X,
  ChevronLeft, Leaf, Users, UtensilsCrossed
} from 'lucide-react';

const roleNavItems = {
  donor: [
    { path: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/donor/create-listing', label: 'Create Listing', icon: Plus },
    { path: '/donor/listings', label: 'My Listings', icon: ListOrdered },
    { path: '/donor/rewards', label: 'Rewards', icon: Trophy },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/map', label: 'Map', icon: Map },
  ],
  organization: [
    { path: '/organization/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/organization/available-food', label: 'Available Food', icon: Package },
    { path: '/organization/reservations', label: 'Reservations', icon: BookmarkCheck },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/map', label: 'Map', icon: Map },
  ],
  ngo: [
    { path: '/organization/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/organization/available-food', label: 'Available Food', icon: Package },
    { path: '/organization/reservations', label: 'Reservations', icon: BookmarkCheck },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/map', label: 'Map', icon: Map },
  ],
  distributor: [
    { path: '/organization/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/organization/available-food', label: 'Available Food', icon: Package },
    { path: '/organization/reservations', label: 'Reservations', icon: BookmarkCheck },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/map', label: 'Map', icon: Map },
  ],
  volunteer: [
    { path: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/volunteer/assignments', label: 'Assignments', icon: ClipboardList },
    { path: '/volunteer/safety-check', label: 'Safety Check', icon: Shield },
    { path: '/volunteer/otp', label: 'OTP Verify', icon: Key },
    { path: '/map', label: 'Map', icon: Map },
  ],
  biofarm: [
    { path: '/biofarm/dashboard', label: 'Waste Recovery', icon: Recycle },
    { path: '/biofarm/recovery', label: 'Available Recovery', icon: Package },
    { path: '/biofarm/history', label: 'History', icon: History },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/map', label: 'Map', icon: Map },
  ],
};

const roleLabels = {
  donor: 'Donor',
  organization: 'Organization',
  distributor: 'NGO / Organization',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  biofarm: 'Biofarm',
  admin: 'Admin',
};

const roleIcons = {
  donor: UtensilsCrossed,
  organization: Building2,
  distributor: Building2,
  ngo: Building2,
  volunteer: Truck,
  biofarm: Leaf,
  admin: Users,
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = (user?.role || user?.subRole || user?.normalizedRole || 'donor').toLowerCase();
  const navItems = roleNavItems[role] || roleNavItems.donor;
  const RoleIcon = roleIcons[role] || LayoutDashboard;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <span className="text-lg font-bold text-green-600">FOODBRIDGE</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" />
                <span className="text-lg font-bold text-green-600">FOODBRIDGE</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <RoleIcon className="w-3 h-3" />
                    {roleLabels[role]}
                  </p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={isActive
                        ? 'flex items-center gap-3 px-4 py-2.5 rounded-lg bg-green-50 text-green-700 font-semibold text-sm'
                        : 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors text-sm font-medium'
                      }
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-green-600 flex-shrink-0" />
            {sidebarOpen && <span className="text-xl font-bold text-green-600">FOODBRIDGE</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className={`flex items-center gap-3 ${sidebarOpen ? 'p-3 bg-green-50 rounded-lg' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <RoleIcon className="w-3 h-3 flex-shrink-0" />
                  {roleLabels[role]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={isActive
                  ? `flex items-center gap-3 px-4 py-2.5 rounded-lg bg-green-50 text-green-700 font-semibold text-sm ${!sidebarOpen ? 'justify-center' : ''}`
                  : `flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors text-sm font-medium ${!sidebarOpen ? 'justify-center' : ''}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link
            to="/notifications"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {sidebarOpen && 'Notifications'}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium w-full ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-16 lg:pt-0`}>
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
          <div />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
