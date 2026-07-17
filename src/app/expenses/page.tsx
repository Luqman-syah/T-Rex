import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ExpensesListClient from "@/components/ExpensesListClient";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const currentDate = new Date();
  const currentMonthStr =
    resolvedParams.month ||
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const [yearStr, monthStr] = currentMonthStr.split("-");
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;

  const startOfMonth = new Date(year, monthIndex, 1);
  const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  // Ambil transaksi untuk bulan terpilih
  const expenses = await db.expense.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Ambil semua transaksi user untuk mencari bulan-bulan yang unik (untuk filter)
  const allExpensesDates = await db.expense.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  // Buat daftar bulan unik (format YYYY-MM)
  const uniqueMonthsMap = new Map<string, string>();

  // Masukkan bulan saat ini sebagai default agar selalu ada pilihan
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  uniqueMonthsMap.set(
    currentMonthKey,
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(currentDate)
  );

  allExpensesDates.forEach((exp) => {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(d);
    uniqueMonthsMap.set(key, label);
  });

  const availableMonths = Array.from(uniqueMonthsMap.entries())
    .map(([value, label]) => ({
      value,
      label,
    }))
    .sort((a, b) => b.value.localeCompare(a.value)); // Urutkan dari bulan terbaru

  return (
    <div className="flex-1 flex flex-col p-5 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-2 border-b border-[#1b2d23] pb-3">
        <div>
          <h2 className="text-xs text-slate-400 font-mono tracking-widest uppercase">Riwayat</h2>
          <h1 className="text-xl font-bold text-white mt-0.5">Catatan Pengeluaran 🦖</h1>
        </div>
      </div>

      <ExpensesListClient
        initialExpenses={expenses.map((exp) => ({
          id: exp.id,
          userId: exp.userId,
          amount: exp.amount,
          category: exp.category,
          note: exp.note,
          date: exp.date.toISOString(),
          createdAt: exp.createdAt.toISOString(),
        }))}
        availableMonths={availableMonths}
        currentMonth={currentMonthStr}
      />

      <BottomNav />
    </div>
  );
}
