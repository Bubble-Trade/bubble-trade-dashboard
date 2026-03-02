# AGENTS.md — Bubble Trade Dashboard

> **For AI Agents:** This is the admin dashboard for monitoring Bubble Trade.
> It's read-only — displays data from Supabase and the backend WebSocket.
>
> **Last Updated:** 2026-03-02

---

## Quick Reference

| Item | Value |
|------|-------|
| **Repo** | `github.com/Bubble-Trade/bubble-trade-dashboard` |
| **Stack** | Next.js 14, Tailwind, Recharts, Supabase |
| **Purpose** | Admin monitoring (read-only) |
| **Hosted** | Vercel |

---

## What This Is

An internal admin dashboard showing:
- **Live market data** — BTC price, vol band, killswitch status
- **System health** — Service status (WS, API, calibration)
- **Financial metrics** — Total wagered, payouts, P&L, house edge
- **Calibration insights** — Observations by vol band
- **Bet activity** — Recent bets, win/loss rates

**This is read-only.** No mutations, no betting, no user-facing features.

---

## Data Sources

| Source | Data |
|--------|------|
| **WebSocket** (`wss://ws.bubble.trade`) | Live price, vol band, killswitch |
| **Monitor API** (`/system/health`) | Service health status |
| **Supabase** `betting_users` | User accounts, balances |
| **Supabase** `bets` | All bets, amounts, outcomes |
| **Supabase** `correction_cells` | Calibration observations |
| **Supabase** `correction_snapshots` | Observation totals over time |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Dashboard Frontend                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Cards   │  │  Charts  │  │  Tables  │      │
│  │(metrics) │  │(Recharts)│  │ (bets)   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       └─────────────┼─────────────┘             │
│                     │                           │
│           ┌─────────▼─────────┐                 │
│           │    API Routes     │                 │
│           │  (Server-side)    │                 │
│           └─────────┬─────────┘                 │
└─────────────────────┼───────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │Supabase │  │WebSocket │  │ Monitor  │
   │(DB)     │  │(bubble-ws)│ │  API     │
   └─────────┘  └──────────┘  └──────────┘
```

---

## Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key  # Server-side only

# Backend services
NEXT_PUBLIC_WS_URL=wss://ws.bubble.trade
NEXT_PUBLIC_MONITOR_URL=https://monitor.bubble.trade
```

---

## File Structure

```
src/
├── app/
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes (server-side Supabase queries)
│
├── components/
│   ├── cards/             # Metric cards (users, bets, P&L)
│   ├── charts/            # Recharts visualizations
│   ├── live/              # Real-time components (WS-connected)
│   └── tables/            # Data tables (bets, users)
│
└── lib/                   # Supabase client, helpers
```

---

## Security Notes

- **Service key is server-side only** (used in API routes, not exposed)
- **No sensitive formulas exposed** — just observation counts, not correction ratios
- **Read-only** — no mutations to backend data
- **Add authentication before public deployment** (wallet-gate or password)

---

## Development

```bash
git clone git@github.com:Bubble-Trade/bubble-trade-dashboard.git
cd bubble-trade-dashboard
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev
```

---

## Related Repos

- **Backend:** `github.com/deficlawd/bubble-trade-backend` — See `AGENTS.md` there
- **Game UI:** `github.com/DeFiMark/TapTrade` — Player-facing frontend

---

*This dashboard is simple by design. See the backend AGENTS.md for system details.*
