
import React from 'react';

export const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.868 2.884c.321.64.321 1.393 0 2.034l-1.37 2.739a.75.75 0 01-1.332 0l-1.37-2.74a1.75 1.75 0 010-2.033l1.37-2.74a.75.75 0 011.332 0l1.37 2.74zM9 12.5a.75.75 0 00-1.06-1.06l-1.37-1.37a1.75 1.75 0 00-2.475 2.475l1.37 1.37A.75.75 0 009 12.5zm7.44-1.06a.75.75 0 10-1.06-1.06l-1.37-1.37a1.75 1.75 0 10-2.475 2.475l1.37 1.37a.75.75 0 001.06-1.06z" clipRule="evenodd" />
  </svg>
);

export const UploadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const Spinner = ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
