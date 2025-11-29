"use client";
import { useState } from "react";

interface ApplicationFormProps {
  onApplySuccess?: (applicantId: number) => void;
}

export default function ApplicationForm({ onApplySuccess }: ApplicationFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type is PDF
      if (file.type !== "application/pdf") {
        setError("File harus berformat PDF");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }
      setError("");
      setForm({ ...form, file });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.file) {
      setError("Silakan pilih file PDF");
      return;
    }

    if (!form.name || !form.email || !form.phone) {
      setError("Semua field harus diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
        formData.append("file", form.file);

        // attach logged-in user id if available so server can link applicant to user
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user?.id) formData.append("userId", String(user.id));
          }
        } catch (err) {
          // ignore localStorage errors
        }

      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Store applicantId for notifications
        if (data.applicant?.id) {
          localStorage.setItem("applicantId", data.applicant.id.toString());
          onApplySuccess?.(data.applicant.id);
        }
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", file: null });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || "Gagal mengirim aplikasi");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg animate-slide-down">
          <p className="font-semibold">✓ Aplikasi Anda berhasil dikirim!</p>
          <p className="text-sm">Admin akan meninjau aplikasi Anda dalam waktu singkat.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg animate-slide-down">
          <p className="font-semibold">✗ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Nomor Telepon</label>
          <input
            type="tel"
            placeholder="Masukkan nomor telepon Anda"
            className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        {/* File Upload Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Upload CV/Resume (PDF)</label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <div className="text-3xl mb-2">📄</div>
              {form.file ? (
                <div>
                  <p className="font-semibold text-green-600">{form.file.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ({(form.file.size / 1024).toFixed(2)} KB)
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Klik untuk mengganti file</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-gray-700">
                    Drag and drop file PDF di sini
                  </p>
                  <p className="text-sm text-gray-600 mt-1">atau klik untuk memilih file</p>
                  <p className="text-xs text-gray-500 mt-2">Maksimal ukuran: 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Mengirim...
            </span>
          ) : (
            "Kirim Aplikasi"
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">ℹ Informasi Penting</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>File harus berformat PDF dengan ukuran maksimal 5MB</li>
          <li>Pastikan semua data yang Anda isi sudah benar</li>
          <li>Admin akan meninjau aplikasi Anda dalam waktu 3-7 hari kerja</li>
          <li>Anda akan menerima notifikasi melalui email tentang status aplikasi</li>
        </ul>
      </div>
    </div>
  );
}
