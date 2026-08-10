import React from 'react';

export interface PriorityBadgeProps {
  prioridad: 'alta' | 'media' | 'baja';
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ prioridad, size = 'md' }) => {
  const styles = {
    alta: 'bg-red-100 text-red-800 border-red-300 font-extrabold',
    media: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
    baja: 'bg-gray-100 text-gray-700 border-gray-300 font-bold',
  };

  const labels = {
    alta: 'ALTA PRIORIDAD',
    media: 'MEDIA PRIORIDAD',
    baja: 'BAJA PRIORIDAD',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border shadow-2xs tracking-wide uppercase ${styles[prioridad]} ${sizes[size]}`}
    >
      <span
        className={`rounded-full ${
          prioridad === 'alta'
            ? 'w-2 h-2 bg-red-600 animate-pulse'
            : prioridad === 'media'
            ? 'w-2 h-2 bg-amber-500'
            : 'w-2 h-2 bg-gray-400'
        }`}
      ></span>
      <span>{labels[prioridad]}</span>
    </span>
  );
};
