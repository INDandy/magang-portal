"use client";
import ApplicationForm from "@/app/components/ApplicationForm";
import Link from "next/link";
import { useState } from "react";

export default function ApplyPage() {
  const [applicantId, setApplicantId] = useState<number | null>(null);

  const handleApplySuccess = (id: number) => {
    setApplicantId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-semibold flex items-center gap-2">
              ← Kembali
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-blue-900">Formulir Pendaftaran Magang</h1>
            <p className="text-gray-700 text-lg">Lengkapi formulir di bawah untuk mendaftar sebagai peserta magang</p>
          </div>
        </div>
        
        <ApplicationForm onApplySuccess={handleApplySuccess} />
      </div>
    </div>
  );
}
