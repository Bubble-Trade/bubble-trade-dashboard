import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const monitorUrl = process.env.NEXT_PUBLIC_MONITOR_URL || 'https://monitor.bubble.trade';
    
    const response = await fetch(`${monitorUrl}/system/health`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Monitor returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health API error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch health status',
      services: {},
    }, { status: 500 });
  }
}
