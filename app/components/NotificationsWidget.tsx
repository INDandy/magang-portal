"use client";
import { useState, useEffect, useRef } from "react";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  applicantId: number;
}

export default function NotificationsWidget({ applicantId }: { applicantId?: number | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevCountRef = useRef<number>(0);
  const initialLoadRef = useRef<boolean>(true);

  async function fetchNotifications() {
    try {
      setLoading(true);
      // allow the component to work if applicantId wasn't passed as prop
      const id =
        typeof applicantId === "number"
          ? applicantId
          : typeof window !== "undefined"
          ? parseInt(localStorage.getItem("applicantId") || "0", 10)
          : 0;

      if (!id || isNaN(id)) {
        // nothing to fetch yet
        setNotifications([]);
        prevCountRef.current = 0;
        initialLoadRef.current = false;
        return;
      }

      const res = await fetch(`/api/notifications?applicantId=${encodeURIComponent(String(id))}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // Auto-open logic: if this is not the initial load and there are more
      // notifications than before, open the dropdown to draw user's attention.
      if (!initialLoadRef.current && list.length > prevCountRef.current) {
        setShowNotifications(true);
      }

      setNotifications(list);
      prevCountRef.current = list.length;
      initialLoadRef.current = false;
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [applicantId]);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="font-bold text-gray-800">📬 Notifikasi Aplikasi</h3>
            <p className="text-sm text-gray-600">{unreadCount} notifikasi terbaru</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-600">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="text-lg mb-2">📭</p>
                <p>Tidak ada notifikasi untuk aplikasi Anda</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-blue-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm mb-1">
                          {notif.message.includes("diterima")
                            ? "✅ Aplikasi Diterima"
                            : notif.message.includes("ditolak")
                            ? "❌ Aplikasi Ditolak"
                            : "📝 Pembaruan Aplikasi"}
                        </p>
                        <p className="text-sm text-gray-700 break-all">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          📅 {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${notif.message.includes("diterima") ? 'bg-green-100 text-green-800' : notif.message.includes('ditolak') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {notif.message.includes("diterima")
                          ? 'DITERIMA'
                          : notif.message.includes("ditolak")
                          ? 'DITOLAK'
                          : 'INFO'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
