'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface MarketData {
  price: number;
  volBand: string;
  vol: number;
  killswitchActive: boolean;
}

export function LiveMarket() {
  const [data, setData] = useState<MarketData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track latest values without causing re-renders
  const dataRef = useRef<MarketData>({
    price: 0,
    volBand: '',
    vol: 0,
    killswitchActive: false,
  });

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.bubble.trade';
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let updateTimeout: NodeJS.Timeout;
    
    // Throttle UI updates to max 2 per second
    let pendingUpdate = false;
    const scheduleUpdate = () => {
      if (pendingUpdate) return;
      pendingUpdate = true;
      updateTimeout = setTimeout(() => {
        pendingUpdate = false;
        setData({ ...dataRef.current });
      }, 500);
    };

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            
            if (msg.type === 'grid') {
              // Grid messages have ALL the data - update everything
              dataRef.current = {
                price: msg.price || 0,
                volBand: msg.volBand || 'unknown',
                vol: msg.annualizedVol || 0,
                killswitchActive: msg.killswitchActive || false,
              };
              scheduleUpdate();
            } else if (msg.type === 'price') {
              // Price-only messages - only update price, keep vol data
              dataRef.current.price = msg.price || dataRef.current.price;
              scheduleUpdate();
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
      } catch (e) {
        setError('Failed to connect');
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      clearTimeout(updateTimeout);
      ws?.close();
    };
  }, []);

  const volBandConfig: Record<string, { color: string; bg: string }> = {
    very_low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    low: { color: 'text-green-400', bg: 'bg-green-500/10' },
    med_low: { color: 'text-lime-400', bg: 'bg-lime-500/10' },
    med: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    med_high: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
    vhigh: { color: 'text-red-400', bg: 'bg-red-500/10' },
    extreme: { color: 'text-red-500', bg: 'bg-red-500/10' },
    extreme_150: { color: 'text-red-600', bg: 'bg-red-600/10' },
    extreme_200: { color: 'text-rose-600', bg: 'bg-rose-600/10' },
    extreme_300: { color: 'text-rose-700', bg: 'bg-rose-700/10' },
    crisis: { color: 'text-rose-900', bg: 'bg-rose-900/20' },
  };

  const bandStyle = data?.volBand ? (volBandConfig[data.volBand] || { color: 'text-zinc-400', bg: 'bg-zinc-500/10' }) : { color: 'text-zinc-400', bg: 'bg-zinc-500/10' };

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">📡</span> Live Market
        </h3>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          connected 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        )}>
          {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {data && data.price > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">BTC Price</p>
              <p className="text-3xl font-bold text-white font-mono tracking-tight">
                ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Vol Band */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Vol Band</p>
              <div className={cn('inline-flex items-center px-3 py-1 rounded-lg', bandStyle.bg)}>
                <p className={cn('text-2xl font-bold uppercase', bandStyle.color)}>
                  {data.volBand?.replace(/_/g, ' ') || '—'}
                </p>
              </div>
            </div>

            {/* Volatility */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Annualized Vol</p>
              <p className="text-2xl font-semibold text-white">
                {(data.vol * 100).toFixed(1)}%
              </p>
            </div>

            {/* Killswitch */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Killswitch</p>
              {data.killswitchActive ? (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="text-xl font-bold">ACTIVE</span>
                </div>
              ) : (
                <p className="text-2xl font-semibold text-emerald-400">Off</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-cyan-500 rounded-full animate-spin mb-3" />
            <p>{error || 'Connecting to WebSocket...'}</p>
          </div>
        )}
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
    </div>
  );
}
