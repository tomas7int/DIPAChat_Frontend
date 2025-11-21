import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const MFASetup: React.FC = () => {
  const { mfaStatus, refreshMFAStatus } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshMFAStatus();
  }, [refreshMFAStatus]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      toast.success('MFA setup initiated. Check your phone for verification code. (UI Test Mode)');
      setStep('verify');
      setLoading(false);
    }, 500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      toast.success('MFA enabled successfully (UI Test Mode)');
      refreshMFAStatus();
      setStep('setup');
      setPhoneNumber('');
      setVerificationCode('');
      setLoading(false);
    }, 500);
  };

  if (mfaStatus?.enabled) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <CheckCircle className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Multi-Factor Authentication</h3>
            <p className="text-sm text-gray-400">MFA is currently enabled</p>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-200">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Your account is protected with MFA</span>
          </div>
          {mfaStatus.phoneNumber && (
            <p className="text-sm text-gray-400 mt-2">
              Phone: {mfaStatus.phoneNumber}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
          <Shield className="w-6 h-6 text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Multi-Factor Authentication</h3>
          <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
        </div>
      </div>

      {step === 'setup' ? (
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="+1234567890"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter your phone number with country code (e.g., +1234567890)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-gray-100 py-3 rounded-lg font-medium border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Setting up...' : 'Setup MFA'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-center text-2xl tracking-widest transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter the verification code sent to your phone
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep('setup');
                setVerificationCode('');
              }}
              className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-800 text-gray-100 py-3 rounded-lg font-medium border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

