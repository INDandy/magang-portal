import nodemailer from "nodemailer";
import "dotenv/config";

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // ganti kalau bukan Gmail
    port: 587,
    secure: false, // karena pakai 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // kirim ke diri sendiri
      subject: "SMTP Test",
      html: "<h3>SMTP berhasil 🎉</h3><p>Kalau ini masuk, berarti SMTP kamu aman.</p>",
    });

    console.log("EMAIL BERHASIL DIKIRIM");
    console.log(info);
  } catch (error) {
    console.error("SMTP ERROR:", error);
  }
}

testSMTP();
