import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { userAPI, tripAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import {
  Map,
  Wallet,
  Calendar,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Compass,
  Globe,
  Lock,
  Eye,
  Sparkles,
  Luggage,
  Camera,
  MapPin
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, shadowColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendingUp className={`w-4 h-4 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg ${shadowColor}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    () => userAPI.getDashboard().then(res => res.data.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: tripsData, isLoading: tripsLoading } = useQuery(
    'recent-trips',
    () => tripAPI.getTrips({ page: 1, limit: 5 }).then(res => res.data.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const stats = dashboardData?.stats || {};
  const recentTrips = tripsData?.trips || [];

  const firstName = user?.full_name?.split(' ')[0] || 'Traveler';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const getVisibilityIcon = (visibility) => {
    switch(visibility) {
      case 'public': return Globe;
      case 'private': return Lock;
      case 'friends': return Eye;
      default: return Lock;
    }
  };

  const getVisibilityColor = (visibility) => {
    switch(visibility) {
      case 'public': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'private': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'friends': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-primary-600">{greeting}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{firstName}</span>! ✈️
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Here's what's happening with your travel plans
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Trips"
          value={stats.total_trips || 0}
          icon={Luggage}
          trend="+2 this month"
          trendUp={true}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          shadowColor="shadow-primary-500/30"
        />
        <StatCard
          title="Upcoming Trips"
          value={stats.upcoming_trips || 0}
          icon={Calendar}
          color="bg-gradient-to-br from-brand-500 to-orange-500"
          shadowColor="shadow-brand-500/30"
        />
        <StatCard
          title="Total Spent"
          value={`$${(stats.total_spent || 0).toLocaleString()}`}
          icon={Wallet}
          trend="-12% vs last month"
          trendUp={true}
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
          shadowColor="shadow-emerald-500/30"
        />
        <StatCard
          title="Packing Progress"
          value={`${stats.packing_progress || 0}%`}
          icon={CheckCircle2}
          color="bg-gradient-to-br from-violet-500 to-purple-500"
          shadowColor="shadow-violet-500/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Trips</h2>
                <p className="text-sm text-gray-500">Your latest travel plans</p>
              </div>
              <Link
                to="/trips"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {tripsLoading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading your adventures...</p>
                </div>
              ) : recentTrips.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Your adventure awaits! Start planning your first trip and make unforgettable memories.
                  </p>
                  <Link
                    to="/trips/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5" />
                    Plan Your First Trip
                  </Link>
                </div>
              ) : (
                recentTrips.map((trip) => {
                  const VisibilityIcon = getVisibilityIcon(trip.visibility);
                  return (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="group p-5 flex items-center gap-5 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 via-primary-50 to-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                        <MapPin className="w-8 h-8 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-primary-600 transition-colors">
                          {trip.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'} 
                          <span className="text-gray-300">→</span>
                          {trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getVisibilityColor(trip.visibility)}`}>
                          <VisibilityIcon className="w-3.5 h-3.5" />
                          {trip.visibility}
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-500">Get started quickly</p>
            </div>

            <div className="p-4 space-y-2">
              {[
                { to: '/trips/create', icon: Plus, color: 'bg-primary-600', label: 'Create New Trip', desc: 'Plan your next adventure' },
                { to: '/cities', icon: Camera, color: 'bg-brand-500', label: 'Explore Destinations', desc: 'Discover new places' },
                { to: '/budget', icon: Wallet, color: 'bg-emerald-500', label: 'Track Budget', desc: 'Manage trip expenses' },
                { to: '/packing', icon: Luggage, color: 'bg-violet-500', label: 'Packing List', desc: 'Organize your items' },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.to}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Travel Tip Card */}
          <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-brand-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-semibold">Travel Tip</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                Book flights 2-3 months in advance for international trips to get the best deals. Save up to 40% on average!
              </p>
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">This Month</h3>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {recentTrips.filter(t => t.start_date && new Date(t.start_date).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-sm text-gray-500">trips planned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
