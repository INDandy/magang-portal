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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicantId, message } = body;

    if (!applicantId || !message) {
      return new Response(JSON.stringify({ success: false, message: "applicantId and message are required" }), { status: 400 });
    }

    const id = typeof applicantId === "number" ? applicantId : parseInt(String(applicantId), 10);

    if (isNaN(id)) {
      return new Response(JSON.stringify({ success: false, message: "Invalid applicantId" }), { status: 400 });
    }

    const applicant = await prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      return new Response(JSON.stringify({ success: false, message: "Applicant not found" }), { status: 404 });
    }

    const notif = await prisma.notification.create({ data: { applicantId: id, message } });

    return new Response(JSON.stringify({ success: true, notification: notif }), { status: 200 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to create notification" }), { status: 500 });
  }
}
