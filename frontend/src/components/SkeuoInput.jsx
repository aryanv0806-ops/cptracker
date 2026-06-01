import React from 'react';

export default function SkeuoInput({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  name, 
  required = false 
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 ml-1">{label}</label>}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl skeuo-sunken border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
      />
    </div>
  );
}
