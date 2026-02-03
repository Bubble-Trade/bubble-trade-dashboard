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
  very_low: '#22c55e',
  low: '#4ade80',
  med_low: '#86efac',
  med: '#fbbf24',
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Observations by Vol Band</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tickFormatter={formatNumber} stroke="#71717a" fontSize={12} />
            <YAxis dataKey="band" type="category" stroke="#71717a" fontSize={11} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatNumber(value), 'Observations']}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="observations" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.band] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
