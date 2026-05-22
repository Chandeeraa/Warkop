import React from 'react';
import { 
  Coffee, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ShoppingCart, 
  Receipt,
  UtensilsCrossed, 
  FlameKindling,
  ArrowUpRight
} from 'lucide-react';
import { SaleTransaction, ExpenseItem, InventoryItem, TabType } from '../types';

interface StatsViewProps {
  sales: SaleTransaction[];
  expenses: ExpenseItem[];
  inventory: InventoryItem[];
  onNavigate: (tab: TabType) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ sales, expenses, inventory, onNavigate }) => {
  // Get today's date in WITA timezone
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Makassar'
  }).format(new Date());

  // Filter to today only (excluding voided sales)
  const todaySales = sales.filter(s => s.date === todayStr && s.status !== 'voided');
  const todayExpenses = expenses.filter(e => e.date === todayStr);

  // Calculations (today only)
  const totalSales = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  // Inventory stats
  const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);
  const lowStockCount = lowStockItems.length;

  // Top selling items logic helper (today only)
  const itemSalesMap: { [name: string]: number } = {};
  todaySales.forEach(sale => {
    sale.items.forEach(item => {
      itemSalesMap[item.name] = (itemSalesMap[item.name] || 0) + item.quantity;
    });
  });

  const topSelling = Object.entries(itemSalesMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);

  const maxQty = topSelling.length > 0 ? Math.max(...topSelling.map(i => i.qty)) : 1;

  // Time-based greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return 'Selamat Pagi';
    if (hours < 15) return 'Selamat Siang';
    if (hours < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#32170d]">
      {/* Header section */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          DASHBOARD OVERVIEW
        </span>
        <h1 className="text-3xl font-normal font-serif text-[#32170d] mt-2 italic">
          {getGreeting()}, <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Barista!</span>
        </h1>
      </div>

      {/* Warning banner if low stock exists */}
      {lowStockCount > 0 && (
        <button 
          id="btn-alert-warning"
          onClick={() => onNavigate('stok')}
          className="w-full bg-red-50 text-red-900 border border-red-200/60 p-4 rounded-xs flex items-center justify-between text-left hover:bg-red-100/40 transition-colors focus:outline-none"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-xs">
              <AlertTriangle className="h-4.5 w-4.5 text-red-700" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#32170d] uppercase tracking-wider">
                {lowStockCount} Bahan Terlalu Rendah
              </p>
              <p className="text-[10px] text-red-700 font-medium uppercase tracking-[0.1em] mt-0.5">
                Restok Segera &rarr;
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-red-700" />
        </button>
      )}

      {/* Main Omzet Card in Editorial Theme */}
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-[#4b2c20] to-[#32170d] text-[#FAF9F5] p-6 rounded-xs border border-[#967259]/15 cursor-pointer hover:opacity-95 transition-all shadow-md"
        onClick={() => onNavigate('reports')}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#feb300]">
          Volume Omzet Hari Ini
        </span>
        <h2 className="text-3.5xl font-serif italic font-light text-white mt-2">
          Rp {totalSales.toLocaleString('id-ID')}
        </h2>
        
        <div className="flex items-center space-x-1.5 mt-4 text-[11px] font-mono tracking-wider text-[#feb300]">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{todaySales.length} TRANSAKSI HARI INI</span>
        </div>
      </div>

      {/* Grid Expenses & Net Profit */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expense Card */}
        <div 
          onClick={() => onNavigate('expenses')}
          className="bg-white border border-[#967259]/10 hover:border-[#967259]/20 p-5 rounded-xs text-left cursor-pointer hover:bg-stone-50 transition-all shadow-2xs"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#967259] block">Pengeluaran</span>
          <p className="text-xl font-serif font-bold text-[#32170d] mt-1.5">
            Rp {totalExpenses.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center space-x-1 mt-2 text-[10px] font-mono uppercase tracking-wider text-rose-700">
            <TrendingDown className="h-3 w-3" />
            <span>Belanja Bahan</span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white border border-[#967259]/10 hover:border-[#967259]/20 p-5 rounded-xs text-left cursor-pointer hover:bg-stone-50 transition-all shadow-2xs"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#967259] block">Laba Bersih</span>
          <p className="text-xl font-serif font-bold text-[#32170d] mt-1.5">
            Rp {netProfit.toLocaleString('id-ID')}
          </p>
          <div className={`flex items-center space-x-1 mt-2 text-[10px] font-mono uppercase tracking-wider ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {netProfit >= 0 ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
            <span>{netProfit >= 0 ? 'Laba Positif' : 'Merugi Hari Ini'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Title */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#967259] flex items-center space-x-1.5">
          <FlameKindling className="h-3.5 w-3.5 text-[#feb300]" />
          <span>Quick Actions</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Tambah Penjualan Button */}
          <button 
            id="btn-add-sale-shortcut"
            onClick={() => onNavigate('sales')}
            className="w-full bg-[#32170d] hover:bg-[#4b2c20] text-[#feb300] font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xs flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer border border-[#32170d] shadow-sm"
          >
            <ShoppingCart className="h-3 w-3 text-[#feb300]" />
            <span>Penjualan</span>
          </button>

          {/* Tambah Pengeluaran Button */}
          <button 
            id="btn-add-expense-shortcut"
            onClick={() => onNavigate('expenses')}
            className="w-full bg-white hover:bg-stone-50 text-[#32170d] border border-[#967259]/25 font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xs flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer"
          >
            <Receipt className="h-3 w-3 text-[#967259]" />
            <span>Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Top-Selling Items */}
      <div className="bg-white border border-[#967259]/10 p-5 rounded-xs shadow-2xs">
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#967259]/15">
          <h3 className="font-serif font-bold text-[#32170d] text-base italic">Volume Penjualan Teratas</h3>
          <button 
            onClick={() => onNavigate('reports')}
            className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#967259] hover:text-[#32170d] transition-colors"
          >
            ARCHIVE &rarr;
          </button>
        </div>

        {topSelling.length === 0 ? (
          <div className="text-center py-6">
            <Coffee className="h-6 w-6 text-stone-300 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-[#967259] uppercase tracking-widest">Belum ada penjualan hari ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topSelling.map((item, index) => {
              const percentage = Math.min((item.qty / maxQty) * 100, 100);
              return (
                <div key={item.name} className="flex items-center space-x-3 text-[#32170d]">
                  <div className="bg-[#F0EBE1] p-2 rounded-xs text-[#32170d] flex-shrink-0 border border-[#967259]/15">
                    {index === 0 ? (
                      <Coffee className="h-4 w-4 text-[#feb300]" />
                    ) : index === 1 ? (
                      <UtensilsCrossed className="h-4 w-4 text-[#967259]" />
                    ) : (
                      <Coffee className="h-4 w-4 text-stone-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-xs text-[#32170d] truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-stone-600">{item.qty} PORSI</p>
                    </div>
                    <div className="w-full bg-stone-200/50 rounded-xs h-1 overflow-hidden">
                      <div 
                        className="bg-[#32170d] h-full transition-all duration-550" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Banner Inspiration Card with Editorial overlay */}
      <div className="relative overflow-hidden rounded-xs h-36 bg-cover bg-center text-white p-6 flex flex-col justify-end shadow-xs"
        style={{
          backgroundImage: `linear-gradient(rgba(50, 23, 13, 0.45), rgba(50, 23, 13, 0.9)), url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop')`,
        }}
      >
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#feb300] mb-1">
          Inspirasi Manajemen — Vol. 04
        </span>
        <p className="text-sm font-serif italic leading-relaxed text-stone-100">
          &ldquo;Secangkir kopi, sejuta rasa, dan kedisiplinan pencatatan harian.&rdquo;
        </p>
      </div>
    </div>
  );
};

