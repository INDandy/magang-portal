"use client";
import { useState, useEffect } from "react";
import { ApplyForm } from "./applyForm";
import { StatusView } from "./statusView";

export default function DashboardPage() {
  const [tab, setTab] = useState<"apply" | "status">("apply");

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
        User Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          className={`px-6 py-2 rounded-lg font-semibold ${
            tab === "apply" ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow"
          }`}
          onClick={() => setTab("apply")}
        >
          Apply
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold ${
            tab === "status" ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow"
          }`}
          onClick={() => setTab("status")}
        >
          Status
        </button>
      </div>

      {/* Tab Content */}
      {tab === "apply" ? <ApplyForm /> : <StatusView />}
    </div>
  );
}
