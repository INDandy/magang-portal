import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json(
      { 
        status: "healthy",
        message: "Database connection is working",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      { 
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
