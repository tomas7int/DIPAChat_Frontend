import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSourceTypeCardProps {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
}

export const DataSourceTypeCard: React.FC<DataSourceTypeCardProps> = ({
  type,
  title,
  description,
  icon,
  isSelected = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full p-5 bg-gray-900 border rounded-xl text-left transition-all hover:border-gray-700 hover:shadow-lg flex flex-col h-full',
        isSelected
          ? 'border-gray-700 shadow-lg'
          : 'border-gray-800'
      )}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 z-10">
          <Check className="w-4 h-4 text-gray-200" />
        </div>
      )}
      
      <div className="flex flex-col gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 flex-shrink-0">
          <div className="text-gray-200">
            {icon}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-100 mb-2">{title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};

