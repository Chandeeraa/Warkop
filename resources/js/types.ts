export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  is_best_seller?: boolean;
  recipe_inventory_id?: string | null;
  recipe_deduct_amount?: number | null;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SaleTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  items: SaleItem[];
  manualAmount: number;
  notes: string;
  totalAmount: number;
  status?: 'completed' | 'voided';
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'Bahan Baku' | 'Operasional' | 'Lainnya';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string; // kg, pcs, bks, etc.
  threshold: number; // point at which it is marked LOW STOCK
  image: string; // imageUrl
}

export type TabType = 'stats' | 'sales' | 'expenses' | 'reports' | 'stok' | 'produk' | 'profile' | 'history';

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'pegawai';
  photo?: string | null;
}

export interface Category {
  id: number;
  name: string;
}
