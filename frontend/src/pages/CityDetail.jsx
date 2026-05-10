import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { cityAPI, activityAPI } from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Building2,
  TrendingUp,
  Wallet,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';

export default function CityDetail() {
  const { id } = useParams();

  const { data: cityData, isLoading: cityLoading } = useQuery(
    ['city', id],
    () => cityAPI.getCity(id).then(res => res.data.data),
    { staleTime: 10 * 60 * 1000 }
  );

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery(
    ['city-activities', id],
    () => activityAPI.getActivities({ city_id: id }).then(res => res.data.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const city = cityData?.city;
  const activities = activitiesData?.activities || [];

  if (cityLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">City not found</p>
        <Link to="/cities" className="btn-primary inline-flex mt-4">
          Back to Cities
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <Link
        to="/cities"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to cities
      </Link>

      {/* Hero */}
      <div className="card mb-8">
        <div className="h-64 bg-gradient-to-br from-primary-500 to-brand-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{city.name}</h1>
            <p className="text-xl text-white/90 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {city.country_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-brand-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Popularity</p>
            <p className="text-xl font-semibold text-gray-900">{city.popularity_score}/10</p>
          </div>
          <div className="p-6 text-center">
            <Building2 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Activities</p>
            <p className="text-xl font-semibold text-gray-900">{activities.length}</p>
          </div>
          <div className="p-6 text-center">
            <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-900">
              {city.latitude?.toFixed(2)}, {city.longitude?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Popular Activities</h2>
          <Link
            to={`/trips/create?city=${id}`}
            className="btn-primary inline-flex text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Plan Trip Here
          </Link>
        </div>

        {activitiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">No activities listed for this city yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="card-hover">
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Wallet className="w-4 h-4" />
                      ${activity.estimated_cost}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(activity.duration_minutes / 60)}h {activity.duration_minutes % 60}m
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
