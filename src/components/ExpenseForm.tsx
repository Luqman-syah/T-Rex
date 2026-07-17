"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { createExpense } from "@/app/actions";
import { CATEGORIES } from "@/lib/categories";

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  
  // Inisialisasi tanggal hari ini (Format: YYYY-MM-DD)
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setDateInput(`${year}-${month}-${day}`);
  }, []);

  // Format input angka menjadi Rupiah (Ribuan dengan titik)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setAmountInput("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(rawValue, 10));
    setAmountInput(`Rp ${formatted}`);
  };

  const [state, formAction, isPending] = useActionState(createExpense, null);

  useEffect(() => {
    if (state?.success) {
      setAmountInput("");
      setSelectedCategory(CATEGORIES[0].id);
      // Reset date to today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setDateInput(`${year}-${month}-${day}`);
      
      if (onSuccess) onSuccess();
    }
  }, [state, onSuccess]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amountInput) return;
    
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121c16]/80 backdrop-blur-xl border border-[#1b2d23] p-6 rounded-3xl shadow-xl flex flex-col gap-5"
    >
      <div className="flex items-center justify-between border-b border-[#1b2d23] pb-3">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span>📝</span> Catat Pengeluaran
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">BARU</span>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium animate-pulse">
          ⚠️ {state.error}
        </div>
      )}

      {/* Input: Jumlah Uang */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Jumlah (IDR)
        </label>
        <div className="relative">
          <input
            type="text"
            name="amount"
            value={amountInput}
            onChange={handleAmountChange}
            placeholder="Rp 0"
            inputMode="numeric"
            required
            className="w-full bg-[#090f0c] border border-[#1b2d23] text-white text-xl font-bold py-3.5 px-4 rounded-2xl focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all placeholder-slate-600"
          />
          {amountInput && (
            <button
              type="button"
              onClick={() => setAmountInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Input: Kategori (Grid UI Premium) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Kategori
        </label>
        <input type="hidden" name="category" value={selectedCategory} />
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border text-center transition-all cursor-pointer ${
                  isSelected
                    ? `${cat.color}/20 border-${cat.color.split("-")[1]}-500/80 shadow-md scale-102`
                    : "bg-[#090f0c] border-[#1b2d23] hover:border-slate-800 text-slate-400"
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className={`text-[10px] font-semibold truncate max-w-full ${
                  isSelected ? "text-white" : "text-slate-400"
                }`}>
                  {cat.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input: Tanggal & Keterangan */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tanggal
          </label>
          <input
            type="date"
            name="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            required
            className="w-full bg-[#090f0c] border border-[#1b2d23] text-white text-xs py-3 px-3 rounded-2xl focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Catatan
          </label>
          <input
            type="text"
            name="note"
            placeholder="Makan siang, bensin, dll"
            className="w-full bg-[#090f0c] border border-[#1b2d23] text-white text-xs py-3 px-3 rounded-2xl focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all placeholder-slate-600"
          />
        </div>
      </div>

      {/* Button Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-4 text-white text-sm font-bold rounded-2xl cursor-pointer shadow-lg transition-all duration-300 ${
          isPending
            ? "bg-[#2c6b44]/50 cursor-not-allowed"
            : "bg-[#2c6b44] hover:bg-[#388554] shadow-[#2c6b44]/20 hover:shadow-[#2c6b44]/40 active:scale-[0.99]"
        }`}
      >
        {isPending ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </div>
        ) : (
          "Simpan Transaksi 🦖"
        )}
      </button>
    </form>
  );
}
