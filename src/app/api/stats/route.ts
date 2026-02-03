import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Fetch all stats in parallel
    const [
      usersResult,
      betsResult,
      wonBetsResult,
      lostBetsResult,
      activeBetsResult,
      calibrationResult,
    ] = await Promise.all([
      // Total users
      supabase.from('betting_users').select('*', { count: 'exact', head: true }),
      
      // All bets with totals
      supabase.from('bets').select('bet_amount, potential_payout, status'),
      
      // Won bets
      supabase.from('bets').select('bet_amount, potential_payout').eq('status', 'won'),
      
      // Lost bets
      supabase.from('bets').select('bet_amount').eq('status', 'lost'),
      
      // Active bets
      supabase.from('bets').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Latest calibration snapshot
      supabase.from('correction_snapshots')
        .select('total_observations, snapshot_at')
        .order('snapshot_at', { ascending: false })
        .limit(1),
    ]);
    
    // Calculate financials
    const allBets = betsResult.data || [];
    const wonBets = wonBetsResult.data || [];
    const lostBets = lostBetsResult.data || [];
    
    const totalWagered = allBets.reduce((sum, b) => sum + (b.bet_amount || 0), 0);
    const totalPayouts = wonBets.reduce((sum, b) => sum + (b.potential_payout || 0), 0);
    const totalLost = lostBets.reduce((sum, b) => sum + (b.bet_amount || 0), 0);
    const platformPnL = totalLost - totalPayouts + wonBets.reduce((sum, b) => sum + (b.bet_amount || 0), 0);
    const realizedEdge = totalWagered > 0 ? platformPnL / totalWagered : 0;
    
    // Bet counts by status
    const statusCounts = allBets.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      users: {
        total: usersResult.count || 0,
      },
      bets: {
        total: allBets.length,
        active: activeBetsResult.count || 0,
        won: statusCounts['won'] || 0,
        lost: statusCounts['lost'] || 0,
        cancelled: statusCounts['cancelled'] || 0,
      },
      financials: {
        totalWagered,
        totalPayouts,
        platformPnL,
        realizedEdge,
      },
      calibration: {
        totalObservations: calibrationResult.data?.[0]?.total_observations || 0,
        lastSnapshot: calibrationResult.data?.[0]?.snapshot_at || null,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
