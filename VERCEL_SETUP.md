# Vercel Deployment Setup Guide

## Problem Fixed
The application was experiencing database connection failures after login on Vercel because:
1. Supabase connection pooler timeouts on serverless functions
2. Missing retry logic for transient connection failures
3. Lack of proper error handling in database operations

## Solution Applied
All API routes now include:
- ✅ Automatic retry mechanism (3 attempts with exponential backoff)
- ✅ Improved error handling and logging
- ✅ Connection pooling optimization for Vercel serverless
- ✅ Better error messages to users

## Vercel Environment Variables Setup

### Step 1: Set Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables

Add the following variables:

**For Connection Pooling (Recommended for Vercel)**
```
DATABASE_URL = postgresql://[user]:[password]@[region].pooler.supabase.com:5432/[database]?pgbouncer=true
```

**For Direct Connection (Migrations only)**
```
DIRECT_URL = postgresql://[user]:[password]@[region].pooler.supabase.com:5432/[database]
```

**Example with your settings:**
```
DATABASE_URL = postgresql://postgres.powfzvcsgvjrsdpipygo:dandygamingbanget@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres.powfzvcsgvjrsdpipygo:dandygamingbanget@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Step 2: Important Settings in Supabase

1. Go to Supabase Dashboard → Project Settings → Database
2. Verify "Connection Pooler" is enabled
3. Use the **"Connection Pooling"** URL (not the direct connection) for `DATABASE_URL`
4. Keep the **"Direct Connection"** URL for `DIRECT_URL`

### Step 3: Redeploy Your Application

After setting environment variables:
1. Push code to your repository
2. Vercel will automatically deploy
3. Or manually redeploy from Vercel dashboard → Deployments → Redeploy

## Testing the Fix

### Test 1: Health Check
Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "status": "healthy",
  "message": "Database connection is working",
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

### Test 2: Login Flow
1. Go to your app landing page
2. Click "Login" → "Daftar di sini"
3. Register a new account
4. If login succeeds, the fix is working!

### Test 3: View Logs
In Vercel dashboard:
1. Go to your project
2. Click "Logs" tab
3. Filter by "Function Logs"
4. Watch for any database connection errors

## Environment Variable Checklist

- [ ] `DATABASE_URL` set to connection pooler URL (with `?pgbouncer=true`)
- [ ] `DIRECT_URL` set to direct connection URL (for migrations)
- [ ] Both variables use your correct Supabase credentials
- [ ] Environment variables are set for "Production" in Vercel
- [ ] Application has been redeployed after setting variables

## What Was Changed in the Code

### Files Modified:
1. **lib/prisma.ts** - Enhanced Prisma client initialization with better singleton pattern
2. **app/api/auth/login/route.ts** - Added retry logic and better error handling
3. **app/api/auth/register/route.ts** - Added retry logic and validation
4. **app/api/apply/route.ts** - Added retry logic for database operations
5. **app/api/notifications/route.ts** - Added retry logic and error handling
6. **app/api/update-status/route.ts** - Added retry logic for status updates
7. **app/api/health/route.ts** - Added retry logic for connection test

### Key Improvements:
- **Retry Logic**: Each database operation retries up to 3 times with exponential backoff
- **Error Messages**: Users get clear, actionable error messages
- **Connection Pooling**: Optimized for Vercel serverless functions
- **Logging**: Better error logging for debugging

## Troubleshooting

### Issue: Still getting "Can't reach database server"
**Solution:**
1. Verify environment variables are correctly set in Vercel
2. Check that the Supabase credentials are not expired
3. Regenerate password in Supabase if needed
4. Wait 5 minutes after setting variables (Vercel caches)
5. Redeploy the application

### Issue: Slow login/registration
**Solution:**
- This is normal with retry logic (up to 3 retries × 100-800ms wait)
- Transient connection issues will be automatically recovered
- If consistently slow, check Supabase instance status

### Issue: Error in logs: "PrismaClientInitializationError"
**Solution:**
1. Confirm DATABASE_URL is using the connection pooler (has `?pgbouncer=true`)
2. Check credentials are correct
3. Verify Supabase is running
4. Restart the Vercel deployment

## Additional Notes

- Connection pooling is essential for serverless environments
- Retries are configured with exponential backoff to avoid overwhelming the database
- All errors include helpful messages in development mode
- Production logs are more concise for security

## Support & Debugging

If issues persist:
1. Check Vercel Function Logs: `https://vercel.com/dashboard`
2. Check Supabase Dashboard: `https://app.supabase.com`
3. Run local test: `npm run dev` with same `.env` variables
4. Use the `/api/health` endpoint to test connectivity

---
Last Updated: December 2, 2024
