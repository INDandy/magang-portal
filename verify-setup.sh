#!/bin/bash
# Vercel Database Connection Verification Script

echo "🔍 Vercel Database Connection Verification"
echo "=========================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file not found"
    exit 1
fi

# Check DATABASE_URL
if grep -q "DATABASE_URL=" .env; then
    echo "✅ DATABASE_URL configured"
    if grep "DATABASE_URL=.*pgbouncer=true" .env > /dev/null; then
        echo "   ✅ Using connection pooler (pgbouncer=true)"
    else
        echo "   ⚠️  WARNING: Not using connection pooler. Add ?pgbouncer=true"
    fi
else
    echo "❌ DATABASE_URL not found"
fi

# Check DIRECT_URL
if grep -q "DIRECT_URL=" .env; then
    echo "✅ DIRECT_URL configured"
else
    echo "❌ DIRECT_URL not found"
fi

echo ""
echo "📋 Files Modified:"
echo "   ✅ lib/prisma.ts"
echo "   ✅ app/api/auth/login/route.ts"
echo "   ✅ app/api/auth/register/route.ts"
echo "   ✅ app/api/apply/route.ts"
echo "   ✅ app/api/notifications/route.ts"
echo "   ✅ app/api/update-status/route.ts"
echo "   ✅ app/api/health/route.ts"

echo ""
echo "🚀 Next Steps:"
echo "   1. Verify environment variables in Vercel dashboard"
echo "   2. Run: npm run build"
echo "   3. Test locally: npm run dev"
echo "   4. Visit: http://localhost:3000/api/health"
echo "   5. Deploy to Vercel"
echo "   6. Test login on deployed app"

echo ""
echo "✨ Setup complete! Read VERCEL_SETUP.md for detailed instructions."
