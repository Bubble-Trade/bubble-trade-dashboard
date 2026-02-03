'use client';

import { cn, shortenAddress, formatCurrency, timeAgo } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';

interface Bet {
  id: string;
  bet_amount: number;
  potential_payout: number;
  multiplier_locked: number;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  vol_band: string;
  placed_at: string;
  betting_users?: { wallet_address: string };
}

interface RecentBetsProps {
  bets: Bet[];
}

export function RecentBets({ bets }: RecentBetsProps) {
  const statusConfig: Record<string, { color: string; bg: string; icon: typeof TrendingUp }> = {
    active: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Clock },
    won: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: TrendingUp },
    lost: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: TrendingDown },
    cancelled: { color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20', icon: Loader2 },
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🎰</span> Recent Bets
        </h3>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50">
              <th className="px-6 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Multiplier</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Vol Band</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {bets.map((bet) => {
              const status = statusConfig[bet.status] || statusConfig.cancelled;
              const StatusIcon = status.icon;
              
              return (
                <tr key={bet.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-300 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                      {shortenAddress(bet.betting_users?.wallet_address || '')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-white">
                    {formatCurrency(bet.bet_amount)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-cyan-400">
                      {bet.multiplier_locked.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-300">
                    {formatCurrency(bet.potential_payout)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
                      {bet.vol_band?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                      status.bg, status.color
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {bet.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-500">
                    {timeAgo(bet.placed_at)}
                  </td>
                </tr>
              );
            })}
            {bets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🎲</span>
                    <p>No bets found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />
    </div>
  );
}
