import React from 'react';
import { MessageSquare, Database, FileText, User, Settings, LogOut } from 'lucide-react';
import { Sidebar as ShadcnSidebar, SidebarBody, SidebarLink, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SidebarContent: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({
  activeTab,
  onTabChange,
}) => {
  const { setOpen } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { open, animate } = useSidebar();
  const { t } = useLanguage();

  const navItems = [
    { id: 'chat', label: t('chat'), icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'data-sources', label: t('dataSources'), icon: <Database className="w-5 h-5" /> },
    { id: 'corpus', label: t('corpus'), icon: <FileText className="w-5 h-5" /> },
  ];

  const handleClick = (id: string) => {
    onTabChange(id);
    // Close mobile sidebar when clicking a link
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleSettings = () => {
    onTabChange('settings');
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2 pt-2">
        {navItems.map((item) => (
          <SidebarLink
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeTab === item.id}
            onClick={() => handleClick(item.id)}
          />
        ))}
      </nav>

      {/* User Profile Section at Bottom */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        {open || !animate ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 flex-shrink-0">
                <User className="w-5 h-5 text-gray-200" />
              </div>
              <motion.div
                animate={{
                  display: animate ? (open ? "block" : "none") : "block",
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-100 truncate">
                  {user?.displayName || user?.email?.split('@')[0] || t('user')}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </motion.div>
            </div>
            <motion.div
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="space-y-1 px-3"
            >
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{t('settings')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition-colors"
              aria-label="User menu"
            >
              <User className="w-5 h-5 text-gray-200" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <ShadcnSidebar>
      <SidebarBody>
        <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
      </SidebarBody>
    </ShadcnSidebar>
  );
};

