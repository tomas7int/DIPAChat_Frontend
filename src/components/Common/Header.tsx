import React, { useState, useRef, useEffect } from 'react';
import { Shield, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DIPALogo } from './DIPALogo';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'lt' as const, name: 'Lietuvių', flag: '🇱🇹' },
];

export const Header: React.FC = () => {
  const { mfaStatus } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-12 flex items-center">
          <DIPALogo className="h-full w-auto" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {mfaStatus?.enabled && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">{t('mfaEnabled')}</span>
          </div>
        )}

        {/* Language Selector */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Change language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{currentLanguage.flag}</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              showLanguageDropdown && "rotate-180"
            )} />
          </button>

          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                      language === lang.code
                        ? "bg-gray-700 text-gray-100"
                        : "text-gray-200 hover:bg-gray-700"
                    )}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && (
                      <span className="ml-auto text-xs text-gray-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


