import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import {
  Map,
  Plus,
  Search,
  Calendar,
  Eye,
  Globe,
  Lock,
  MoreVertical,
  Loader2,
  TrendingUp,
  Clock,
  Wallet,
  ArrowRight,
  Compass,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const visibilityIcons = {
  public: Globe,
  private: Lock,
  friends: Eye,
};

const visibilityColors = {
  public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  private: 'bg-slate-100 text-slate-700 border-slate-200',
  friends: 'bg-blue-100 text-blue-700 border-blue-200',
};

const visibilityBgColors = {
  public: 'from-emerald-400 to-teal-500',
  private: 'from-slate-400 to-gray-500',
  friends: 'from-blue-400 to-indigo-500',
};

export default function Trips() {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibility, setVisibility] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery(
    ['trips', page, searchQuery, visibility],
    () => tripAPI.getTrips({ 
      page, 
      limit: 12, 
      search: searchQuery,
      visibility 
    }).then(res => res.data.data),
    { keepPreviousData: true }
  );

  const trips = data?.trips || [];
  const pagination = data?.pagination || {};

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await tripAPI.deleteTrip(id);
      toast.success('Trip deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const getDaysUntil = (startDate) => {
    if (!startDate) return null;
    const days = Math.ceil((new Date(startDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  const stats = [
    { label: 'Total Trips', value: pagination?.total || trips.length, icon: Compass, color: 'bg-primary-500' },
    { label: 'This Month', value: trips.filter(t => t.start_date && new Date(t.start_date).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'bg-brand-500' },
    { label: 'Public Trips', value: trips.filter(t => t.visibility === 'public').length, icon: Globe, color: 'bg-emerald-500' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500">Manage and plan your adventures</p>
        </div>
        <Link
          to="/trips/create"
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your trips..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
        >
          <option value="">All Trips</option>
          <option value="private">🔒 Private</option>
          <option value="public">🌍 Public</option>
          <option value="friends">👥 Friends</option>
        </select>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading your adventures...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search or filters to find what you\'re looking for'
              : 'Your adventure awaits! Start planning your first trip and make unforgettable memories.'
            }
          </p>
          {!searchQuery && (
            <Link
              to="/trips/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Plan Your First Trip
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const VisibilityIcon = visibilityIcons[trip.visibility] || Lock;
              const daysUntil = getDaysUntil(trip.start_date);
              const gradientClass = visibilityBgColors[trip.visibility] || 'from-gray-400 to-gray-500';
              
              return (
                <div key={trip.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300">
                  {/* Card Header with Gradient */}
                  <div className={`h-40 bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/90 ${visibilityColors[trip.visibility]} flex items-center gap-1.5`}>
                        <VisibilityIcon className="w-3.5 h-3.5" />
                        {trip.visibility}
                      </div>
                    </div>
                    {daysUntil && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 text-primary-700 shadow-sm">
                        {daysUntil === 1 ? '🎉 Tomorrow!' : `⏰ ${daysUntil} days`}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-1">
                        {trip.title}
                      </h3>
                    </div>
                    <div className="absolute bottom-0 right-0 opacity-20 transform translate-x-8 translate-y-8">
                      <Map className="w-32 h-32 text-white" />
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5">
                    {/* Date Row */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span className="font-medium">
                          {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} 
                          <span className="text-gray-400 mx-1">→</span>
                          {trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </span>
                      </div>
                      {trip.stop_count > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <TrendingUp className="w-4 h-4" />
                          <span>{trip.stop_count} stops</span>
                        </div>
                      )}
                    </div>

                    {/* Budget & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="font-bold text-gray-900">
                            ${trip.total_budget?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/trips/${trip.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all group-hover:shadow-lg"
                        >
                          View
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      page === p 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
