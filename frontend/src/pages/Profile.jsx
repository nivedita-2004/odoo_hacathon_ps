import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { userAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import {
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    preferred_currency: user?.preferred_currency || 'USD',
    language_preference: user?.language_preference || 'en',
  });

  const updateMutation = useMutation(
    (data) => userAPI.updateProfile(data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        fetchUser();
        setIsEditing(false);
      },
      onError: () => {
        toast.error('Failed to update profile');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        {/* Avatar Section */}
        <div className="p-8 text-center border-b border-gray-200 bg-gradient-to-br from-primary-50 to-brand-50">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt={user.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">{user?.full_name}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
                className="input disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="input disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Preferred Currency
              </label>
              <select
                value={formData.preferred_currency}
                onChange={(e) => setFormData({ ...formData, preferred_currency: e.target.value })}
                disabled={!isEditing}
                className="input disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className="input disabled:bg-gray-50 disabled:text-gray-500 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="btn-primary flex-1"
                >
                  {updateMutation.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-primary w-full"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
