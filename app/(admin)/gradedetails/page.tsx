'use client'

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="relative flex flex-col items-center justify-center  p-4"> {/* Added items-center, min-h-screen, and p-4 for overall centering and responsiveness */}

      {/* Heading */}
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 text-center"> {/* Ensured text is centered and added responsive margin */}
        Grade Details
      </h1>

      {/* Blurred glass effect container */}
      <div className="w-full max-w-6xl bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-2xl relative z-10 p-4 md:p-8 lg:p-12 border border-white border-opacity-20 flex items-center justify-center min-h-[200px] h-[50vh]"> {/* Made flex, added min-h, dynamic height (40vh), and responsive padding */}
        {/* Example content inside the glass effect, which will now be centered */}
        <p className="text-white text-lg md:text-xl text-center">
          Click the button below to start exploring our products.
        </p>
      </div>

      {/* Button container */}
      <div className="mt-8 md:mt-12 flex justify-center"> {/* Centered the button container with flex and responsive margin-top */}
        <div className="bg-gradient-to-b from-[#f36f21] to-[#ffd6be] h-[70px] md:h-[96px] items-center justify-center px-[24px] md:px-[32px] py-[16px] md:py-[24px] relative rounded-[20px] shadow-[0px_0px_24px_0px_rgba(0,0,0,0.14)] flex shrink-0" data-name="Button"> {/* Made button responsive in height and padding */}
          <Link href="/form">
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-[24px] md:leading-[28px] not-italic relative text-[#002480] text-[24px] md:text-[32px]"> {/* Made button text responsive in size and line-height */}
              Tap to Begin
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}