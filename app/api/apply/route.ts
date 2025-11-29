import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const file = formData.get("file") as File;

  // Cek email sudah ada di Applicant
  const exist = await prisma.applicant.findFirst({ where: { email } });
  if (exist) {
    return new Response(
      JSON.stringify({ success: false, message: "Email sudah mendaftar!" }),
      { status: 400 }
    );
  }

  // Simpan file (contoh sederhana ke folder public/uploads)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Simpan Applicant di database and link to user if provided
  const userIdRaw = formData.get("userId") as string | null;
  const data: any = {
    name,
    email,
    phone,
    fileUrl: `/uploads/${path.basename(filePath)}`,
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
}
