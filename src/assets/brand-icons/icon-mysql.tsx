import React from 'react';

export const IconMysql = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
      fill="#00618A"
    />
    <path 
      d="M16.5 10.5C16.5 12.5 15.5 14 13.5 14.5C14.5 14.5 16 13.5 16.5 12.5V10.5Z" 
      fill="#E68A00"
    />
    <path 
      d="M7.5 10.5C7.5 12.5 8.5 14 10.5 14.5C9.5 14.5 8 13.5 7.5 12.5V10.5Z" 
      fill="#E68A00"
    />
    <path 
      d="M12 16.5C14.5 16.5 16.5 15.5 16.5 13.5C16.5 11.5 14.5 10.5 12 10.5C9.5 10.5 7.5 11.5 7.5 13.5C7.5 15.5 9.5 16.5 12 16.5Z" 
      fill="white"
    />
  </svg>
);
