import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;
    
    let query = supabase
      .from('betting_users')
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.ilike('wallet_address', `%${search}%`);
    }
    
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return NextResponse.json({
      users: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
