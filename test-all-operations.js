require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function testAllOperations() {
  console.log("🧪 Testing All Database Operations...\n");

  const prisma = new PrismaClient({
    log: ["info", "error", "warn"],
  });

  try {
    // Test 1: User.findUnique
    console.log("1️⃣  Testing User.findUnique...");
    try {
      const user = await prisma.user.findUnique({
        where: { email: "nonexistent@test.com" },
      });
      console.log("   ✅ Success (user not found, expected)");
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

    // Test 2: User.count
    console.log("\n2️⃣  Testing User.count...");
    try {
      const count = await prisma.user.count();
      console.log("   ✅ Success - Users in DB:", count);
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

    // Test 3: Applicant.findMany
    console.log("\n3️⃣  Testing Applicant.findMany with relations...");
    try {
      const applicants = await prisma.applicant.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
      console.log("   ✅ Success - Applicants found:", applicants.length);
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

    // Test 4: Applicant.findFirst
    console.log("\n4️⃣  Testing Applicant.findFirst...");
    try {
      const applicant = await prisma.applicant.findFirst({
        where: { email: "nonexistent@test.com" },
      });
      console.log("   ✅ Success (applicant not found, expected)");
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

    // Test 5: Notification.findMany
    console.log("\n5️⃣  Testing Notification.findMany...");
    try {
      const notifs = await prisma.notification.findMany({
        where: { applicantId: 1 },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      console.log("   ✅ Success - Notifications found:", notifs.length);
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

    // Test 6: Test with actual data
    console.log("\n6️⃣  Testing with actual applicant data...");
    try {
      const applicants = await prisma.applicant.findMany({
        take: 1,
      });
      if (applicants.length > 0) {
        console.log("   Found applicant:", applicants[0].id);
        
        // Try to access file data
        console.log("   Checking fileData field...");
        const fileSize = applicants[0].fileData 
          ? Buffer.from(applicants[0].fileData).length 
          : 0;
        console.log("   ✅ FileData size:", fileSize, "bytes");
      } else {
        console.log("   ℹ️  No applicants in database");
      }
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

    // Test 7: Raw SQL test
    console.log("\n7️⃣  Testing raw SQL query...");
    try {
      const result = await prisma.$queryRaw`
        SELECT id, name, email, "fileName", "fileData" IS NOT NULL as has_file
        FROM "Applicant" 
        LIMIT 5
      `;
      console.log("   ✅ Success - Raw query result:", result);
    } catch (e) {
      console.error("   ❌ Error:", e.message);
    }

  } catch (error) {
    console.error("\n❌ Critical error:", error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n✅ All tests completed!");
}

testAllOperations();
