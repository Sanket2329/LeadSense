import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className = '', ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} style={{ fontSize: 12.5, fontWeight: 700, color: '#0a0a0f', letterSpacing: '.02em', textTransform: 'uppercase' }}>
            {label}
            {props.required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          {...props}
          className={`input-3d ${error ? 'error' : ''} ${className}`}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
