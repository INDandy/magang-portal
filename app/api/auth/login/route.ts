import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return new Response(JSON.stringify({ success: false, message: "Email tidak ditemukan" }), { status: 400 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return new Response(JSON.stringify({ success: false, message: "Password salah" }), { status: 400 });

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
