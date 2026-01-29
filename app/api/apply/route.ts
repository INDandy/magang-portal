import { prisma } from "@/lib/prisma";

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
    const educationLevel = formData.get("educationLevel") as string;
    const universityName = formData.get("universityName") as string;
    const schoolName = formData.get("schoolName") as string;
    const prodi = formData.get("prodi") as string;
    const jurusan = formData.get("jurusan") as string;
    const semester = formData.get("semester") as string;
    const kelas = formData.get("kelas") as string;
    const radarCireubonPosition = formData.get("radarCireubonPosition") as string;
    const file = formData.get("file") as File;

    // Validate inputs
    if (!name || !email || !phone || !file) {
      return new Response(
        JSON.stringify({ success: false, message: "Semua field harus diisi" }),
        { status: 400 }
      );
    }

    if (!educationLevel) {
      return new Response(
        JSON.stringify({ success: false, message: "Silakan pilih tingkat pendidikan" }),
        { status: 400 }
      );
    }

    // Validate based on education level
    if (educationLevel === "Mahasiswa") {
      if (!universityName || !prodi || !semester) {
        return new Response(
          JSON.stringify({ success: false, message: "Silakan lengkapi nama universitas, prodi, dan semester" }),
          { status: 400 }
        );
      }
    } else if (educationLevel === "SMK") {
      if (!schoolName || !jurusan || !kelas) {
        return new Response(
          JSON.stringify({ success: false, message: "Silakan lengkapi nama sekolah dan jurusan" }),
          { status: 400 }
        );
      }
    }

    if (!radarCireubonPosition) {
      return new Response(
        JSON.stringify({ success: false, message: "Silakan pilih posisi di Radar Cirebon" }),
        { status: 400 }
      );
    }

    // Validate phone number length (10-15 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return new Response(
        JSON.stringify({ success: false, message: "Nomor telepon harus antara 10-15 angka" }),
        { status: 400 }
      );
    }

    // Validate phone format (only digits and + symbol allowed)
    if (!/^[0-9+]+$/.test(phone)) {
      return new Response(
        JSON.stringify({ success: false, message: "Nomor telepon hanya boleh berisi angka dan simbol +" }),
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

    // Store file data in database
    const buffer = Buffer.from(await file.arrayBuffer());

    // Simpan Applicant di database and link to user if provided
    const userIdRaw = formData.get("userId") as string | null;
    const data: any = {
      name,
      email,
      phone,
      educationLevel,
      universityName,
      schoolName,
      semester,
      kelas,
      prodi,
      jurusan,
      radarCireubonPosition,
      fileName: file.name,
      fileData: buffer,
      status: "PENDING",
    };

    if (userIdRaw) {
      const uid = parseInt(userIdRaw, 10);
      if (!isNaN(uid)) {
        data.userId = uid;
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
