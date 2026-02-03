'use client';

import { cn, shortenAddress, formatCurrency, timeAgo } from '@/lib/utils';

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
  const statusColors: Record<string, string> = {
    active: 'text-blue-400 bg-blue-500/20',
    won: 'text-green-400 bg-green-500/20',
    lost: 'text-red-400 bg-red-500/20',
    cancelled: 'text-zinc-400 bg-zinc-500/20',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Bets</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-zinc-500 text-sm border-b border-zinc-800">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Multiplier</th>
              <th className="pb-3 font-medium">Payout</th>
              <th className="pb-3 font-medium">Vol Band</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="py-3 text-sm text-zinc-300 font-mono">
                  {shortenAddress(bet.betting_users?.wallet_address || '')}
                </td>
                <td className="py-3 text-sm text-white">
                  {formatCurrency(bet.bet_amount)}
                </td>
                <td className="py-3 text-sm text-cyan-400">
                  {bet.multiplier_locked.toFixed(2)}x
                </td>
                <td className="py-3 text-sm text-white">
                  {formatCurrency(bet.potential_payout)}
                </td>
                <td className="py-3 text-sm text-zinc-400">
                  {bet.vol_band}
                </td>
                <td className="py-3">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    statusColors[bet.status]
                  )}>
                    {bet.status}
                  </span>
                </td>
                <td className="py-3 text-sm text-zinc-500">
                  {timeAgo(bet.placed_at)}
                </td>
              </tr>
            ))}
            {bets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  No bets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
