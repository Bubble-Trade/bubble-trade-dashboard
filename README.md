# 🫧 Bubble Trade Dashboard

Admin dashboard for monitoring Bubble Trade platform operations.

## Features

- **Live Market Data** - Real-time BTC price, volatility band, killswitch status via WebSocket
- **System Health** - Service status for WS server, API, and calibration engine
- **Financial Metrics** - Total wagered, payouts, platform P&L, realized house edge
- **User Analytics** - Total users, balances, activity
- **Bet Activity** - Recent bets, win/loss rates, status breakdown
- **Calibration Insights** - Observations by vol band, hit rates (no secret sauce exposed)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data:** Supabase (read-only), WebSocket

## Setup

1. Clone the repo:
   ```bash
   git clone git@github.com:deficlawd/bubble-trade-dashboard.git
   cd bubble-trade-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_KEY` - Supabase service role key (server-side only)
   - `NEXT_PUBLIC_WS_URL` - WebSocket server URL (default: wss://ws.bubble.trade)
   - `NEXT_PUBLIC_MONITOR_URL` - Monitor API URL (default: https://monitor.bubble.trade)

5. Run development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:

1. Connect repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## Data Sources

| Source | Endpoint | Data |
|--------|----------|------|
| Supabase | `betting_users` | User accounts, balances |
| Supabase | `bets` | All bets, amounts, outcomes |
| Supabase | `correction_cells` | Calibration observations |
| Supabase | `correction_snapshots` | Observation totals over time |
| WebSocket | `wss://ws.bubble.trade` | Live price, vol band, grid |
| Monitor API | `/system/health` | Service health status |

## Security Notes

- Service key is only used server-side (API routes)
- No sensitive multiplier formulas or correction ratios are exposed
- Dashboard is read-only — no mutations to backend data
- Add authentication before exposing publicly (wallet-gate or password)

## License

Private - Bubble Trade

---
Part of the [Bubble-Trade](https://github.com/Bubble-Trade) organization.
