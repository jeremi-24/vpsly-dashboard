import React from 'react';

export const IconRedis = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#D82C20" />
    <path 
      d="M7 7H17V17H7V7Z" 
      fill="white" 
      fillOpacity="0.2"
    />
    <path 
      d="M10 10H14V14H10V10Z" 
      fill="white"
    />
  </svg>
);
