'use client';

import { cn } from '@/lib/utils';

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
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">System Health</h3>
        <div className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          isHealthy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        )}>
          {isHealthy ? '● All Systems Go' : '● Issues Detected'}
        </div>
      </div>
      
      <div className="space-y-3">
        {Object.entries(services).map(([key, service]) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-2 h-2 rounded-full',
                service.healthy ? 'bg-green-500' : 'bg-red-500'
              )} />
              <span className="text-sm text-white">{service.name}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {service.lastCheck ? new Date(service.lastCheck).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
