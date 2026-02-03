'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variants = {
  default: {
    icon: 'text-cyan-400 bg-cyan-500/10',
    border: 'border-zinc-800',
  },
  success: {
    icon: 'text-emerald-400 bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  warning: {
    icon: 'text-amber-400 bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  danger: {
    icon: 'text-red-400 bg-red-500/10',
    border: 'border-red-500/20',
  },
};

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) {
  const style = variants[variant];
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/50 p-5 transition-all hover:border-zinc-700',
      style.border,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-zinc-400">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-sm font-medium mt-1',
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(2)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg', style.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] pointer-events-none" />
    </div>
  );
}
