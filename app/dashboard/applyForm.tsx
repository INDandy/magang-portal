"use client";
import { useState } from "react";

export function ApplyForm() {
  const [loading, setLoading] = useState(false);

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/apply", { method: "POST", body: formData });
    if (res.ok) {
      alert("Pendaftaran berhasil dikirim!");
      e.currentTarget.reset();
    } else {
      alert("Gagal mengirim pendaftaran!");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Form Pendaftaran Magang</h2>
      <form className="space-y-4" onSubmit={submitForm}>
        <input
          name="name"
          placeholder="Nama"
          required
          className="border w-full p-3 rounded-lg"
        />
        <input
          name="email"
          placeholder="Email"
          required
          className="border w-full p-3 rounded-lg"
        />
        <input
          name="phone"
          placeholder="Nomor HP"
          required
          className="border w-full p-3 rounded-lg"
        />
        <input
          name="file"
          type="file"
          required
          className="border w-full p-3 rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Mengirim..." : "Kirim Pendaftaran"}
        </button>
      </form>
    </div>
  );
}
