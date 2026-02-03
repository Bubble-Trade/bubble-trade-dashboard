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
  BarChart3,
  Zap
} from 'lucide-react';
import { StatsCard } from '@/components/cards/StatsCard';
import { ServiceStatus } from '@/components/cards/ServiceStatus';
import { VolBandChart } from '@/components/charts/VolBandChart';
import { RecentBets } from '@/components/tables/RecentBets';
import { LiveMarket } from '@/components/live/LiveMarket';
import { GridView } from '@/components/live/GridView';
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
        fetch('/api/bets?limit=10'),
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
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse opacity-20 absolute inset-0 blur-xl" />
          <div className="w-20 h-20 border-4 border-zinc-800 border-t-cyan-500 rounded-full animate-spin relative" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bubble Trade</h2>
        <p className="text-zinc-500">Loading dashboard...</p>
      </div>
    );
  }

  const pnlVariant = (stats?.financials.platformPnL || 0) >= 0 ? 'success' : 'danger';

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Gradient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-zinc-900/50 to-transparent rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                  🫧
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Bubble Trade</h1>
                  <p className="text-sm text-zinc-500">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {lastUpdate && (
                  <p className="text-sm text-zinc-500 hidden sm:block">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
          {/* Top Row - Live Data */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Live Data</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveMarket />
              {health && (
                <ServiceStatus services={health.services} overallStatus={health.status} />
              )}
            </div>
          </section>

          {/* Grid View - Full Width */}
          <section className="mb-8">
            <GridView />
          </section>

          {/* Stats Grid */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Platform Metrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              />
            </div>
          </section>

          {/* Calibration Stats */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Calibration Engine</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Observations"
                value={formatNumber(calibration?.totals.observations || 0, 0)}
                icon={Target}
              />
              <StatsCard
                title="Active Cells"
                value={`${formatNumber(calibration?.totals.activeCells || 0, 0)} / 1,320`}
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
          </section>

          {/* Charts & Tables */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <VolBandChart data={calibration?.volBands || []} />
            <RecentBets bets={bets} />
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 bg-zinc-900/30 py-6">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
              <p>© 2026 Bubble Trade. Admin Dashboard.</p>
              <p>Data refreshes automatically every 30 seconds</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
