"use client";
import { useEffect, useState } from "react";
import NotificationsWidget from "@/app/components/NotificationsWidget";

export default function UserPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [applicantId, setApplicantId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedApplicantId = localStorage.getItem("applicantId");

      if (storedUser) {
        const u = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserName(u.name);
        setUserRole(u.role);
      }

      if (storedApplicantId) setApplicantId(parseInt(storedApplicantId, 10));
    } catch (err) {
      // ignore
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("applicantId");
    setIsLoggedIn(false);
    setUserName(null);
    setUserRole(null);
    setApplicantId(null);
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideInDown 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slideInUp 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
      `}</style>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 shadow-sm bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            MC
          </div>
          <h3 className="font-bold text-blue-900 text-lg">Magang Portal</h3>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && userName ? (
            <div className="flex items-center gap-4">
              {userRole === "USER" && applicantId ? (
                <NotificationsWidget applicantId={applicantId} />
              ) : (
                <div className="p-1 rounded bg-white/10">
                  <span className="text-3xl">🔔</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-full flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Welcome</p>
                  <p className="font-bold text-blue-900">Hello, {userName}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent opacity-50 blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-down space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-blue-900 leading-tight">
                Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">{userName}!</span>
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Anda sudah terdaftar di Portal Magang Radar Cirebon. Pantau status aplikasi Anda dan ikuti perkembangan pendaftaran magang dengan fitur notifikasi real-time kami.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = "/"}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform"
                >
                  Kembali ke Halaman Utama
                </button>
              </div>
            </div>

            {/* Right Visual - Notifications Card */}
            <div className="animate-slide-up relative h-80 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-4 transform hover:scale-105 transition duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                    📝
                  </div>
                  <p className="text-gray-800 font-semibold">Pantau Aplikasi Anda</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
                    🔔
                  </div>
                  <p className="text-gray-800 font-semibold">Notifikasi Real-time</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                    📊
                  </div>
                  <p className="text-gray-800 font-semibold">Status Terkini</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                    ⚡
                  </div>
                  <p className="text-gray-800 font-semibold">Update Instan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-12 animate-fade-in">
            Fitur Aplikasi Anda
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📱",
                title: "Tracking Status",
                desc: "Pantau status aplikasi magang Anda secara real-time dari dashboard pengguna",
              },
              {
                icon: "🔔",
                title: "Notifikasi Otomatis",
                desc: "Dapatkan pemberitahuan instan ketika ada update terkait aplikasi Anda",
              },
              {
                icon: "📄",
                title: "Arsip Aplikasi",
                desc: "Lihat riwayat dan detail lengkap dari semua aplikasi magang Anda",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300 animate-fade-in"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl animate-slide-down">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {userRole === "USER" && applicantId ? (
                  <div className="p-2 rounded bg-white/10">
                    <NotificationsWidget applicantId={applicantId} />
                  </div>
                ) : (
                  <div className="p-2 rounded bg-white/10">
                    <span className="text-4xl">🔔</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">Notifikasi Aplikasi Anda</h2>
                <p className="text-lg text-blue-100 mb-4">
                  {userRole === "USER" && applicantId
                    ? "Berikut adalah notifikasi terkini tentang status aplikasi magang Anda. Periksa secara berkala untuk update terbaru."
                    : "Anda belum memiliki aplikasi magang. Silakan lengkapi formulir aplikasi untuk melihat notifikasi."}
                </p>
              </div>
            </div>
          </div>

          {/* Notifications Detail */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
            {userRole === "USER" && applicantId ? (
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Riwayat Notifikasi</h3>
                <NotificationsWidget applicantId={applicantId} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-3">Tidak Ada Aplikasi Terdaftar</h3>
                <p className="text-gray-700 mb-6">
                  Anda belum memiliki aplikasi magang yang terdaftar. Silakan lengkapi formulir aplikasi untuk memulai proses pendaftaran.
                </p>
                <button
                  onClick={() => window.location.href = "/"}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform inline-block"
                >
                  Isi Formulir Aplikasi →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Magang Portal</h4>
              <p className="text-blue-200">Platform pendaftaran magang Radar Cirebon yang mudah dan transparan.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Kontak</h4>
              <p className="text-blue-200">Email: magang@radarcirebon.com</p>
              <p className="text-blue-200">Phone: +62-XXX-XXXX-XXXX</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Jam Kerja</h4>
              <p className="text-blue-200">Senin - Jumat: 08:00 - 17:00</p>
              <p className="text-blue-200">Sabtu - Minggu: Tutup</p>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-blue-200">
            <p>&copy; 2024 Portal Magang Radar Cirebon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
