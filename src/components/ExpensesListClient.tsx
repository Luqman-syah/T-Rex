"use client";

import { useState, useTransition, useActionState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteExpense, updateExpense } from "@/app/actions";
import { CATEGORIES, getCategoryById } from "@/lib/categories";

interface ExpenseItem {
  id: string;
  userId: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  createdAt: string;
}

interface ExpensesListClientProps {
  initialExpenses: ExpenseItem[];
  availableMonths: { value: string; label: string }[];
  currentMonth: string;
}

export default function ExpensesListClient({
  initialExpenses,
  availableMonths,
  currentMonth,
}: ExpensesListClientProps) {
  const router = useRouter();
  const [, startDeleteTransition] = useTransition();
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Mengubah filter bulan via query param
  const handleMonthSelect = (monthVal: string) => {
    router.push(`/expenses?month=${monthVal}`);
  };

  // Hapus transaksi
  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini?")) {
      return;
    }

    startDeleteTransition(async () => {
      const res = await deleteExpense(id);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  // Group transaksi berdasarkan tanggal untuk UI yang lebih premium
  const groupExpensesByDate = (items: ExpenseItem[]) => {
    const groups: Record<string, { items: ExpenseItem[]; total: number }> = {};

    items.forEach((item) => {
      const dateObj = new Date(item.date);
      const dateStr = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateObj);

      if (!groups[dateStr]) {
        groups[dateStr] = { items: [], total: 0 };
      }
      groups[dateStr].items.push(item);
      groups[dateStr].total += item.amount;
    });

    return groups;
  };

  const grouped = groupExpensesByDate(initialExpenses);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Month Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {availableMonths.map((m) => {
          const isActive = m.value === currentMonth;
          return (
            <button
              key={m.value}
              onClick={() => handleMonthSelect(m.value)}
              className={`py-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#00ff88] text-black font-bold shadow-md shadow-[#00ff88]/20"
                  : "bg-[#121c16] border border-[#1b2d23] text-slate-400 hover:text-slate-200"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* List Transaksi */}
      <div className="flex-1 flex flex-col gap-5 pb-8">
        {initialExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-1.5 bg-[#121c16]/30 border border-[#1b2d23]/50 rounded-3xl">
            <span className="text-3xl">🦖</span>
            <span>Tidak ada pengeluaran tercatat di bulan ini.</span>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, group]) => (
            <div key={dateLabel} className="flex flex-col gap-2.5">
              {/* Tanggal Header & Subtotal */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-[#1b2d23] pb-1.5">
                <span>{dateLabel}</span>
                <span className="font-mono text-slate-300">Total: {formatRupiah(group.total)}</span>
              </div>

              {/* Items Card */}
              <div className="flex flex-col gap-2">
                {group.items.map((item) => {
                  const cat = getCategoryById(item.category);
                  return (
                    <div
                      key={item.id}
                      className="bg-[#121c16]/50 border border-[#1b2d23] p-3.5 rounded-2xl flex items-center justify-between group transition-all hover:bg-[#121c16]/80"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Emoji Circle */}
                        <div
                          className={`w-10 h-10 rounded-xl ${cat.color}/10 border border-${cat.color.split("-")[1]}-500/20 flex items-center justify-center text-lg shrink-0`}
                        >
                          {cat.emoji}
                        </div>

                        {/* Name & Note */}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{cat.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {item.note || "Tanpa catatan"}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Amount & Action Buttons */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-[#ff7a00] font-mono">
                          -{formatRupiah(item.amount)}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* Button Edit */}
                          <button
                            onClick={() => setEditingExpense(item)}
                            className="p-1.5 hover:bg-[#1b2d23] rounded-lg text-slate-400 hover:text-[#00ff88] transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 4.907a2.121 2.121 0 113 3L10.962 18.919a.9 2 0 01-.4.225l-4 1a.9.9 0 01-1.1-1.1l1-4a.9.9 0 01.225-.4L18.364 4.907z"
                              />
                            </svg>
                          </button>

                          {/* Button Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal Dialog */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

/* Sub-component: Edit Modal */
interface EditModalProps {
  expense: ExpenseItem;
  onClose: () => void;
}

function EditExpenseModal({ expense, onClose }: EditModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(expense.category);
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    // Set inisial amount format Rupiah
    const formatted = new Intl.NumberFormat("id-ID").format(expense.amount);
    setAmountInput(`Rp ${formatted}`);

    // Set inisial date (YYYY-MM-DD)
    const d = new Date(expense.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setDateInput(`${year}-${month}-${day}`);
  }, [expense]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setAmountInput("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(rawValue, 10));
    setAmountInput(`Rp ${formatted}`);
  };

  // Ikat server action updateExpense dengan bind ID
  const updateExpenseWithId = updateExpense.bind(null, expense.id);
  const [state, formAction, isPending] = useActionState(updateExpenseWithId, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amountInput) return;
    
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#121c16] border border-[#1b2d23] p-6 rounded-3xl shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#1b2d23] pb-2.5">
          <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
            <span>✏️</span> Edit Transaksi
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer font-bold"
          >
            Tutup
          </button>
        </div>

        {state?.error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-[10px] rounded-xl font-medium">
            ⚠️ {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Jumlah (IDR)
            </label>
            <input
              type="text"
              name="amount"
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="Rp 0"
              inputMode="numeric"
              required
              className="w-full bg-[#090f0c] border border-[#1b2d23] text-white text-base font-bold py-2.5 px-3.5 rounded-xl focus:border-[#00ff88] outline-none"
            />
          </div>

          {/* Input Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Kategori
            </label>
            <input type="hidden" name="category" value={selectedCategory} />
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? `${cat.color}/20 border-${cat.color.split("-")[1]}-500/80`
                        : "bg-[#090f0c] border-[#1b2d23] text-slate-400"
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-[8px] font-bold truncate max-w-full">
                      {cat.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Tanggal
              </label>
              <input
                type="date"
                name="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                required
                className="w-full bg-[#090f0c] border border-[#1b2d23] text-white text-xs py-2.5 px-2 rounded-xl outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Catatan
              </label>
              <input
                type="text"
                name="note"
                defaultValue={expense.note || ""}
                placeholder="Catatan kecil"
                className="w-full bg-[#090f0c] border border-[#1b2d23] text-white text-xs py-2.5 px-2 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#1b2d23] hover:bg-[#1b2d23] text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-[#2c6b44] hover:bg-[#388554] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
