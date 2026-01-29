"use client";
import { useState } from "react";

interface ApplicationFormProps {
  onApplySuccess?: (applicantId: number) => void;
}

const RADAR_CIREBON_POSITIONS = [
  "Penyiaran (Broadcasting)",
  "Fotografi",
  "Videografi",
  "Desain Grafis",
  "Editing Video",
];

const SEMESTER_OPTIONS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

const KELAS_OPTIONS = [
  "Kelas X",
  "Kelas XI",
  "Kelas XII",
];

const EDUCATION_LEVELS = [
  "Mahasiswa",
  "SMK",
];

export default function ApplicationForm({ onApplySuccess }: ApplicationFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    educationLevel: "",
    universityName: "",
    schoolName: "",
    kelas: "",
    prodi: "",
    jurusan: "",
    semester: "",
    radarCireubonPosition: "",
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phoneWarning, setPhoneWarning] = useState("");

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

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    
    // Only allow digits and + symbol
    const filteredValue = value.replace(/[^0-9+]/g, "");
    
    // Check for invalid characters
    if (value !== filteredValue) {
      setPhoneWarning("⚠ Hanya angka dan simbol + yang dibolehkan");
    } else {
      setPhoneWarning("");
    }
    
    const phoneDigits = filteredValue.replace(/\D/g, "");
    
    // Update warning berdasarkan panjang
    if (phoneDigits.length > 0 && phoneDigits.length < 10) {
      setPhoneWarning(`⚠ Minimal 10 angka (${phoneDigits.length} angka)`);
    } else if (phoneDigits.length > 15) {
      setPhoneWarning(`⚠ Maksimal 15 angka (${phoneDigits.length} angka)`);
    } else if (phoneDigits.length >= 10 && phoneDigits.length <= 15) {
      setPhoneWarning("✓ Format nomor telpon valid");
    } else {
      setPhoneWarning("");
    }
    
    setForm({ ...form, phone: filteredValue });
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

    // Validate phone number length
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Nomor telepon harus antara 10-15 angka");
      return;
    }

    if (!form.educationLevel) {
      setError("Silakan pilih tingkat pendidikan");
      return;
    }

    if (form.educationLevel === "Mahasiswa") {
      if (!form.universityName || !form.prodi || !form.semester) {
        setError("Silakan lengkapi nama universitas, prodi, dan semester");
        return;
      }
    } else if (form.educationLevel === "SMK") {
      if (!form.schoolName || !form.jurusan || !form.kelas) {
        setError("Silakan lengkapi nama sekolah dan jurusan");
        return;
      }
    }

    if (!form.radarCireubonPosition) {
      setError("Silakan pilih posisi di Radar Cirebon");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("educationLevel", form.educationLevel);
      formData.append("kelas", form.kelas);
      formData.append("universityName", form.universityName);
      formData.append("schoolName", form.schoolName);
      formData.append("prodi", form.prodi);
      formData.append("jurusan", form.jurusan);
      formData.append("semester", form.semester);
      formData.append("radarCireubonPosition", form.radarCireubonPosition);
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
        setForm({ name: "", email: "", phone: "", educationLevel: "", kelas: "" , universityName: "", schoolName: "", prodi: "", jurusan: "", semester: "", radarCireubonPosition: "", file: null });
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
            placeholder="Contoh: +628123456789 atau 081234567890"
            maxLength={20}
            className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
            value={form.phone}
            onChange={handlePhoneChange}
            required
          />
          <p className={`text-xs mt-2 font-semibold ${
            phoneWarning.includes("✓") ? "text-green-600" : 
            phoneWarning.includes("⚠") ? "text-orange-600" : 
            "text-gray-500"
          }`}>
            {phoneWarning || `${form.phone.replace(/\D/g, "").length}/10-15 angka`}
          </p>
        </div>

        {/* Education Level Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Tingkat Pendidikan</label>
          <select
            className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
            value={form.educationLevel}
            onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
            required
          >
            <option value="">-- Pilih Tingkat Pendidikan --</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional Fields for Mahasiswa */}
        {form.educationLevel === "Mahasiswa" && (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nama Universitas</label>
              <input
                type="text"
                placeholder="Contoh: Universitas Indonesia, ITB"
                className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.universityName}
                onChange={(e) => setForm({ ...form, universityName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Prodi</label>
              <input
                type="text"
                placeholder="Contoh: Informatika, Sistem Informasi"
                className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.prodi}
                onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Semester</label>
              <select
                className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                required
              >
                <option value="">-- Pilih Semester --</option>
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Conditional Fields for SMK */}
        {form.educationLevel === "SMK" && (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nama Sekolah</label>
              <input
                type="text"
                placeholder="Contoh: SMK Negeri 1 Cirebon"
                className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Jurusan</label>
              <input
                type="text"
                placeholder="Contoh: Multimedia, Teknik Komputer Jaringan"
                className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.jurusan}
                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                required
              />
            </div>

             <div>
              <label className="block text-gray-700 font-semibold mb-2">Kelas</label>
              <select
                className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                required
              >
                <option value="">-- Pilih Kelas --</option>
                {KELAS_OPTIONS.map((kel) => (
                  <option key={kel} value={kel}>
                    {kel}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Radar Cirebon Position Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Posisi yang Diambil di Radar Cirebon</label>
          <select
            className="w-full border-2 border-gray-200 p-4 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
            value={form.radarCireubonPosition}
            onChange={(e) => setForm({ ...form, radarCireubonPosition: e.target.value })}
            required
          >
            <option value="">-- Pilih Posisi --</option>
            {RADAR_CIREBON_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Upload CV / Surat Lamaran (PDF)</label>
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
          <li>Anda akan menerima notifikasi melalui notifikasi yang ada di website ini</li>
        </ul>
      </div>
    </div>
  );
}
