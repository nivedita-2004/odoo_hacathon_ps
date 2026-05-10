import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { tripAPI } from '../../services/api';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Loader2,
  Plus,
  Globe,
  Lock,
  Users,
  Route
} from 'lucide-react';
import toast from 'react-hot-toast';

const visibilityIcons = {
  public: Globe,
  private: Lock,
  friends: Users,
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: tripData, isLoading: tripLoading } = useQuery(
    ['trip', id],
    () => tripAPI.getTrip(id).then(res => res.data.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: itineraryData, isLoading: itineraryLoading } = useQuery(
    ['itinerary', id],
    () => tripAPI.getItinerary(id).then(res => res.data.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const trip = tripData?.trip;
  const itinerary = itineraryData?.itinerary || [];

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await tripAPI.deleteTrip(id);
      toast.success('Trip deleted successfully');
      navigate('/trips');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Trip not found</p>
        <Link to="/trips" className="btn-primary inline-flex mt-4">
          Back to Trips
        </Link>
      </div>
    );
  }

  const VisibilityIcon = visibilityIcons[trip.visibility] || Lock;

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <Link
        to="/trips"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to trips
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="h-64 bg-gradient-to-br from-primary-500 to-brand-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-white/20 backdrop-blur-sm`}>
                <VisibilityIcon className="w-3 h-3" />
                {trip.visibility}
              </div>
            </div>
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            <p className="text-white/80 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'No start date'} - 
              {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'No end date'}
            </p>
          </div>
          
          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleDelete}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-xl font-semibold text-gray-900">
              ${trip.total_budget?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Destinations</p>
            <p className="text-xl font-semibold text-gray-900">
              {itinerary.length || 0} stops
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-xl font-semibold text-gray-900">
              {trip.start_date && trip.end_date 
                ? `${Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24))} days`
                : 'Not set'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            {['overview', 'itinerary', 'budget', 'packing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Trip Overview</h3>
                <p className="text-gray-600">
                  This is your trip to {trip.title}. Start planning by adding destinations to your itinerary.
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  to={`/trips/${id}/budget`}
                  className="btn-secondary inline-flex"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Manage Budget
                </Link>
                <Link
                  to={`/trips/${id}/packing`}
                  className="btn-secondary inline-flex"
                >
                  <Route className="w-5 h-5 mr-2" />
                  Packing List
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trip Itinerary</h3>
                <button className="btn-primary inline-flex text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Stop
                </button>
              </div>

              {itinerary.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No stops added yet</p>
                  <button className="btn-primary inline-flex mt-4 text-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add First Stop
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((stop, index) => (
                    <div key={stop.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        {index < itinerary.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="card p-4">
                          <h4 className="font-medium text-gray-900">{stop.city_name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(stop.arrival_date).toLocaleDateString()} - {new Date(stop.departure_date).toLocaleDateString()}
                          </p>
                          {stop.activities?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {stop.activities.map((activity) => (
                                <span key={activity.id} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                  {activity.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Budget details coming soon</p>
            </div>
          )}

          {activeTab === 'packing' && (
            <div className="text-center py-8">
              <Route className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Packing list coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
