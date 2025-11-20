import React from 'react';
import { User, Mail, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AccountSettings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
          <User className="w-6 h-6 text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-100">Account Information</h3>
          <p className="text-sm text-gray-400">View and manage your account details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">
              {user?.displayName || user?.email?.split('@')[0] || 'Not set'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-200">{user?.email || 'Not available'}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
            <Key className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-400 font-mono break-all">{user?.uid || 'Not available'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

