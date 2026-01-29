"use client";
import { useEffect, useState } from "react";
import AdminNotificationsWidget from "@/app/components/AdminNotificationsWidget";

export default function AdminPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [notifStatus, setNotifStatus] = useState<null | "success" | "error">(null);
  const [notifText, setNotifText] = useState("");


  async function getApplicants() {
    try {
      setLoading(true);
      const res = await fetch("/api/apply");
      const data = await res.json();
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      setUpdating(true);
      const res = await fetch("/api/update-status", {
        method: "POST",
        body: JSON.stringify({ id, status }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        getApplicants();
        setSelectedApplicant(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function sendNotification() {
  if (!selectedApplicant) return;
  if (!notifMessage.trim()) {
    setNotifStatus("error");
    setNotifText("Isi pesan notifikasi terlebih dahulu");
    return;
  }

  try {
    setSendingNotif(true);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantId: selectedApplicant.id,
        message: notifMessage,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setNotifStatus("success");
      setNotifText("Notifikasi berhasil dikirim ke peserta ✉️");
      setNotifMessage("");
    } else {
      setNotifStatus("error");
      setNotifText(data.message || "Gagal mengirim notifikasi");
    }
  } catch (err) {
    console.error(err);
    setNotifStatus("error");
    setNotifText("Terjadi kesalahan saat mengirim notifikasi");
  } finally {
    setSendingNotif(false);
    setTimeout(() => setNotifStatus(null), 4000);
  }
}


  function handleLogout() {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  useEffect(() => {
    // Protect admin page: only allow users with role === "ADMIN"
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // not logged in — redirect to home
      window.location.href = "/";
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "ADMIN") {
        alert("Akses ditolak. Halaman ini hanya untuk admin.");
        window.location.href = "/";
        return;
      }
      setAdminName(user.name);
    } catch (err) {
      // if parsing fails, redirect
      window.location.href = "/";
      return;
    }

    getApplicants();
  }, []);

  const handleClick = async () => {
    setLoading(true);

    await getApplicants();

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const filteredApplicants = applicants.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === "PENDING").length,
    accepted: applicants.filter((a) => a.status === "ACCEPTED").length,
    rejected: applicants.filter((a) => a.status === "REJECTED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    `}</style>

    {/* Navbar */}
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center p-6">

        {/* Logo + Title */}
          <div className="flex items-center gap-2">
        <img src="/icon.svg" alt="Logo" className="w-10 h-10 object-contain" />
        <h3 className="font-bold text-blue-900 text-lg">
          Magang Portal Radar Cirebon
        </h3>
      </div>

        {/* Desktop Right Menu */}
        <div className="hidden md:flex items-center gap-4">

          {adminName ? (
            <div className="flex items-center gap-4">
              {/* Admin Avatar + Name */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admin</p>
                  <p className="font-bold text-blue-900">{adminName}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="w-7 h-7 text-blue-900"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4 animate-fade-in">

          

          {adminName ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Admin</p>
                  <p className="font-bold text-blue-900">{adminName}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      )}
    </nav>

      <div className="w-full px-6 mt-2 flex justify-end">
        <AdminNotificationsWidget />
      </div>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">Admin Dashboard</h1>
          <button
            onClick={handleClick}
            className="px-6 py-3 pl-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 group"
          >
           <img src="/icons/refresh.png" 
                alt="Refresh" 
                className={`w-5 h-5 block mr-3 ${loading ? "spin-fast" : ""}`} />
           <span className="-ml-3">Refresh</span>
          </button>
        </div>

  
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold">Total Aplikasi</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Diterima</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-semibold">Ditolak</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400"
              }`}
            >
              {f === "ALL" && "Semua"}
              {f === "PENDING" && "Pending"}
              {f === "ACCEPTED" && "Diterima"}
              {f === "REJECTED" && "Ditolak"}
            </button>
          ))}
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Tidak ada aplikasi untuk ditampilkan</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplicants.map((a) => (
              <div
                key={a.id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer border-l-4 border-blue-600"
                onClick={() => setSelectedApplicant(a)}
              >
                <div className="grid md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-500">Nama</p>
                    <p className="font-bold text-blue-900">{a.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-700">{a.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-semibold text-gray-700">{a.phone}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-lg">→</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        </div>

      {/* Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detail Aplikasi</h2>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-2xl hover:opacity-80 transition"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* 👤 Informasi Pribadi */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">👤 Informasi Pribadi</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Nama Lengkap</p>
                    <p className="text-lg font-bold text-blue-900">{selectedApplicant.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Email</p>
                    <p className="text-lg font-bold text-blue-900">{selectedApplicant.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Nomor Telepon</p>
                    <p className="text-lg font-bold text-blue-900">{selectedApplicant.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Status Saat Ini</p>
                    <span
                      className={`inline-block px-4 py-1 rounded-full text-sm font-bold border ${getStatusColor(
                        selectedApplicant.status
                      )}`}
                    >
                      {selectedApplicant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 🎓 Data Pendidikan */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-purple-900 mb-4">🎓 Data Pendidikan</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedApplicant.educationLevel === "Mahasiswa" ? (
                    <>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Tingkat Pendidikan</p>
                        <p className="text-lg font-bold text-purple-900">Mahasiswa</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Nama Universitas</p>
                        <p className="text-lg font-bold text-purple-900">{selectedApplicant.universityName || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Program Studi</p>
                        <p className="text-lg font-bold text-purple-900">{selectedApplicant.prodi || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Semester</p>
                        <p className="text-lg font-bold text-purple-900">{selectedApplicant.semester || "-"}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Tingkat Pendidikan</p>
                        <p className="text-lg font-bold text-purple-900">SMK</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">Nama Sekolah</p>
                        <p className="text-lg font-bold text-purple-900">{selectedApplicant.schoolName || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-600 text-sm font-semibold mb-1">Jurusan</p>
                        <p className="text-lg font-bold text-purple-900">{selectedApplicant.jurusan || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-600 text-sm font-semibold mb-1">Kelas</p>
                        <p className="text-lg font-bold text-purple-900">{selectedApplicant.kelas || "-"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 💼 Data Pendaftaran */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">💼 Data Pendaftaran</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Posisi yang Dilamar</p>
                    <p className="text-lg font-bold text-green-900 bg-green-100 px-3 py-2 rounded-lg inline-block">
                      {selectedApplicant.radarCireubonPosition || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">Tanggal Mendaftar</p>
                    <p className="text-gray-700">
                      {new Date(selectedApplicant.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-3">File CV/Resume</p>
                <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                  <div className="flex gap-3 items-center">
                    <div className="text-3xl flex-shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate" title={selectedApplicant.fileName || "document.pdf"}>
                        {selectedApplicant.fileName || "document.pdf"}
                      </p>
                      <p className="text-sm text-gray-600">PDF Document</p>
                    </div>
                  </div>
                  
                  {/* PDF Viewer */}
                  <div className="mt-3 bg-white rounded-lg overflow-hidden border border-gray-300">
                    <iframe
                      key={selectedApplicant.id}
                      src={selectedApplicant.fileUrl ? selectedApplicant.fileUrl : `/api/apply/${selectedApplicant.id}`}
                      className="w-full h-96 border-none"
                      title="PDF Viewer"
                      onError={() => {
                        console.error("Error loading PDF");
                      }}
                    />
                  </div>
                  
                  <a
                    href={selectedApplicant.fileUrl ? selectedApplicant.fileUrl : `/api/apply/${selectedApplicant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    ↗ Buka di Tab Baru
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplicant.status === "PENDING" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-sm text-gray-600 font-semibold mb-4">Ambil Keputusan:</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateStatus(selectedApplicant.id, "ACCEPTED")}
                      disabled={updating}
                      className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {updating ? "Loading..." : "✓ Terima Aplikasi"}
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApplicant.id, "REJECTED")}
                      disabled={updating}
                      className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {updating ? "Loading..." : "✗ Tolak Aplikasi"}
                    </button>
                  </div>
                </div>
              )}

              {selectedApplicant.status !== "PENDING" && (
                <div
                  className={`p-6 rounded-lg text-center font-bold ${
                    selectedApplicant.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  Aplikasi ini sudah {selectedApplicant.status === "ACCEPTED" ? "diterima" : "ditolak"}
                </div>
              )}

              {/* Admin send-notification box */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 font-semibold mb-3">Kirim Notifikasi ke Peserta</p>
                {notifStatus && (
                  <div
                    className={`mb-3 p-3 rounded-lg text-sm font-semibold border animate-fade-in ${
                      notifStatus === "success"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                    }`}
                  >
                    {notifText}
                  </div>
                )}

                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  rows={4}
                  placeholder="Tulis pesan notifikasi untuk peserta..."
                  className="w-full border border-gray-200 p-3 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-400 mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={sendNotification}
                    disabled={sendingNotif}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {sendingNotif ? "Mengirim..." : "Kirim Notifikasi"}
                  </button>
                  <button
                    onClick={() => setNotifMessage("")}
                    disabled={sendingNotif}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-60"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
