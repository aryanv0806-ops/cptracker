import React from 'react';

export default function SkeuoCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl skeuo-raised p-5 border border-white/5 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
