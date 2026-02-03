'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MarketData {
  price: number;
  volBand: string;
  vol: number;
  killswitchActive?: boolean;
}

export function LiveMarket() {
  const [data, setData] = useState<MarketData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.bubble.trade';
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'grid' || msg.type === 'price') {
            setData({
              price: msg.price || msg.currentPrice,
              volBand: msg.volBand,
              vol: msg.vol || msg.sigma,
              killswitchActive: msg.killswitchActive,
            });
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setError('Connection failed');
        setConnected(false);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);

  const volBandColors: Record<string, string> = {
    very_low: 'text-green-400',
    low: 'text-green-300',
    med_low: 'text-lime-400',
    med: 'text-yellow-400',
    med_high: 'text-orange-400',
    high: 'text-orange-500',
    vhigh: 'text-red-400',
    extreme: 'text-red-500',
    extreme_150: 'text-red-600',
    extreme_200: 'text-red-700',
    extreme_300: 'text-red-800',
    crisis: 'text-red-900',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Live Market</h3>
        <div className={cn(
          'flex items-center gap-2 text-sm',
          connected ? 'text-green-400' : 'text-red-400'
        )}>
          <div className={cn(
            'w-2 h-2 rounded-full',
            connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          )} />
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-zinc-500">BTC Price</p>
            <p className="text-2xl font-bold text-white font-mono">
              ${data.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Vol Band</p>
            <p className={cn(
              'text-2xl font-bold',
              volBandColors[data.volBand] || 'text-white'
            )}>
              {data.volBand}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Volatility</p>
            <p className="text-xl font-semibold text-white">
              {((data.vol || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Killswitch</p>
            <p className={cn(
              'text-xl font-semibold',
              data.killswitchActive ? 'text-red-500' : 'text-green-500'
            )}>
              {data.killswitchActive ? 'ACTIVE' : 'Off'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-zinc-500">
          {error || 'Connecting...'}
        </div>
      )}
    </div>
  );
}
