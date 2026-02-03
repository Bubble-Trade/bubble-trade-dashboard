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
  className?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-zinc-900 border border-zinc-800 rounded-lg p-6',
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-zinc-500" />}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={cn(
            'text-sm mt-1',
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(2)}%
          </p>
        )}
      </div>
    </div>
  );
}
