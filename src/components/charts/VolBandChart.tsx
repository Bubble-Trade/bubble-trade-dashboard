'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VolBandData {
  band: string;
  observations: number;
  hits: number;
  hitRate: number;
}

interface VolBandChartProps {
  data: VolBandData[];
}

const COLORS: Record<string, string> = {
  very_low: '#10b981',
  low: '#22c55e',
  med_low: '#84cc16',
  med: '#eab308',
  med_high: '#f59e0b',
  high: '#f97316',
  vhigh: '#ef4444',
  extreme: '#dc2626',
  extreme_150: '#b91c1c',
  extreme_200: '#991b1b',
  extreme_300: '#7f1d1d',
  crisis: '#450a0a',
};

export function VolBandChart({ data }: VolBandChartProps) {
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatBandName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!data || data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span> Observations by Vol Band
        </h3>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          No calibration data available
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span> Observations by Vol Band
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis 
              type="number" 
              tickFormatter={formatNumber} 
              stroke="#52525b" 
              fontSize={11}
              axisLine={{ stroke: '#27272a' }}
              tickLine={{ stroke: '#27272a' }}
            />
            <YAxis 
              dataKey="band" 
              type="category" 
              stroke="#52525b" 
              fontSize={10} 
              width={75}
              tickFormatter={formatBandName}
              axisLine={{ stroke: '#27272a' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
              formatter={(value) => [formatNumber(value as number), 'Observations']}
              labelFormatter={(label) => formatBandName(label as string)}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              itemStyle={{ color: '#a1a1aa' }}
            />
            <Bar dataKey="observations" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.band] || '#6366f1'} 
                  opacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {data.slice(0, 6).map((item) => (
          <div key={item.band} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: COLORS[item.band] || '#6366f1' }}
            />
            <span>{formatBandName(item.band)}</span>
          </div>
        ))}
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
    </div>
  );
}
