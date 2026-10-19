"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

interface CardHeaderProps {
  title?: string;
}

export default function CardHeaderSelf({ title = "IOCL Polymers" }: CardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/10 hover:bg-orange-500 hover:text-white rounded-lg transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/10 hover:bg-orange-500 hover:text-white rounded-lg transition-all"
        >
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
      </div>

      {/* Page Title on the right */}
      <h2 className="text-sm font-medium text-white/60">{title}</h2>
    </div>
  );
}