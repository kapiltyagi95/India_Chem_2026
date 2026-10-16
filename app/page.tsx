'use client'

import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const petchemGlanceUrl = "https://uypietfptdsuhgpgtfyz.supabase.co/storage/v1/object/public/India%20Chem%202026%20PDF/petchem-glance.pdf.pdf";
  const gradeSheetUrl = "https://uypietfptdsuhgpgtfyz.supabase.co/storage/v1/object/public/India%20Chem%202026%20PDF/gradesheet.pdf";

  // Reusable Button Component to handle both Mobile and Desktop placements easily
  const TapToBeginButton = () => (
    <div
      className="
        bg-gradient-to-b from-[#f36f21] to-[#ffd6be]
        hover:from-[#ff5a00] hover:to-[#ffb48a]
        flex justify-center items-center
        px-[24px] md:px-[32px]
        py-[16px] md:py-[24px]
        rounded-[20px]
        shadow-[0px_0px_24px_0px_rgba(0,0,0,0.14)]
        hover:shadow-[0px_0px_35px_0px_rgba(0,0,0,0.25)]
        shrink-0
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-100 cursor-pointer
      "
      data-name="Button"
    >
      <Link href="/form">
        <p className="font-bold leading-[24px] md:leading-[28px] text-[#002480] text-[22px] sm:text-[24px] md:text-[32px] whitespace-nowrap">
          Tap to Begin
        </p>
      </Link>
    </div>
  );

  return (
    <div className="w-full relative flex flex-col items-center justify-start px-2 py-6 md:py-8 min-h-screen overflow-x-hidden">

      {/* Heading - Scales down slightly on mobile for better fit */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-6 md:mb-8 text-center relative z-10 drop-shadow-lg px-2">
        Petrochemical Products Selector
      </h1>

      {/* Main Wrapper: Responsive Flex Container */}
      <div className="w-full lg:w-[98%] max-w-[1920px] flex flex-col lg:flex-row items-center justify-center gap-4 xl:gap-6 relative z-10">

        {/* --- CENTER: Video Container --- */}
        {/* On mobile, order-1 puts it at the top. On desktop, order-2 puts it in the middle */}
        <div className="order-1 lg:order-2 flex-1 w-full bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-2xl p-2 lg:p-3 border border-white border-opacity-20 flex items-center justify-center aspect-video overflow-hidden">
          <video
            src="/Touch_Kiosk_Intro.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-xl"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* --- MOBILE BUTTON --- */}
        {/* Appears directly under the video on vertical screens for easy tapping */}
        <div className="order-2 lg:hidden w-full flex justify-center mt-2 mb-4 z-10">
          <TapToBeginButton />
        </div>

        {/* --- QR CODES WRAPPER --- */}
        {/* Mobile: A flex row side-by-side at the bottom (order-3). Desktop: Spreads out automatically (lg:contents) */}
        <div className="order-3 lg:contents flex flex-row items-stretch justify-center gap-3 sm:gap-6 w-full px-2">
          
          {/* --- LEFT QR CODE: Petchem at a Glance --- */}
          <div className="lg:order-1 flex flex-col items-center bg-white bg-opacity-60 backdrop-blur-md p-3 xl:p-4 rounded-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)] border border-white w-1/2 max-w-[170px] lg:max-w-none lg:w-40 xl:w-48 text-center transition-transform duration-300 hover:scale-105 shrink-0">
            <h3 className="text-[#002480] font-bold text-[13px] sm:text-sm xl:text-md leading-tight mb-2 sm:mb-3 min-h-[36px] flex items-center justify-center">
              IndianOil Petchem <br /> at a Glance
            </h3>
            {/* Translucent QR Background applied here */}
            <div className="bg-white/40 backdrop-blur-sm p-1.5 sm:p-2 rounded-xl shadow-inner mb-2 w-full aspect-square flex items-center justify-center">
              <QRCodeSVG 
                value={petchemGlanceUrl} 
                size={200}
                className="w-full h-full object-contain" 
                level="H" 
                bgColor="transparent" /* Forces the QR to inherit the translucent background */
                fgColor="#002480" /* IOCL Blue to ensure high-contrast scanning */
              />
            </div>
            <p className="text-[11px] sm:text-xs xl:text-sm font-semibold text-[#f36f21]">Scan to Download</p>
          </div>

          {/* --- RIGHT QR CODE: GradeSheet --- */}
          <div className="lg:order-3 flex flex-col items-center bg-white bg-opacity-60 backdrop-blur-md p-3 xl:p-4 rounded-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)] border border-white w-1/2 max-w-[170px] lg:max-w-none lg:w-40 xl:w-48 text-center transition-transform duration-300 hover:scale-105 shrink-0">
            <h3 className="text-[#002480] font-bold text-[13px] sm:text-sm xl:text-md leading-tight mb-2 sm:mb-3 min-h-[36px] flex items-center justify-center">
              IndianOil <br /> GradeSheet
            </h3>
            {/* Translucent QR Background applied here */}
            <div className="bg-white/40 backdrop-blur-sm p-1.5 sm:p-2 rounded-xl shadow-inner mb-2 w-full aspect-square flex items-center justify-center">
               <QRCodeSVG 
                value={gradeSheetUrl} 
                size={200}
                className="w-full h-full object-contain" 
                level="H" 
                bgColor="transparent" 
                fgColor="#002480" 
              />
            </div>
            <p className="text-[11px] sm:text-xs xl:text-sm font-semibold text-[#f36f21]">Scan to Download</p>
          </div>

        </div>
      </div>

      {/* --- DESKTOP BUTTON --- */}
      {/* Hidden on mobile, appears below everything on horizontal screens */}
      <div className="hidden lg:flex mt-8 w-full justify-center z-10">
        <TapToBeginButton />
      </div>

    </div>
  );
}