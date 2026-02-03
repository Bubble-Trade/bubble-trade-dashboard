'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, Activity, Target, Layers } from 'lucide-react';
import { StatsCard } from '@/components/cards/StatsCard';
import { ServiceStatus } from '@/components/cards/ServiceStatus';
import { VolBandChart } from '@/components/charts/VolBandChart';
import { RecentBets } from '@/components/tables/RecentBets';
import { LiveMarket } from '@/components/live/LiveMarket';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

interface Stats {
  users: { total: number };
  bets: { total: number; active: number; won: number; lost: number };
  financials: { totalWagered: number; totalPayouts: number; platformPnL: number; realizedEdge: number };
  calibration: { totalObservations: number; lastSnapshot: string | null };
}

interface Health {
  status: string;
  services: Record<string, { name: string; healthy: boolean; lastCheck: number }>;
}

interface Calibration {
  totals: { observations: number; hits: number; overallHitRate: number; activeCells: number };
  volBands: Array<{ band: string; observations: number; hits: number; hitRate: number }>;
}

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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, healthRes, calibrationRes, betsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/health'),
        fetch('/api/calibration'),
        fetch('/api/bets?limit=20'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
      if (calibrationRes.ok) setCalibration(await calibrationRes.json());
      if (betsRes.ok) {
        const data = await betsRes.json();
        setBets(data.bets || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🫧 Bubble Trade Dashboard</h1>
          <p className="text-zinc-500 mt-1">Admin view into platform operations</p>
        </div>
        <div className="text-right text-sm text-zinc-500">
          {lastUpdate && (
            <p>Last updated: {lastUpdate.toLocaleTimeString()}</p>
          )}
          <button
            onClick={fetchData}
            className="mt-1 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Live Market + Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LiveMarket />
        {health && (
          <ServiceStatus services={health.services} overallStatus={health.status} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          value={stats?.users.total || 0}
          icon={Users}
        />
        <StatsCard
          title="Total Bets"
          value={formatNumber(stats?.bets.total || 0, 0)}
          subtitle={`${stats?.bets.active || 0} active`}
          icon={Activity}
        />
        <StatsCard
          title="Total Wagered"
          value={formatCurrency(stats?.financials.totalWagered || 0)}
          icon={DollarSign}
        />
        <StatsCard
          title="Platform P&L"
          value={formatCurrency(stats?.financials.platformPnL || 0)}
          subtitle={`Edge: ${formatPercent(stats?.financials.realizedEdge || 0)}`}
          icon={TrendingUp}
          trend={stats?.financials.platformPnL !== undefined ? {
            value: (stats.financials.realizedEdge || 0) * 100,
            isPositive: (stats.financials.platformPnL || 0) >= 0,
          } : undefined}
        />
      </div>

      {/* Calibration Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Observations"
          value={formatNumber(calibration?.totals.observations || 0, 0)}
          icon={Target}
        />
        <StatsCard
          title="Active Cells"
          value={`${calibration?.totals.activeCells || 0} / 1320`}
          icon={Layers}
        />
        <StatsCard
          title="Overall Hit Rate"
          value={formatPercent(calibration?.totals.overallHitRate || 0)}
        />
        <StatsCard
          title="Win Rate"
          value={stats?.bets.total ? formatPercent(stats.bets.won / stats.bets.total) : '0%'}
          subtitle={`${stats?.bets.won || 0} wins / ${stats?.bets.lost || 0} losses`}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {calibration && (
          <VolBandChart data={calibration.volBands} />
        )}
        <RecentBets bets={bets} />
      </div>

      {/* Footer */}
      <div className="text-center text-zinc-600 text-sm mt-8">
        Bubble Trade Admin Dashboard • Data refreshes every 30 seconds
      </div>
    </div>
  );
}
