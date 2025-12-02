require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  // Check environment variables
  console.log("📋 Environment Check:");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("DIRECT_URL exists:", !!process.env.DIRECT_URL);
  console.log("");

  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error("❌ Missing DATABASE_URL or DIRECT_URL in .env file");
    process.exit(1);
  }

  // Extract connection details
  const directUrl = new URL(process.env.DIRECT_URL);
  console.log("📍 Connection Details:");
  console.log("Host:", directUrl.hostname);
  console.log("Port:", directUrl.port);
  console.log("Database:", directUrl.pathname.slice(1));
  console.log("User:", directUrl.username);
  console.log("");

  // Test with Prisma
  const prisma = new PrismaClient({
    log: ["info", "error"],
  });

  try {
    console.log("⏳ Attempting database connection...");
    await prisma.$connect();
    console.log("✅ CONNECTION SUCCESSFUL!\n");

    // Test query
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("📊 Database timestamp:", result);

    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("📑 Available tables:", tables.length);
    tables.forEach((t) => console.log("  -", t.table_name));
  } catch (error) {
    console.error("❌ CONNECTION FAILED!");
    console.error("\nError Details:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("\n📍 Troubleshooting steps:");
    console.error("1. Check your internet connection");
    console.error("2. Verify DATABASE_URL and DIRECT_URL in .env");
    console.error("3. Check Supabase dashboard status");
    console.error("4. Ensure credentials are correct");
    console.error("5. Try regenerating your Supabase password");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
