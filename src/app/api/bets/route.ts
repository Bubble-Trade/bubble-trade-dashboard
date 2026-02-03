import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const volBand = searchParams.get('volBand');
    
    let query = supabase
      .from('bets')
      .select('*, betting_users!inner(wallet_address)', { count: 'exact' });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (volBand) {
      query = query.eq('vol_band', volBand);
    }
    
    const { data, error, count } = await query
      .order('placed_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return NextResponse.json({
      bets: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Bets API error:', error);
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 });
  }
}
