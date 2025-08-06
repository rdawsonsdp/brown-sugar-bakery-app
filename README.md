# Brown Sugar Bakery App

A Next.js application for managing bakery orders with Supabase backend.

## Deployment

This app is configured for Digital Ocean App Platform deployment.

### Quick Deploy to Digital Ocean

1. Fork/clone this repository
2. Create a new App in Digital Ocean App Platform
3. Connect your GitHub repository
4. Set source directory to `bakery-app`
5. Add environment variables (see `.env.example`)
6. Deploy!

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

### Local Development

```bash
cd bakery-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Digital Ocean App Platform
- **Container**: Docker ready