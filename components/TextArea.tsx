import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, required, className = '', ...props }) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        className="border border-gray-300 rounded-sm px-4 py-3 text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 resize-y min-h-[120px] placeholder-gray-400"
        required={required}
        {...props}
      />
    </div>
  );
};