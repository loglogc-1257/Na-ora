import React from 'react';

export const BrushIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.06 11.9 16 5.02c.81-.81.81-2.12 0-2.93-.81-.81-2.12-.81-2.93 0L6.1 9.06" />
    <path d="M14 7.5c.36.36.36.95 0 1.31-.36.36-.95.36-1.31 0" />
    <path d="m7.11 10.05.7.7c.36.36.36.95 0 1.31L3.9 15.98c-.81.81-2.12.81-2.93 0-.81-.81-.81-2.12 0-2.93l3.81-3.81c.36-.36.95-.36 1.31 0Z" />
    <path d="M22 12c-2 2-2 5-2 5s3-1 5-3" />
    <path d="M12.88 15.12 11.5 14.5l-2.06 2.06 4.5 4.5 2.06-2.06-.62-1.38" />
  </svg>
);