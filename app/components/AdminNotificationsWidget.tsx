"use client";
import { useState, useEffect } from "react";

interface AdminNotification {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function AdminNotificationsWidget() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchPendingApplicants() {
    try {
      setLoading(true);
      const res = await fetch("/api/apply");
      const data = await res.json();
      // Show only pending applicants as notifications
      const pending = data.filter((a: any) => a.status === "PENDING");
      setNotifications(pending.slice(0, 10));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingApplicants();
    // Poll for new applications every 10 seconds
    const interval = setInterval(fetchPendingApplicants, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <span className="text-2xl">🔔</span>
        {pendingCount > 0 && (
          <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-30 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="font-bold text-gray-800">📋 Aplikasi Baru Pending</h3>
            <p className="text-sm text-gray-600">{pendingCount} aplikasi menunggu review</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-600 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p className="text-lg mb-2">✅</p>
                <p className="text-sm">Semua aplikasi sudah direview</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 sm:p-4 hover:bg-orange-50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm">{notif.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">{notif.email}</p>
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
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                        {notif.status}
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
