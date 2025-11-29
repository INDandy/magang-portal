import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, role } = body;

  // Cek email sudah ada di User
  const exist = await prisma.user.findUnique({ where: { email } });
  if (exist) {
    return new Response(
      JSON.stringify({ success: false, message: "Email sudah terdaftar!" }),
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hash, role },
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }),
    { status: 200 }
  );
}
