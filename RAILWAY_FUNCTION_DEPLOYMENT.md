# Railway Function Deployment Guide

## What This Is

A **Railway Function** that runs your Shopify sync **automatically every 5 minutes** using cron scheduling.

## Benefits of Railway Functions

✅ **Serverless**: Only runs when triggered, no always-on costs  
✅ **Cron Scheduled**: Automatic execution every 5 minutes  
✅ **Scalable**: Handles load automatically  
✅ **Cost Effective**: Pay only for execution time  
✅ **Logs**: Full execution logs in Railway dashboard  

## Quick Deploy

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Deploy Function
1. **New Project** → **Deploy from GitHub repo**
2. Select repository: `brown-sugar-bakery-app`
3. Railway will detect the cron configuration automatically

### Step 3: Environment Variables
Add these in Railway dashboard → Variables:

```
SUPABASE_URL=https://ohvtwtjnxbazawkuavwk.supabase.co
SUPABASE_SERVICE_KEY=your_actual_service_key
SHOPIFY_SHOP_URL=https://brown-sugar-bakery-chicago.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_actual_shopify_token
```

### Step 4: Deploy & Monitor
- Function will automatically deploy and start running
- Check logs in Railway dashboard
- Function triggers every 5 minutes: `*/5 * * * *`

## Function Behavior

🕐 **Schedule**: Every 5 minutes (customizable)  
📊 **Action**: Fetches new Shopify orders  
💾 **Storage**: Syncs to Supabase database  
📝 **Logging**: Full execution logs  
⚡ **Response**: Success/failure status  

## Cron Schedule

Current: `*/5 * * * *` (every 5 minutes)

**Other options:**
- Every 10 minutes: `*/10 * * * *`
- Every hour: `0 * * * *`
- Twice daily: `0 9,17 * * *`

Edit `railway.json` to change schedule.

## Monitoring

- **Railway Dashboard**: View function executions and logs
- **Supabase Dashboard**: See orders being created
- **Execution Time**: Each run typically takes 10-30 seconds

## Cost

- **Free Tier**: 500,000 execution seconds/month
- **Pro Plan**: $0.000021 per execution second
- **Estimated**: ~$2-5/month for 5-minute intervals

## Files Configured

- `main.py`: Function handler with sync logic
- `railway.json`: Cron schedule configuration  
- `requirements.txt`: Python dependencies
- `Procfile`: Railway function type