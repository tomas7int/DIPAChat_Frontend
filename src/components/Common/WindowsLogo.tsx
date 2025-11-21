import React from 'react';

interface WindowsLogoProps {
  className?: string;
}

export const WindowsLogo: React.FC<WindowsLogoProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 12.4028L35.5 8.5V41.5H0V12.4028Z"
        fill="currentColor"
      />
      <path
        d="M0 46.5H35.5V79.5L0 75.5972V46.5Z"
        fill="currentColor"
      />
      <path
        d="M40.5 8.5L88 4.5V41.5H40.5V8.5Z"
        fill="currentColor"
      />
      <path
        d="M40.5 46.5H88V83.5L40.5 79.5V46.5Z"
        fill="currentColor"
      />
    </svg>
  );
};



