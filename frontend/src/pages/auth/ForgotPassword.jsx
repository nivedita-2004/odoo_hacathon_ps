import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Mail, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password, 4: success
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authAPI.verifyOTP({ email, otp });
      toast.success('OTP verified!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authAPI.resetPassword({ email, otp, new_password: newPassword });
      toast.success('Password reset successfully!');
      setStep(4);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/login"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to login
      </Link>

      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot password?
          </h2>
          <p className="text-gray-500 mb-8">
            Enter your email and we'll send you an OTP to reset your password.
          </p>

          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enter OTP
          </h2>
          <p className="text-gray-500 mb-8">
            We've sent a 6-digit OTP to {email}
          </p>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Didn't receive? Try again
            </button>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset password
          </h2>
          <p className="text-gray-500 mb-8">
            Create a new password for your account
          </p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </>
      )}

      {step === 4 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Password reset!
          </h2>
          <p className="text-gray-500 mb-8">
            Your password has been reset successfully.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex px-8 py-3"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
