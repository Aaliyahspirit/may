import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, required, className = '', ...props }) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={`border border-gray-300 rounded-sm px-4 py-3 text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 placeholder-gray-400 ${error ? 'border-red-500' : ''}`}
        required={required}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};