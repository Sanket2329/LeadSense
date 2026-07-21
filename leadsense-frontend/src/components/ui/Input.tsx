import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 12.5, fontWeight: 700, color: '#0a0a0f', letterSpacing: '.02em', textTransform: 'uppercase' }}>
            {label}
            {props.required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={`input-3d ${error ? 'error' : ''} ${className}`}
        />
        {error && <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>}
        {helpText && !error && <p style={{ fontSize: 12, color: '#78716c' }}>{helpText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
