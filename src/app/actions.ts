"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Menambah pengeluaran baru
export async function createExpense(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string;
  const dateStr = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!amountStr || !category || !dateStr) {
    return { error: "Semua kolom wajib diisi kecuali catatan." };
  }

  const amount = parseInt(amountStr.replace(/\D/g, ""), 10);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Jumlah pengeluaran tidak valid." };
  }

  try {
    await db.expense.create({
      data: {
        userId: session.user.id,
        amount,
        category,
        date: new Date(dateStr),
        note: note || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true };
  } catch (err) {
    console.error("Gagal menyimpan transaksi:", err);
    return { error: "Terjadi kesalahan pada server saat menyimpan transaksi." };
  }
}

// Menghapus pengeluaran
export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const expense = await db.expense.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!expense) {
      return { error: "Data transaksi tidak ditemukan atau bukan milik Anda." };
    }

    await db.expense.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true };
  } catch (err) {
    console.error("Gagal menghapus transaksi:", err);
    return { error: "Gagal menghapus transaksi." };
  }
}

// Mengubah pengeluaran
export async function updateExpense(id: string, prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string;
  const dateStr = formData.get("date") as string;
  const note = formData.get("note") as string;

  if (!amountStr || !category || !dateStr) {
    return { error: "Semua kolom wajib diisi kecuali catatan." };
  }

  const amount = parseInt(amountStr.replace(/\D/g, ""), 10);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Jumlah pengeluaran tidak valid." };
  }

  try {
    const expense = await db.expense.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!expense) {
      return { error: "Data transaksi tidak ditemukan atau bukan milik Anda." };
    }

    await db.expense.update({
      where: { id },
      data: {
        amount,
        category,
        date: new Date(dateStr),
        note: note || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    return { success: true };
  } catch (err) {
    console.error("Gagal mengubah transaksi:", err);
    return { error: "Gagal mengupdate transaksi." };
  }
}
