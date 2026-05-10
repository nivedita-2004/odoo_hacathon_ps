import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { tripAPI } from '../../services/api';
import { ArrowLeft, Loader2, Map, Calendar, DollarSign, Globe, Lock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const visibilityOptions = [
  { value: 'private', label: 'Private', icon: Lock, desc: 'Only you can see this trip' },
  { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can view this trip' },
  { value: 'friends', label: 'Friends', icon: Users, desc: 'Only friends can view' },
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    visibility: 'private',
  });

  const createMutation = useMutation(
    (data) => tripAPI.createTrip(data),
    {
      onSuccess: (response) => {
        toast.success('Trip created successfully!');
        navigate(`/trips/${response.data.data.id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create trip');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      toast.error('End date must be after start date');
      return;
    }

    const submitData = {
      ...formData,
      total_budget: formData.total_budget ? parseFloat(formData.total_budget) : 0,
    };

    createMutation.mutate(submitData);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/trips')}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to trips
      </button>

      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
          <p className="text-gray-500">Plan your next adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Title *
            </label>
            <div className="relative">
              <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input pl-10"
                placeholder="e.g., Summer Vacation in Europe"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Budget (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.total_budget}
                onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                className="input pl-10"
                placeholder="5000"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibility
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: option.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.visibility === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${
                      formData.visibility === option.value ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="btn-primary flex-1"
            >
              {createMutation.isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
