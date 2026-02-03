'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Bucket {
  priceMin: number;
  priceMax: number;
  tStartSec: number;
  durationSec: number;
  multiplier: number;
  distance: number;
}

interface GridData {
  price: number;
  volBand: string;
  annualizedVol: number;
  killswitchActive: boolean;
  buckets: Bucket[];
}

export function GridView() {
  const [data, setData] = useState<GridData | null>(null);
  const [connected, setConnected] = useState(false);
  const dataRef = useRef<GridData | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.bubble.trade';
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let updateTimeout: NodeJS.Timeout;
    
    let pendingUpdate = false;
    const scheduleUpdate = () => {
      if (pendingUpdate) return;
      pendingUpdate = true;
      updateTimeout = setTimeout(() => {
        pendingUpdate = false;
        if (dataRef.current) {
          setData({ ...dataRef.current });
        }
      }, 500);
    };

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => setConnected(true);

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'grid' && msg.buckets) {
              dataRef.current = {
                price: msg.price || 0,
                volBand: msg.volBand || '',
                annualizedVol: msg.annualizedVol || 0,
                killswitchActive: msg.killswitchActive || false,
                buckets: msg.buckets || [],
              };
              scheduleUpdate();
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => setConnected(false);
      } catch (e) {}
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      clearTimeout(updateTimeout);
      ws?.close();
    };
  }, []);

  // Get multiplier color based on value
  const getMultiplierColor = (mult: number) => {
    if (mult >= 50) return 'bg-purple-500';
    if (mult >= 20) return 'bg-red-500';
    if (mult >= 10) return 'bg-orange-500';
    if (mult >= 5) return 'bg-yellow-500';
    if (mult >= 3) return 'bg-lime-500';
    if (mult >= 2) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const getMultiplierOpacity = (mult: number) => {
    const normalized = Math.min(mult / 100, 1);
    return 0.3 + (normalized * 0.7);
  };

  // Organize buckets into a grid: rows = distance, cols = tStartSec
  const organizeGrid = (buckets: Bucket[]) => {
    const grid: Record<number, Record<number, Bucket>> = {};
    const distances = new Set<number>();
    const times = new Set<number>();

    for (const bucket of buckets) {
      distances.add(bucket.distance);
      times.add(bucket.tStartSec);
      if (!grid[bucket.distance]) grid[bucket.distance] = {};
      grid[bucket.distance][bucket.tStartSec] = bucket;
    }

    return {
      grid,
      distances: Array.from(distances).sort((a, b) => a - b),
      times: Array.from(times).sort((a, b) => a - b),
    };
  };

  if (!data || !data.buckets.length) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">🎯</span> Live Multiplier Grid
        </h3>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p>Waiting for grid data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { grid, distances, times } = organizeGrid(data.buckets);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="text-2xl">🎯</span> Live Multiplier Grid
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Price:</span>
              <span className="font-mono font-bold text-white">
                ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={cn(
              'px-3 py-1 rounded-full font-medium',
              data.killswitchActive 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            )}>
              {data.killswitchActive ? '⚠️ Killswitch Active' : '✓ Trading Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Time labels */}
          <div className="flex mb-2 ml-16">
            {times.map(t => (
              <div key={t} className="flex-1 text-center text-xs text-zinc-500 font-medium">
                {t}s
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="space-y-1">
            {distances.map(distance => (
              <div key={distance} className="flex items-center gap-2">
                {/* Distance label */}
                <div className="w-14 text-right text-xs text-zinc-500 font-medium pr-2">
                  {distance > 0 ? `+${distance}` : distance === 0 ? 'ATM' : distance}
                </div>

                {/* Cells */}
                <div className="flex flex-1 gap-1">
                  {times.map(t => {
                    const bucket = grid[distance]?.[t];
                    if (!bucket) return <div key={t} className="flex-1 h-10 bg-zinc-800/30 rounded" />;

                    return (
                      <div
                        key={t}
                        className={cn(
                          'flex-1 h-10 rounded flex items-center justify-center text-xs font-bold transition-all hover:scale-105 cursor-default',
                          getMultiplierColor(bucket.multiplier)
                        )}
                        style={{ opacity: getMultiplierOpacity(bucket.multiplier) }}
                        title={`Distance: ${bucket.distance}, Time: ${bucket.tStartSec}s, Multiplier: ${bucket.multiplier.toFixed(2)}x`}
                      >
                        <span className="text-white drop-shadow-lg">
                          {bucket.multiplier.toFixed(1)}x
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span>1-2x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>2-3x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-lime-500" />
              <span>3-5x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span>5-10x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span>10-20x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>20-50x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span>50x+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
