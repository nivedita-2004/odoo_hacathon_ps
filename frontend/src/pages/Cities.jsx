import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { cityAPI } from '../services/api';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Loader2, 
  Building2,
  Globe2,
  Compass,
  Star,
  ArrowRight,
  Sparkles,
  Landmark,
  MapPinned,
  Navigation
} from 'lucide-react';

// Country flag emoji mapping for major countries
const getCountryFlag = (countryName) => {
  const flags = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Thailand': '🇹🇭',
    'Australia': '🇦🇺',
    'Canada': '🇨🇦',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'United Arab Emirates': '🇦🇪',
    'Singapore': '🇸🇬',
    'Netherlands': '🇳🇱',
    'Switzerland': '🇨🇭',
  };
  return flags[countryName] || '🌍';
};

// Get gradient based on popularity score
const getPopularityGradient = (score) => {
  if (score >= 9) return 'from-emerald-400 via-teal-400 to-cyan-400';
  if (score >= 8) return 'from-primary-400 via-primary-500 to-primary-600';
  if (score >= 7) return 'from-brand-400 via-orange-400 to-brand-500';
  if (score >= 6) return 'from-violet-400 via-purple-400 to-violet-500';
  return 'from-gray-300 via-gray-400 to-gray-500';
};

// Get popularity label
const getPopularityLabel = (score) => {
  if (score >= 9) return { text: 'Trending', color: 'bg-emerald-500' };
  if (score >= 8) return { text: 'Popular', color: 'bg-primary-500' };
  if (score >= 7) return { text: 'Rising', color: 'bg-brand-500' };
  return { text: 'Upcoming', color: 'bg-gray-500' };
};

// Get city image URL from Unsplash
const getCityImage = (cityName) => {
  // Use Unsplash Source API for free city images
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(cityName)},city,landscape`;
};

// Fallback images for popular cities (more reliable)
const cityImages = {
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
  'Venice': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400&h=300&fit=crop',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop',
  'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop',
  'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&h=300&fit=crop',
  'Mumbai': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&h=300&fit=crop',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop',
  'Los Angeles': 'https://images.unsplash.com/photo-1580655653885-65763b8097d0?w=400&h=300&fit=crop',
};

export default function Cities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCity, setHoveredCity] = useState(null);

  const { data: citiesData, isLoading } = useQuery(
    ['cities', searchQuery],
    () => cityAPI.getCities({ search: searchQuery }).then(res => res.data.data),
    { keepPreviousData: true }
  );

  const { data: popularData } = useQuery(
    'popular-cities',
    () => cityAPI.getPopularCities().then(res => res.data.data),
    { staleTime: 10 * 60 * 1000 }
  );

  const cities = citiesData?.cities || [];
  const popularCities = popularData?.cities || [];

  const stats = [
    { label: 'Total Destinations', value: cities.length, icon: Globe2, color: 'bg-primary-500' },
    { label: 'Popular Cities', value: popularCities.length, icon: Star, color: 'bg-brand-500' },
    { label: 'Countries', value: new Set(cities.map(c => c.country_name)).size, icon: Landmark, color: 'bg-emerald-500' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-primary-600">Discover the World</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Explore <span className="bg-gradient-to-r from-primary-600 to-brand-500 bg-clip-text text-transparent">Destinations</span>
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Find your next adventure from our curated list of amazing cities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="🔍 Search for cities, countries, or places..."
          />
        </div>
      </div>

      {/* Popular Cities */}
      {!searchQuery && popularCities.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
                <p className="text-sm text-gray-500">Most visited cities this month</p>
              </div>
            </div>
            <Link 
              to="/cities" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-all"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCities.slice(0, 6).map((city, index) => {
              const rank = index + 1;
              const gradient = getPopularityGradient(city.popularity_score);
              const cityImage = cityImages[city.name] || getCityImage(city.name);
              
              return (
                <Link
                  key={city.id}
                  to={`/cities/${city.id}`}
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 relative"
                >
                  {/* Rank Badge */}
                  <div className={`
                    absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg
                    ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                      rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-gradient-to-br from-primary-400 to-primary-500'}
                  `}>
                    #{rank}
                  </div>
                  
                  {/* City Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={cityImage} 
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://source.unsplash.com/400x300/?city,landscape`;
                      }}
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-30`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Flag Badge */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-2xl">{getCountryFlag(city.country_name)}</span>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-3 text-center">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{city.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{city.country_name}</p>
                    
                    {/* Popularity Score */}
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-700">{city.popularity_score}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All Cities */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {searchQuery ? 'Search Results' : 'All Destinations'}
              </h2>
              <p className="text-sm text-gray-500">
                {searchQuery ? `Found ${cities.length} matching cities` : `Browse all ${cities.length} destinations`}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-500">Discovering amazing places...</p>
          </div>
        ) : cities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinned className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery 
                ? `We couldn't find any cities matching "${searchQuery}". Try a different search term.`
                : 'No cities available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cities.map((city) => {
              const gradient = getPopularityGradient(city.popularity_score);
              const label = getPopularityLabel(city.popularity_score);
              const cityImage = cityImages[city.name] || getCityImage(city.name);
              
              return (
                <Link
                  key={city.id}
                  to={`/cities/${city.id}`}
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Card Header with Photo */}
                  <div className="relative h-48 overflow-hidden">
                    {/* City Photo */}
                    <img 
                      src={cityImage} 
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://source.unsplash.com/400x300/?city,landscape`;
                      }}
                    />
                    
                    {/* Dark Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Gradient Tint Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-20 mix-blend-overlay`} />
                    
                    {/* Popularity Badge */}
                    <div className={`
                      absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md z-10
                      ${label.color}
                    `}>
                      {label.text}
                    </div>
                    
                    {/* Flag Badge - Bottom Left */}
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">{getCountryFlag(city.country_name)}</span>
                    </div>
                    
                    {/* Score Badge - Bottom Right */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg z-10">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{city.popularity_score}</span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <span className="text-base">{getCountryFlag(city.country_name)}</span>
                          {city.country_name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Trip Count if available */}
                    {city.trip_count > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                        <Navigation className="w-4 h-4" />
                        <span className="font-medium">{city.trip_count} trips planned</span>
                      </div>
                    )}
                    
                    {/* Explore Button */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {city.latitude && city.longitude ? '📍 Location available' : ''}
                      </span>
                      <div className={`
                        flex items-center gap-1 text-sm font-semibold text-primary-600 transition-all duration-300
                        ${hoveredCity === city.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-70'}
                      `}>
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
