import React from 'react';
import { MFASetup } from './MFASetup';
import { AccountSettings } from './AccountSettings';

export const SettingsView: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="p-6 border-b border-gray-800 bg-gray-900">
        <h2 className="text-2xl font-semibold text-gray-100">Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your account preferences and security</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AccountSettings />
        <MFASetup />
      </div>
    </div>
  );
};

