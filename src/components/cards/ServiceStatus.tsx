'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Service {
  name: string;
  healthy: boolean;
  lastCheck: number;
}

interface ServiceStatusProps {
  services: Record<string, Service>;
  overallStatus: string;
}

export function ServiceStatus({ services, overallStatus }: ServiceStatusProps) {
  const isHealthy = overallStatus === 'ok';
  const serviceList = Object.entries(services);
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🖥️</span> System Health
        </h3>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
          isHealthy 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        )}>
          {isHealthy ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {isHealthy ? 'All Systems Operational' : 'Issues Detected'}
        </div>
      </div>
      
      {/* Services List */}
      <div className="p-4">
        <div className="space-y-2">
          {serviceList.map(([key, service]) => (
            <div 
              key={key} 
              className={cn(
                'flex items-center justify-between p-4 rounded-lg transition-colors',
                service.healthy 
                  ? 'bg-zinc-800/30 hover:bg-zinc-800/50' 
                  : 'bg-red-500/5 border border-red-500/20'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  service.healthy 
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' 
                    : 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                )} />
                <div>
                  <span className="text-sm font-medium text-white">{service.name}</span>
                  <p className="text-xs text-zinc-500">{key}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                {service.lastCheck ? new Date(service.lastCheck).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
    </div>
  );
}
