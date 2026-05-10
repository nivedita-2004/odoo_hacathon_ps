import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../services/api';
import {
  Lock,
  Bell,
  Shield,
  Moon,
  Globe,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingItem = ({ icon: Icon, title, description, action, danger }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        danger ? 'bg-red-100' : 'bg-gray-100'
      }`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-gray-600'}`} />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {action}
  </div>
);

export default function Settings() {
  const { logout } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await authAPI.logoutAll();
      toast.success('Logged out from all devices');
    } catch (error) {
      toast.error('Failed to logout from all devices');
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      {/* Security Section */}
      <div className="card mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Security
          </h2>
        </div>
        <div className="p-6">
          <SettingItem
            icon={Lock}
            title="Change Password"
            description="Update your account password"
            action={
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-secondary text-sm"
              >
                Change
              </button>
            }
          />
          <SettingItem
            icon={Globe}
            title="Active Sessions"
            description="Manage your active login sessions"
            action={
              <button
                onClick={handleLogoutAll}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Logout All
              </button>
            }
          />
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            Preferences
          </h2>
        </div>
        <div className="p-6">
          <SettingItem
            icon={Bell}
            title="Email Notifications"
            description="Receive trip reminders and updates"
            action={
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            }
          />
          <SettingItem
            icon={Moon}
            title="Dark Mode"
            description="Switch between light and dark themes"
            action={
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            }
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="p-6 border-b border-red-100">
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn-primary flex-1"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
