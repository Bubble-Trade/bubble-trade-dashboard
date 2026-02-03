import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Get aggregated observations by vol band
    const { data: cells, error: cellsError } = await supabase
      .from('correction_cells')
      .select('vol_band, observations, hits');
    
    if (cellsError) throw cellsError;
    
    // Aggregate by vol band
    const volBandStats: Record<string, { observations: number; hits: number }> = {};
    let totalObservations = 0;
    let totalHits = 0;
    
    for (const cell of cells || []) {
      if (!volBandStats[cell.vol_band]) {
        volBandStats[cell.vol_band] = { observations: 0, hits: 0 };
      }
      volBandStats[cell.vol_band].observations += cell.observations || 0;
      volBandStats[cell.vol_band].hits += cell.hits || 0;
      totalObservations += cell.observations || 0;
      totalHits += cell.hits || 0;
    }
    
    // Convert to array format for charts
    const volBands = Object.entries(volBandStats)
      .map(([band, stats]) => ({
        band,
        observations: stats.observations,
        hits: stats.hits,
        hitRate: stats.observations > 0 ? stats.hits / stats.observations : 0,
      }))
      .sort((a, b) => b.observations - a.observations);
    
    // Get recent snapshots for trend
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('correction_snapshots')
      .select('total_observations, snapshot_at')
      .order('snapshot_at', { ascending: false })
      .limit(100);
    
    if (snapshotsError) throw snapshotsError;
    
    return NextResponse.json({
      totals: {
        observations: totalObservations,
        hits: totalHits,
        overallHitRate: totalObservations > 0 ? totalHits / totalObservations : 0,
        activeCells: cells?.length || 0,
      },
      volBands,
      snapshots: (snapshots || []).reverse(), // Oldest first for charts
    });
  } catch (error) {
    console.error('Calibration API error:', error);
    return NextResponse.json({ error: 'Failed to fetch calibration data' }, { status: 500 });
  }
}
