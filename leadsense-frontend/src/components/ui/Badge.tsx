import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const styles: Record<Variant, { bg: string; color: string; border: string }> = {
  default:  { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  success:  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  warning:  { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  danger:   { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  info:     { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' },
  neutral:  { bg: '#f5f0e8', color: '#44403c', border: '#d4c9b8' },
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className={`badge ${className}`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {children}
    </span>
  );
}
