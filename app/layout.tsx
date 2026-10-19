// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";
// import NavBar from "@/components/navbar";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// export const metadata: Metadata = {
//   title: "India Chem 2026 - IOCL Polymer Grades",
//   description: "India Chem 2026",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         <div
//           className="min-h-screen w-full bg-cover bg-center bg-fixed flex flex-col items-center "
//           style={{ backgroundImage: "url('/pic_bg.png')" }}
//         >
//           {/* NAVBAR */}
//           <NavBar />

//           {/* MAIN CONTENT CONTAINER */}
//           <main className="w-full mt-4 md:mt-2 flex-grow flex  justify-center">
//             <div className="container mx-auto px-3 py-2 md:px-6 md:py-2 rounded-xl  max-w-7xl relative z-10 ">
//               {children}
//             </div>
//           </main>

//           {/* Optional Footer Spacer */}
       

//           {/* TOASTER */}
//           <Toaster richColors position="top-center" />
//         </div>
//       </body>
//     </html>
//   );
// }


// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NavBar from "@/components/navbar";
import PageNavigation from "@/components/PageNavigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "India Chem 2026 - IOCL Polymer Grades",
  description: "India Chem 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div
          className="min-h-screen w-full bg-cover bg-center bg-fixed flex flex-col items-center"
          style={{ backgroundImage: "url('/pic_bg.png')" }}
        >
          {/* NAVBAR */}
          <NavBar />

          {/* MAIN CONTENT CONTAINER */}
          <main className="w-full mt-4 md:mt-2 flex-grow flex justify-center">
            <div className="container mx-auto px-3 py-2 md:px-6 md:py-2 rounded-xl max-w-7xl relative z-10">
              {/* BACK & HOME NAVIGATION BAR */}
              {/* <PageNavigation /> */}

              {children}
            </div>
          </main>

          {/* TOASTER */}
          <Toaster richColors position="top-center" />
        </div>
      </body>
    </html>
  );
}