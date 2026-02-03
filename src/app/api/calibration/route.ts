import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Get aggregated observations by vol band
    // Column names: vol_band, abs_distance, t_start_sec, observations, hits, touch_rate, mean_gbm_probability, correction_ratio
    const { data: cells, error: cellsError } = await supabase
      .from('correction_cells')
      .select('vol_band, observations, hits');
    
    if (cellsError) {
      console.error('Cells error:', cellsError);
      throw cellsError;
    }
    
    // Aggregate by vol band
    const volBandStats: Record<string, { observations: number; hits: number }> = {};
    let totalObservations = 0;
    let totalHits = 0;
    
    for (const cell of cells || []) {
      const band = cell.vol_band;
      if (!volBandStats[band]) {
        volBandStats[band] = { observations: 0, hits: 0 };
      }
      volBandStats[band].observations += cell.observations || 0;
      volBandStats[band].hits += cell.hits || 0;
      totalObservations += cell.observations || 0;
      totalHits += cell.hits || 0;
    }
    
    // Convert to array format for charts, sorted by vol band order
    const bandOrder = [
      'very_low', 'low', 'med_low', 'med', 'med_high', 
      'high', 'vhigh', 'extreme', 'extreme_150', 'extreme_200', 
      'extreme_300', 'crisis'
    ];
    
    const volBands = Object.entries(volBandStats)
      .map(([band, stats]) => ({
        band,
        observations: stats.observations,
        hits: stats.hits,
        hitRate: stats.observations > 0 ? stats.hits / stats.observations : 0,
      }))
      .sort((a, b) => {
        const aIdx = bandOrder.indexOf(a.band);
        const bIdx = bandOrder.indexOf(b.band);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
    
    // Get recent snapshots for trend
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('correction_snapshots')
      .select('total_observations, snapshot_at')
      .order('snapshot_at', { ascending: false })
      .limit(100);
    
    if (snapshotsError) {
      console.error('Snapshots error:', snapshotsError);
    }
    
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
    return NextResponse.json({ 
      error: 'Failed to fetch calibration data',
      totals: { observations: 0, hits: 0, overallHitRate: 0, activeCells: 0 },
      volBands: [],
      snapshots: [],
    }, { status: 500 });
  }
}
