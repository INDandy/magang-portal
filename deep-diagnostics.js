require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function deepDiagnostics() {
  console.log("🔍 Running Deep Database Diagnostics...\n");

  const prisma = new PrismaClient();

  try {
    // 1. Check table structure
    console.log("📋 Checking Table Structures:\n");
    
    const tables = ["public.User", "public.Applicant", "public.Notification"];
    
    for (const table of tables) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = ${table.split('.')[1]}
        ORDER BY ordinal_position
      `;
      
      console.log(`\n${table}:`);
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 2. Check foreign keys
    console.log("\n\n🔗 Checking Foreign Keys:\n");
    const fks = await prisma.$queryRaw`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('User', 'Applicant', 'Notification')
    `;
    
    if (fks.length === 0) {
      console.log("⚠️  No foreign keys found!");
    } else {
      fks.forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }

    // 3. Check constraints
    console.log("\n\n📌 Checking Constraints:\n");
    const constraints = await prisma.$queryRaw`
      SELECT 
        table_name,
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_name IN ('User', 'Applicant', 'Notification')
      ORDER BY table_name
    `;
    
    constraints.forEach(c => {
      console.log(`  ${c.table_name}: ${c.constraint_type} - ${c.constraint_name}`);
    });

    // 4. Check indexes
    console.log("\n\n📑 Checking Indexes:\n");
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename IN ('User', 'Applicant', 'Notification')
    `;
    
    indexes.forEach(idx => {
      console.log(`  ${idx.tablename}: ${idx.indexname}`);
    });

    // 5. Try a sample query
    console.log("\n\n🧪 Testing Sample Queries:\n");
    
    try {
      const userCount = await prisma.user.count();
      console.log(`  Users: ${userCount}`);
    } catch (e) {
      console.error(`  Users: ❌ ${e.message}`);
    }

    try {
      const applicantCount = await prisma.applicant.count();
      console.log(`  Applicants: ${applicantCount}`);
    } catch (e) {
      console.error(`  Applicants: ❌ ${e.message}`);
    }

    try {
      const notificationCount = await prisma.notification.count();
      console.log(`  Notifications: ${notificationCount}`);
    } catch (e) {
      console.error(`  Notifications: ❌ ${e.message}`);
    }

  } catch (error) {
    console.error("❌ Diagnostic failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deepDiagnostics();
