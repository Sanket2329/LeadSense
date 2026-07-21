import React from 'react';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e3a8a)',
          boxShadow: '0 4px 0 #0a0a0f, 0 12px 32px rgba(15,23,42,.4)',
          color: '#93c5fd',
        }}
      >
        {icon || <InboxIcon size={32} />}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0a0a0f', marginBottom: 6 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 13.5, color: '#78716c', maxWidth: 280, lineHeight: 1.6, marginBottom: 16 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
