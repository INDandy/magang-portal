"use client";
import { useState } from "react";

export default function StatusPage() {
  const [userId, setUserId] = useState("");
  const [notif, setNotif] = useState<any[]>([]);

  async function checkNotif() {
    const res = await fetch(`/api/notifications?userId=${userId}`);
    const data = await res.json();
    setNotif(data);
  }

  return (
    <div className="p-6 max-w-xl mx-auto mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Status Pendaftaran</h1>

      <input
        type="number"
        className="border w-full p-2 rounded"
        placeholder="Masukkan ID pendaftaran"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button
        onClick={checkNotif}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        Cek Status
      </button>

      <div className="mt-6 space-y-2">
        {notif.map((n) => (
          <p key={n.id} className="p-3 bg-gray-100 border rounded">
            {n.message}
          </p>
        ))}
      </div>
    </div>
  );
}
