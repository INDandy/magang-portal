import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function GET() {
  try {
    const applicants = await prisma.applicant.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(applicants), { status: 200 });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch applicants" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const file = formData.get("file") as File;

    // Validate inputs
    if (!name || !email || !phone || !file) {
      return new Response(
        JSON.stringify({ success: false, message: "Semua field harus diisi" }),
        { status: 400 }
      );
    }

    // Cek email sudah ada di Applicant
    const exist = await prisma.applicant.findFirst({ where: { email } });
    if (exist) {
      return new Response(
        JSON.stringify({ success: false, message: "Email sudah mendaftar!" }),
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const blobName = `${Date.now()}-${file.name}`;
    
    let fileUrl = "";
    try {
      const blob = await put(blobName, buffer, {
        access: "public",
        contentType: file.type,
      });
      fileUrl = blob.url;
    } catch (blobError) {
      console.error("Blob storage error:", blobError);
      // Fallback: store as base64 in database if blob fails
      const fileBase64 = buffer.toString("base64");
      fileUrl = `data:${file.type};base64,${fileBase64}`;
    }

    // Simpan Applicant di database and link to user if provided
    const userIdRaw = formData.get("userId") as string | null;
    const data: any = {
      name,
      email,
      phone,
      fileUrl: fileUrl,
      status: "PENDING",
    };

    if (userIdRaw) {
      const uid = parseInt(userIdRaw, 10);
      if (!isNaN(uid)) {
        data.user = { connect: { id: uid } };
      }
    }

    const applicant = await prisma.applicant.create({
      data,
      include: { user: true },
    });

    return new Response(JSON.stringify({ success: true, applicant }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing application:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Terjadi kesalahan saat memproses aplikasi",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}
