import { createClient } from '@supabase/supabase-js';

// Server-side client (with service key for admin queries)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Types matching the backend schema
export interface BettingUser {
  id: string;
  wallet_address: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  price_low: number;
  price_high: number;
  t_start_sec: number;
  t_end_sec: number;
  multiplier_locked: number;
  bet_amount: number;
  potential_payout: number;
  vol_band: string;
  placed_at: string;
  expires_at: string;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  resolved_at: string | null;
  settlement_price: number | null;
}

export interface CorrectionCell {
  id: string;
  vol_band: string;
  abs_distance: number;
  t_start_sec: number;
  observations: number;
  hits: number;
  touch_rate: number;
  mean_gbm_probability: number;
  correction_ratio: number;
  updated_at: string;
}

export interface CorrectionSnapshot {
  id: string;
  total_observations: number;
  snapshot_at: string;
}
