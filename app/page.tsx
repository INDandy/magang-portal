"use client";
import { useState, useEffect } from "react";
import ApplicationForm from "./components/ApplicationForm";
import NotificationsWidget from "./components/NotificationsWidget";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<"login" | "register-user" | "register-admin">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [popup, setPopup] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [applicantId, setApplicantId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedApplicantId = localStorage.getItem("applicantId");
        let user: any = null;
        if (storedUser) {
          user = JSON.parse(storedUser);
          setIsLoggedIn(true);
          setUserName(user.name);
          setUserRole(user.role);
        }

        if (storedApplicantId) {
          setApplicantId(parseInt(storedApplicantId, 10));
        } else if (user && user.role === "USER") {
          try {
            const res = await fetch("/api/apply");
            if (res.ok) {
              const applicants = await res.json();
              const found = applicants.find((a: any) => {
                if (a.user && a.user.id && user.id) return a.user.id === user.id;
                return a.email === user.email;
              });
              if (found && found.id) {
                localStorage.setItem("applicantId", String(found.id));
                setApplicantId(found.id);
              }
            }
          } catch (err) {
            console.error("Error fetching applicant for user:", err);
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  async function handleSubmit() {
    let url = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: mode === "register-admin" ? "ADMIN" : "USER",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      const userData = data.user
        ? data.user
        : { name: form.name, email: form.email, role: mode === "register-admin" ? "ADMIN" : "USER" };

      localStorage.setItem("user", JSON.stringify(userData));

      setIsLoggedIn(true);
      setUserName(userData.name);
      setUserRole(userData.role);
      setShowLogin(false);
      setForm({ name: "", email: "", password: "" });

      // Show success popup
      setPopup("LOGIN_SUCCESS");

      // Redirect based on role after animation
      setTimeout(() => {
        window.location.href = userData.role === "ADMIN" ? "/admin" : "/";
      }, 2000);
    } else {
      setPopup(data.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("applicantId");
    setIsLoggedIn(false);
    setUserName(null);
    setUserRole(null);
    setApplicantId(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeScaleIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeScaleOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }

        .animate-slide-down { animation: slideInDown 0.8s ease-out; }
        .animate-slide-up { animation: slideInUp 0.8s ease-out; }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        .animate-pulse-custom { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade-scale-in {
          animation: fadeScaleIn 0.4s ease-out forwards;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .animate-fade-scale-out {
          animation: fadeScaleOut 0.3s ease-in forwards;
        }
        .popup-success {
          border-top: 4px solid #16a34a;
          box-shadow: 0 10px 30px rgba(22, 163, 74, 0.3);
        }
        .popup-error {
          border-top: 4px solid #dc2626;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.3);
        }
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

    {/* Desktop Menu */}
    <div className="hidden md:flex items-center gap-4">
      {isLoggedIn && userName ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-full flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-600">Welcome</p>
              <p className="font-bold text-blue-900">{userName}</p>
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
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      )}
    </div>

    {/* Mobile Hamburger */}
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
        {isLoggedIn && userName ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-800 rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-600">Welcome</p>
                <p className="font-bold text-blue-900">{userName}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        )}
      </div>
    )}
  </nav>

    <div className="w-full px-6 mt-2 flex justify-end" >
       {userRole === "USER" && applicantId ? (
              <NotificationsWidget applicantId={applicantId} />
            ) : null}
    </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent opacity-50 blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-down space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-blue-900 leading-tight">
                Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Magang</span> Radar Cirebon
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Bergabunglah dengan program magang kami dan kembangkan karir Anda bersama tim profesional. Proses pendaftaran yang mudah dan transparan.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform"
                >
                  Daftar Sekarang
                </button>
                <button
                  onClick={() => document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>

            <div className="animate-slide-up relative h-80 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-4 transform hover:scale-105 transition duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">✓</div>
                  <p className="text-gray-800 font-semibold">Pendaftaran Mudah</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">✓</div>
                  <p className="text-gray-800 font-semibold">Tracking Status Real-time</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">✓</div>
                  <p className="text-gray-800 font-semibold">Upload Dokumen PDF</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">✓</div>
                  <p className="text-gray-800 font-semibold">Pemberitahuan Otomatis</p>
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
            Mengapa Bergabung Dengan Kami?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Program Terarah", desc: "Program magang yang terstruktur dengan mentoring dari profesional berpengalaman" },
              { icon: "💼", title: "Pengalaman Kerja", desc: "Dapatkan pengalaman kerja nyata di industri media dan telekomunikasi terkemuka" },
              { icon: "🚀", title: "Berkembang Bersama", desc: "Kesempatan untuk berkembang dan membangun jaringan profesional di industri" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300 animate-fade-in">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="form-section" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {isLoggedIn && userRole === "USER" ? (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl animate-slide-down">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {userRole === "USER" && applicantId ? (
                      <div className="p-1 rounded bg-white/10">
                        <NotificationsWidget applicantId={applicantId} />
                      </div>
                    ) : (
                      <div className="p-1 rounded bg-white/10">
                        <span className="text-3xl">🔔</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold mb-2">Selamat Datang, {userName}! 👋</h2>
                    <p className="text-lg text-blue-100">Silakan lengkapi formulir di bawah untuk mendaftar sebagai peserta magang</p>
                  </div>
                </div>
              </div>
              <ApplicationForm onApplySuccess={setApplicantId} />
            </div>
          ) : isLoggedIn && userRole === "ADMIN" ? (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-12 text-center animate-slide-up">
              <div className="mb-6">
                <div className="text-6xl mb-4">👨‍💼</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-3">Anda Login Sebagai Admin</h3>
                <p className="text-gray-700 mb-6">
                  Sebagai admin, Anda dapat mengelola aplikasi di halaman admin dashboard. Silakan akses dashboard untuk meninjau dan mengelola aplikasi peserta magang.
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/admin"}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform inline-block"
              >
                Ke Admin Dashboard →
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-4xl font-bold text-center text-blue-900 mb-4 animate-slide-down">
                Formulir Pendaftaran Magang
              </h2>
              <p className="text-center text-gray-700 mb-8 text-lg">
                Isi formulir di bawah untuk mendaftar sebagai peserta magang
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-12 text-center animate-slide-up">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">Silakan Login Terlebih Dahulu</h3>
                  <p className="text-gray-700 mb-6">
                    Anda perlu login atau mendaftar akun sebagai peserta untuk mengisi formulir pendaftaran magang.
                  </p>
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform inline-block"
                >
                  Login / Daftar Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Magang Portal</h4>
              <p className="text-blue-200">Platform pendaftaran magang Radar Cirebon yang mudah dan transparan.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Kontak</h4>
              <p className="text-blue-200">Email: radarcireboncom@gmail.com</p>
              <p className="text-blue-200">Phone: (0231) 483531/483533</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Jam Kerja</h4>
              <p className="text-blue-200">Senin - Jumat: 08:00 - 16:00</p>
              <p className="text-blue-200">Sabtu: 08.00 - 14.00</p>
              <p className="text-blue-200">Minggu: Tutup</p>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-blue-200">
            <p>&copy; 2024 Portal Magang Radar Cirebon. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-2xl transition"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
              {mode === "login" ? "Login" : mode === "register-user" ? "Daftar sebagai Peserta" : "Daftar sebagai Admin"}
            </h2>

            {mode !== "login" && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 font-semibold mb-3">Pilih Tipe Akun:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("register-user")}
                    className={`py-2 px-3 rounded-lg font-semibold transition ${
                      mode === "register-user" ? "bg-blue-600 text-white shadow-lg" : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500"
                    }`}
                  >
                    👤 Peserta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("register-admin")}
                    className={`py-2 px-3 rounded-lg font-semibold transition ${
                      mode === "register-admin" ? "bg-red-600 text-white shadow-lg" : "bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500"
                    }`}
                  >
                    🔑 Admin
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {(mode === "register-user" || mode === "register-admin") && (
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    }
                  }}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full border border-gray-300 p-3 rounded-lg text-black focus:outline-none focus:border-blue-500 transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                {mode === "login" ? "Login" : "Daftar"}
              </button>
            </div>

            <p className="mt-6 text-center text-gray-600 text-sm">
              {mode === "login" ? (
                <>
                  Belum punya akun?{" "}
                  <button className="text-blue-600 font-bold hover:underline" onClick={() => setMode("register-user")}>
                    Daftar
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <button className="text-blue-600 font-bold hover:underline" onClick={() => setMode("login")}>
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {popup && popup !== "LOGIN_SUCCESS" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-slide-up popup-error">
            <div className="mb-4">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Pendaftaran Gagal</h3>
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-6">{popup}</p>
            <div className="space-y-3">
              <button
                className="w-full bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-semibold"
                onClick={() => setPopup(null)}
              >
                Coba Lagi
              </button>
              <button
                className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition font-semibold"
                onClick={() => {
                  setPopup(null);
                  setMode("login");
                }}
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {popup === "LOGIN_SUCCESS" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center animate-fade-scale-in popup-success">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse-custom">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-green-600 mb-3">Login Berhasil!</h3>
            </div>
            <p className="text-gray-700 text-lg mb-6">
              Selamat datang kembali, <span className="font-bold text-blue-600">{userName}</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <span className="ml-2 text-sm">Mengalihkan...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}