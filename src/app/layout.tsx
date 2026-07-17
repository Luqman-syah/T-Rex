import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T-Rex — Tracker Expense Harian",
  description: "T-Rex adalah aplikasi asisten pelacak pengeluaran harian Anda yang cepat, aman, dan ramah mobile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="font-sans antialiased min-h-screen bg-[#090f0c] text-slate-100 selection:bg-[#ff7a00] selection:text-black">
        <div className="mx-auto max-w-md min-h-screen flex flex-col bg-[#090f0c] border-x border-[#1b2d23] relative pb-24 shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}

