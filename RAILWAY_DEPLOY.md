# 🚀 Deploy to Railway - Fixed Configuration

## Railway Deployment Issues Fixed

The SQLite database issue has been resolved. Here are two deployment options:

## Option 1: SQLite (Simple)
Railway deployment will now use `/tmp/plans.db` which is writable in Railway containers.

## Option 2: PostgreSQL (Recommended for Production)

### Step 1: Deploy to Railway
1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select repository: `hanzla740/web`

### Step 2: Add PostgreSQL Database
1. In Railway dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. Copy the DATABASE_URL from PostgreSQL service

### Step 3: Set Environment Variables
In Railway dashboard, go to your app service and set:

```env
SECRET_KEY=c9198c874adc5e163389d6ee30f1a0a342bc8054522ff384fac432ba5bb2fcd4
ADMIN_DEFAULT_PASSWORD=SecureAdmin2024!
FLASK_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
```

The DATABASE_URL will be automatically provided by Railway's PostgreSQL service.

### Step 4: Deploy
Railway will automatically redeploy with the new configuration.

## Quick Fix for Current Deployment

If you want to stick with SQLite for now, the app will automatically use `/tmp/plans.db` on Railway, which should work.

## Access Your Deployed App

Once deployed successfully:
- **Customer Portal**: `https://your-app-name.railway.app/`
- **Admin Dashboard**: `https://your-app-name.railway.app/admin`
- **Login**: admin / SecureAdmin2024!

## Troubleshooting

If you still see database errors:
1. Check Railway logs for specific errors
2. Ensure environment variables are set correctly
3. Consider using PostgreSQL for better reliability

The SQLite path issue should now be resolved with the `/tmp` directory fix.