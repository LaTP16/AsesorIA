import React from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  prioridad: 'alta' | 'media' | 'baja';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  prioridad,
  showIcon = true,
  size = 'md'
}) => {
  const normalized = prioridad.toLowerCase();

  let colorClasses = '';
  let label = '';
  let IconComponent = AlertTriangle;

  if (normalized === 'alta') {
    label = 'Alta Prioridad';
    colorClasses = 'bg-red-600 text-white border-red-700 font-bold shadow-sm';
    IconComponent = AlertTriangle;
  } else if (normalized === 'media') {
    label = 'Prioridad Media';
    colorClasses = 'bg-amber-500 text-white border-amber-600 font-semibold';
    IconComponent = Clock;
  } else {
    label = 'Prioridad Baja';
    colorClasses = 'bg-gray-500 text-white border-gray-600 font-medium';
    IconComponent = CheckCircle2;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase tracking-wider ${sizeClasses} ${colorClasses}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {label}
    </span>
  );
};
