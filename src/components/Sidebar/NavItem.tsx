import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600/20 text-primary-400 font-medium border border-primary-600/30'
          : 'text-dark-textMuted hover:bg-dark-surfaceHover hover:text-dark-text'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

