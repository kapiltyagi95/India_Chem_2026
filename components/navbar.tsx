// components/NavBar.tsx

"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HomeIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
    
  return (
    <header className="w-full relative z-20 flex items-center justify-between min-h-[70px] md:h-32 px-2 md:px-4 py-2 md:py-4 bg-[#00164E]">

      {/* Left Logo - IOCL */}
      <div className="flex-shrink-0 z-10">
        <Link href="/">
          <img
            src="/ioc_logo.png"
            alt="Company Logo"
            className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Center Home and Back Buttons */}
      {!isHome && (
        <div className="absolute inset-0 flex justify-center items-center gap-2 md:gap-4 pointer-events-none">
          <Link href="/" className="pointer-events-auto">
            <Button
              className="bg-orange-500 hover:bg-orange-600 font-bold text-base md:text-2xl text-zinc-100 shadow-lg px-3 md:px-8 h-9 md:h-14 flex items-center justify-center rounded-xl"
            >
              <HomeIcon className="h-5 w-5 md:h-7 md:w-7" />
            </Button>
          </Link>

          <Button 
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 font-bold text-base md:text-2xl text-zinc-100 shadow-lg px-3 md:px-8 h-9 md:h-14 flex items-center justify-center rounded-xl pointer-events-auto"
          >
            <ArrowLeft className="h-5 w-5 md:h-7 md:w-7" />
          </Button>
        </div>
      )}

      {/* Right Logos - Grouped side-by-side with responsive spacing */}
      <div className="flex-shrink-0 z-10 flex items-center gap-1.5 sm:gap-3 md:gap-4">
        <img
          src="/cyclo_logo.jpg"
          alt="CycloPlast"
          className="h-9 sm:h-12 md:h-16 lg:h-20 w-auto object-contain rounded-md"
        />
        <img
          src="/propel_new.jpg"
          alt="Propel Image"
          className="h-9 sm:h-12 md:h-16 lg:h-20 w-auto object-contain rounded-md"
        />
      </div>

    </header>
  );
}