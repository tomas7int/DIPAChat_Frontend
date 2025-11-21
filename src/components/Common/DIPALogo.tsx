import React from 'react';
import logoImage from '@/logo.png';

interface DIPALogoProps {
  className?: string;
}

export const DIPALogo: React.FC<DIPALogoProps> = ({ className }) => {
  return (
    <img
      src={logoImage}
      alt="DIPA Logo"
      className={className}
      style={{ 
        height: '100%', 
        width: 'auto', 
        display: 'block', 
        objectFit: 'contain',
        maxHeight: '100%'
      }}
      onError={(e) => {
        console.error('Failed to load logo.png - make sure the file exists in the src folder');
      }}
    />
  );
};

