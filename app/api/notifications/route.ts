import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const applicantId = url.searchParams.get("applicantId");

  if (!applicantId) {
    return new Response(
      JSON.stringify({ error: "applicantId is required" }),
      { status: 400 }
    );
  }

  const notif = await prisma.notification.findMany({
    where: { applicantId: parseInt(applicantId) },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return new Response(JSON.stringify(notif));
}
