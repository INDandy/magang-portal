import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicantId, message, sender } = body;

    if (!applicantId || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "applicantId and message required" }),
        { status: 400 }
      );
    }

    const id = Number(applicantId);
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

    // ✅ simpan notifikasi dulu (ini prioritas)
    const notif = await prisma.notification.create({
      data: {
        applicantId: id,
        message,
      },
    });

    // ✅ kirim email tapi jangan bikin API gagal kalau error
    try {
      await sendMail(
        applicant.email,
        "Notifikasi Magang Radar Cirebon",
        `
          <h3>Notifikasi dari ${sender || "Admin"}</h3>
          <p>${message}</p>
          <hr/>
          <p>
            <a href="https://magang-radar.vercel.app/login"
               style="display:inline-block;background:#2563eb;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Login ke Website
            </a>
          </p>
          <small>Silakan login untuk detail lebih lanjut.</small>
        `
      );
    } catch (mailError) {
      console.error("EMAIL ERROR:", mailError);
    }

    return new Response(
      JSON.stringify({ success: true, notification: notif }),
      { status: 200 }
    );

  } catch (error) {
    console.error("API ERROR:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to create notification" }),
      { status: 500 }
    );
  }
}
