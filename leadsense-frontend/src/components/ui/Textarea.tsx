import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 12.5, fontWeight: 700, color: '#0a0a0f', letterSpacing: '.02em', textTransform: 'uppercase' }}>
            {label}
            {props.required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          {...props}
          className={`input-3d resize-none ${error ? 'error' : ''} ${className}`}
        />
        {error && <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
