// components/PageNavigation.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function PageNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  return (
    <div className="w-full flex items-center gap-1.5 mb-2.5 px-1 text-sm font-medium text-white/80">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <span className="text-white/30 text-xs">/</span>

      <Link
        href="/"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
    </div>
  );
}