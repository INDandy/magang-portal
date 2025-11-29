import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    // Validate input
    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, message: "ID dan status harus diisi" }),
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["PENDING", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ success: false, message: "Status tidak valid" }),
        { status: 400 }
      );
    }

    // Update applicant status
    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: { status },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        applicantId: id,
        message:
          status === "ACCEPTED"
            ? "Selamat! Lamaran kamu diterima. Tim kami akan menghubungi Anda segera."
            : status === "REJECTED"
            ? "Terima kasih atas permohonan Anda. Maaf, pada kesempatan kali ini kami tidak dapat menerima lamaran Anda. Kami berharap dapat bekerja sama di masa depan."
            : "Status lamaran Anda telah diperbarui.",
      },
    });

    return new Response(
      JSON.stringify({ success: true, applicant: updatedApplicant }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating status:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Gagal memperbarui status" }),
      { status: 500 }
    );
  }
}
