import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ExpenseForm from "@/components/ExpenseForm";
import BottomNav from "@/components/BottomNav";
import { CATEGORIES } from "@/lib/categories";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Rentang Waktu Hari Ini
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Rentang Waktu Bulan Ini
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Fetch Pengeluaran
  const [todayExpenses, monthExpenses] = await Promise.all([
    db.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfToday, lte: endOfToday },
      },
    }),
    db.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  // Hitung Total
  const totalToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalMonth = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Grouping & Persentase Kategori Bulan Ini
  const categorySpendingMap: Record<string, number> = {};
  monthExpenses.forEach((exp) => {
    categorySpendingMap[exp.category] = (categorySpendingMap[exp.category] || 0) + exp.amount;
  });

  const categoryBreakdown = CATEGORIES.map((cat) => {
    const amount = categorySpendingMap[cat.id] || 0;
    const percentage = totalMonth > 0 ? Math.round((amount / totalMonth) * 100) : 0;
    return {
      ...cat,
      amount,
      percentage,
    };
  }).sort((a, b) => b.amount - a.amount); // Urutan pengeluaran terbesar di atas

  // Format ke Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col p-5 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-xs text-slate-400 font-mono tracking-widest uppercase">Dashboard</h2>
          <h1 className="text-xl font-bold text-white mt-0.5 truncate max-w-[240px]">
            Halo, {session.user.name || "T-Rex User"} 🦖
          </h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#121c16] border border-[#1b2d23] flex items-center justify-center shadow-inner">
          <span className="text-lg">💰</span>
        </div>
      </div>

      {/* Ringkasan Pengeluaran (Cards) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hari Ini */}
        <div className="bg-[#121c16]/50 border border-[#1b2d23] p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff7a00]/5 rounded-full blur-xl group-hover:bg-[#ff7a00]/10 transition-colors" />
          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Hari Ini</h3>
          <p className="text-lg font-extrabold text-[#ff7a00] mt-1.5 break-all">
            {formatRupiah(totalToday)}
          </p>
        </div>

        {/* Bulan Ini */}
        <div className="bg-[#121c16]/50 border border-[#1b2d23] p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ff88]/5 rounded-full blur-xl group-hover:bg-[#00ff88]/10 transition-colors" />
          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Bulan Ini</h3>
          <p className="text-lg font-extrabold text-[#00ff88] mt-1.5 break-all">
            {formatRupiah(totalMonth)}
          </p>
        </div>
      </div>

      {/* Visualisasi Kategori CSS Bar */}
      <div className="bg-[#121c16]/80 backdrop-blur-xl border border-[#1b2d23] p-5 rounded-3xl shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1b2d23] pb-2.5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>📊</span> Alokasi Kategori (Bulan Ini)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">CSS BARS</span>
        </div>

        {totalMonth === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center gap-1.5">
            <span className="text-2xl">🌴</span>
            <span>Belum ada transaksi di bulan ini.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {categoryBreakdown
              .filter((item) => item.amount > 0)
              .map((item) => (
                <div key={item.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{item.emoji}</span>
                      <span className="font-semibold text-slate-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">{formatRupiah(item.amount)}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 bg-[#090f0c] rounded-full overflow-hidden border border-[#1b2d23]">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Form Catat Pengeluaran */}
      <ExpenseForm />

      {/* Navigasi Bawah */}
      <BottomNav />
    </div>
  );
}
