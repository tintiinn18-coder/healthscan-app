# HealthScan App

**Know more about what you eat.** Scan packaged food labels, review ingredients and nutrition, and track recurring exposure events.

## Features

- **Instant Barcode Scanning** - Camera + manual entry support
- **Personalized Health Analysis** - Based on YOUR conditions, allergies, diet
- **Additive Deep Dive** - 20+ additives of concern with public-source notes and citations
- **Weekly Health Tracking** - Cumulative sodium, sugar, additive exposure
- **Better Alternatives** - Healthier product suggestions
- **Family Profiles** - Multi-user health management
- **100% Free** - Open source, no paywalls

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Database**: Supabase PostgreSQL (free tier)
- **Auth**: Supabase Auth (email + OAuth)
- **AI Analysis**: Groq API (Llama 3, free tier)
- **Product Data**: Open Food Facts API (free, open source)
- **Hosting**: Vercel (free tier)

## Quick Start

### Prerequisites
- Node.js 18+
- Git
- Vercel CLI: `npm i -g vercel`
- Supabase CLI: `npm i -g supabase`

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/healthscan-app.git
cd healthscan-app
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GROQ_API_KEY=gsk_your_groq_key
```

### 3. Database Setup
```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

### 4. Deploy Edge Function
```bash
supabase functions deploy analyze-ingredients
supabase secrets set --env-file .env.local
```

### 5. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

### 6. Deploy to Production
```bash
vercel --prod
```

## Database Schema

### Profiles
- User health conditions, allergies, dietary restrictions
- Daily budget limits (sodium, sugar, saturated fat)
- Family member profiles

### Scans
- Product scan history with health scores
- Additive breakdown per scan
- Personalized risk alerts

### Daily Logs
- Cumulative daily nutrition tracking
- Rolling 7-day budget adherence

### Chemical Exposure
- Weekly additive exposure tracking
- Warning triggers for over-exposure

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/product/[barcode]` | GET | Fetch product from Open Food Facts |
| `/api/analyze` | POST | Analyze product against user profile |
| `/api/alternatives` | POST | Find healthier alternatives |

## Edge Functions

| Function | Description |
|----------|-------------|
| `analyze-ingredients` | AI-powered ingredient analysis via Groq |

## Free Tier Limits

| Service | Free Limit | App Usage |
|---------|-----------|-----------|
| Vercel Hobby | 100GB bandwidth, 10s functions | Sufficient for MVP |
| Supabase Free | 500MB DB, 50K MAU, 1GB storage | Good for 1,000+ users |
| Open Food Facts | Unlimited (be respectful) | Completely free |
| Groq AI | 1.5M tokens/month | ~10,000 analyses/month |

## Legal Disclaimer

This app provides general educational information about food ingredients and additives. It is **not a substitute for professional medical advice, diagnosis, or treatment**. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or dietary restrictions.

Data sourced from Open Food Facts (crowd-sourced database). Product information may not be complete or accurate.

## License

MIT License - Free for personal and commercial use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/healthscan-app/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/healthscan-app/discussions)

---

**Built with love for healthier eating.**
