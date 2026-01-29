import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { id, status, message } = await req.json();

    const applicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return new Response(JSON.stringify({ success: false, message: "Applicant not found" }), { status: 404 });
    }

    await prisma.applicant.update({
      where: { id },
      data: { status },
    });

    // simpan notifikasi
    await prisma.notification.create({
      data: {
        applicantId: id,
        message,
        sender: "Admin",
      },
    });

    // kirim email
    await sendMail(
      applicant.email,
      status === "ACCEPTED" ? "Selamat, Kamu Diterima 🎉" : "Hasil Seleksi Magang",
      `
        <h3>Halo ${applicant.name}</h3>
        <p>${message}</p>
        <hr/>
        <small>Silakan login ke website untuk info lebih lanjut.</small>
      `
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Update status error:", error);
    return new Response(JSON.stringify({ success: false, message: "Gagal update status" }), { status: 500 });
  }
}
