export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicantId, message, sender } = body;

    if (!applicantId || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "applicantId and message are required" }),
        { status: 400 }
      );
    }

    const id =
      typeof applicantId === "number"
        ? applicantId
        : parseInt(String(applicantId), 10);

    if (isNaN(id)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid applicantId" }),
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return new Response(
        JSON.stringify({ success: false, message: "Applicant not found" }),
        { status: 404 }
      );
    }

    // simpan notifikasi
    const notif = await prisma.notification.create({
      data: {
        applicantId: id,
        message,
        sender: sender || "Admin",
      },
    });

    // kirim email
    await sendMail(
      applicant.email,
      "Notifikasi Magang Radar Cirebon",
      `
        <h3>Notifikasi dari ${sender || "Admin"}</h3>
        <p>${message}</p>
        <hr/>
        <p>
        <a href="https://magangdiradarcirebon.vercel.app/"
         style="color:#2563eb; text-decoration:none; font-weight:bold;">
        Klik di sini untuk login ke website
      </a>
    </p>
      `
    );

    return new Response(
      JSON.stringify({ success: true, notification: notif }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to create notification" }),
      { status: 500 }
    );
  }
}
