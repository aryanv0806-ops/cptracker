import React from 'react';

export default function SkeuoButton({ 
  children, 
  onClick, 
  className = '', 
  type = 'button', 
  disabled = false,
  variant = 'default' // 'default', 'accent', 'danger'
}) {
  const baseStyle = "px-6 py-2.5 rounded-xl font-medium transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";
  
  let variantStyle = "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white skeuo-raised skeuo-button-active";
  if (variant === 'accent') {
    variantStyle = "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 skeuo-raised skeuo-button-active border border-blue-500/10";
  } else if (variant === 'danger') {
    variantStyle = "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 skeuo-raised skeuo-button-active border border-red-500/10";
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      {children}
    </button>
  );
}
