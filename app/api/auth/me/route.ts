import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check for session/token from cookies or headers
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    // For now, we'll consider any request with an auth header as authenticated
    // In a real app, you'd validate the JWT token or session
    return new Response(
      JSON.stringify({ success: true, authenticated: true }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Error checking auth" }),
      { status: 500 }
    );
  }
}
