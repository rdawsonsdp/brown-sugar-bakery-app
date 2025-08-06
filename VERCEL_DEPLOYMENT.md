# Vercel Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is perfect for Next.js apps and offers the easiest deployment process.

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rdawsonsdp/brown-sugar-bakery-app&project-name=brown-sugar-bakery&repository-name=brown-sugar-bakery-app&root-directory=bakery-app)

### Option 2: Manual Setup

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

#### Step 2: Deploy Your App
1. **Import Project**
   - Click "New Project" on Vercel dashboard
   - Select your GitHub repository: `brown-sugar-bakery-app`
   - Framework Preset: **Next.js** (should auto-detect)
   - **Root Directory**: `bakery-app` ⚠️ **IMPORTANT**

2. **Configure Build Settings**
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
   - Install Command: `npm install` (auto-filled)

3. **Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   NODE_ENV = production
   ```

   **Get Supabase credentials:**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project → Settings → API
   - Copy "Project URL" and "anon public" key

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get your live URL: `https://brown-sugar-bakery-app-xyz.vercel.app`

### Step 3: Verify Deployment

✅ **Your app should be live!**
- Visit the Vercel URL
- Test database connectivity
- Verify all pages load correctly

### Auto-Deployments

Once connected, Vercel automatically redeploys when you push to your GitHub repository's main branch.

### Vercel CLI (Optional)

For local deployment testing:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
cd clean-deployment
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Confirm settings
```

### Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

**Database Connection Issues:**
- Double-check Supabase URL and API key
- Verify your Supabase project is active
- Check network policies in Supabase dashboard

**404 Errors:**
- Ensure Root Directory is set to `bakery-app`
- Check that `vercel.json` is configured correctly

### Cost

- **Hobby Plan**: Free forever
  - 100GB bandwidth per month
  - Unlimited personal projects
  - Custom domains
  
- **Pro Plan**: $20/month (if you need more)

### Benefits of Vercel

✅ **Perfect for Next.js** - Built by the Next.js team
✅ **Global CDN** - Fast worldwide performance  
✅ **Automatic HTTPS** - SSL certificates included
✅ **Custom domains** - Easy to add your own domain
✅ **Preview deployments** - Every git push gets a preview URL
✅ **Edge functions** - Serverless functions at the edge