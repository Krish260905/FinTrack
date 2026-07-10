import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "FinTrack - Premium Financial Management",
  description: "Track your finances with elegance and precision.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased bg-slate-900 text-slate-50 flex flex-col`}>
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px]"></div>
        </div>
        
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
