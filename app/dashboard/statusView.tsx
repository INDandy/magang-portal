"use client";
import { useState } from "react";

export function StatusView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch("/api/notifications"); // API harus filter user session
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Status Pendaftaran</h2>
      <button
        onClick={fetchNotifications}
        className="mb-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
      >
        {loading ? "Memuat..." : "Cek Status"}
      </button>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-600">Belum ada notifikasi</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="border p-3 rounded-lg bg-gray-100">
              {n.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
