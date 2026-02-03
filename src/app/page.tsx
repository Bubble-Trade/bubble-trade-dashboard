'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Target, 
  Layers,
  RefreshCw,
  Sparkles
} from 'lucide-react';
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const [statsRes, healthRes, calibrationRes, betsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/health'),
        fetch('/api/calibration'),
        fetch('/api/bets?limit=15'),
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-cyan-500 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-500" />
        </div>
        <p className="mt-4 text-zinc-500">Loading dashboard...</p>
      </div>
    );
  }

  const pnlVariant = (stats?.financials.platformPnL || 0) >= 0 ? 'success' : 'danger';

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🫧</span>
              Bubble Trade
              <span className="text-sm font-normal text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full">
                Admin
              </span>
            </h1>
            <p className="text-zinc-500 mt-1">Real-time platform monitoring & analytics</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <p className="text-sm text-zinc-500">
                Updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
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

        {/* Financial Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Users"
            value={formatNumber(stats?.users.total || 0, 0)}
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
            variant={pnlVariant}
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
            value={`${formatNumber(calibration?.totals.activeCells || 0, 0)} / 1320`}
            icon={Layers}
          />
          <StatsCard
            title="Overall Hit Rate"
            value={formatPercent(calibration?.totals.overallHitRate || 0)}
          />
          <StatsCard
            title="Win Rate"
            value={stats?.bets.total ? formatPercent(stats.bets.won / stats.bets.total) : '0.00%'}
            subtitle={`${stats?.bets.won || 0}W / ${stats?.bets.lost || 0}L`}
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <VolBandChart data={calibration?.volBands || []} />
          <RecentBets bets={bets} />
        </div>

        {/* Footer */}
        <div className="text-center text-zinc-600 text-sm mt-12 pb-8">
          <p>Bubble Trade Admin Dashboard</p>
          <p className="text-zinc-700 mt-1">Data refreshes automatically every 30 seconds</p>
        </div>
      </div>
    </div>
  );
}
