import React from 'react';
import { SelectOption } from '../types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, required, className = '', ...props }) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          className={`appearance-none w-full bg-white border border-gray-300 rounded-sm px-4 py-3 pr-8 text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 ${error ? 'border-red-500' : ''}`}
          required={required}
          {...props}
        >
          <option value="" disabled>Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};