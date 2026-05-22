import { useState, useMemo } from 'react';
import { 
  Receipt, 
  Calendar, 
  Clock, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Filter, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { SaleTransaction } from '../types';

interface HistoryViewProps {
  sales: SaleTransaction[];
  currentUserRole: 'admin' | 'pegawai';
  onVoidSale: (id: string) => void;
}

export function HistoryView({ sales, currentUserRole, onVoidSale }: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'voided'>('all');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(() => {
    return sales.length > 0 ? sales[0].id : null;
  });

  // Filter sales based on query and status filter
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const status = sale.status || 'completed';
      
      // Status filter
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesId = sale.id.toLowerCase().includes(query);
        const matchesNotes = sale.notes?.toLowerCase().includes(query) || false;
        const matchesItems = sale.items.some(item => 
          item.name.toLowerCase().includes(query)
        );
        return matchesId || matchesNotes || matchesItems;
      }

      return true;
    });
  }, [sales, searchQuery, statusFilter]);

  // Selected sale object
  const selectedSale = useMemo(() => {
    return sales.find(s => s.id === selectedSaleId) || null;
  }, [sales, selectedSaleId]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Void confirmation handler
  const handleConfirmVoid = (saleId: string) => {
    if (currentUserRole !== 'admin') {
      alert("Hanya Admin yang dapat membatalkan (void) nota transaksi.");
      return;
    }

    const firstConfirm = window.confirm(
      "Apakah Anda YAKIN ingin membatalkan (void) nota ini?\nTindakan ini akan mengembalikan stok bahan baku ke database."
    );

    if (firstConfirm) {
      const secondConfirm = window.confirm(
        "PERINGATAN AKHIR: Transaksi ini akan ditandai sebagai VOIDED dan nominalnya akan dikurangi dari laporan keuangan harian. Klik OK untuk melanjutkan."
      );
      if (secondConfirm) {
        onVoidSale(saleId);
      }
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* LEFT SIDE: Transaction History List */}
      <div className="flex-1 flex flex-col bg-white border border-[#967259]/15 rounded-xs p-5 select-none h-full min-h-[450px] md:min-h-0">
        
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-[#967259]/10">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#32170d] p-1.5 rounded-xs text-[#feb300]">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="font-serif font-extrabold text-[#32170d] text-base uppercase tracking-wider">
              Arsip Nota Penjualan
            </h2>
          </div>
          <span className="text-[10px] font-mono bg-[#F0EBE1] text-[#967259] px-2 py-0.5 rounded-xs font-bold">
            {filteredSales.length} Transaksi
          </span>
        </div>

        {/* Filter & Search Controls */}
        <div className="my-4 space-y-3">
          
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-stone-400" />
            </span>
            <input
              type="text"
              placeholder="Cari ID nota, nama menu, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-[#967259]/20 rounded-xs bg-[#FAF9F5] text-xs font-sans text-[#32170d] placeholder-stone-400 focus:outline-hidden focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300] transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-[#F0EBE1]/55 p-1 rounded-xs border border-[#967259]/10">
            {(['all', 'completed', 'voided'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 text-[10px] font-sans font-bold uppercase tracking-wider py-1.5 rounded-xs transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#32170d] text-[#feb300] shadow-xs'
                    : 'text-[#967259] hover:text-[#32170d]'
                }`}
              >
                {status === 'all' && 'Semua'}
                {status === 'completed' && 'Aktif'}
                {status === 'voided' && 'Voided'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Transaction List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[350px] md:max-h-[500px]">
          {filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-stone-400 border border-dashed border-[#967259]/15 rounded-xs">
              <FileText className="h-10 w-10 text-stone-300 stroke-[1.5px] mb-3 animate-pulse" />
              <p className="font-serif italic text-xs">Belum ada nota yang sesuai filter</p>
              <p className="text-[10px] font-sans text-stone-400 mt-1 uppercase tracking-wider">Coba ubah kata kunci pencarian</p>
            </div>
          ) : (
            filteredSales.map((sale) => {
              const status = sale.status || 'completed';
              const isSelected = sale.id === selectedSaleId;
              const dateObj = new Date(`${sale.date}T${sale.time}`);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSaleId(sale.id)}
                  className={`border p-3.5 rounded-xs transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#feb300] bg-[#FAF9F5] shadow-xs'
                      : 'border-[#967259]/10 hover:border-[#967259]/35 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[9px] text-[#967259] font-bold truncate tracking-tight">
                        {sale.id}
                      </span>
                      <span className={`text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider leading-none ${
                        status === 'voided'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/50 line-through decoration-rose-455'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                      }`}>
                        {status === 'voided' ? 'Voided' : 'Selesai'}
                      </span>
                    </div>

                    <div className="flex items-center text-[10px] font-sans text-stone-500 space-x-2.5">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-[#967259]/75" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-[#967259]/75" />
                        {sale.time} WIB
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-600 font-sans italic truncate">
                      {sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`font-serif font-bold text-xs ${
                      status === 'voided' ? 'text-stone-400 line-through' : 'text-[#32170d]'
                    }`}>
                      {formatCurrency(sale.totalAmount)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Selected Receipt Details */}
      <div className="w-full md:w-80 flex flex-col bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 select-none h-full justify-between">
        {selectedSale ? (
          <div className="flex flex-col h-full justify-between space-y-6">
            
            {/* Scrollable Receipt Body */}
            <div className="space-y-4">
              
              {/* Receipt Branding Header */}
              <div className="text-center pb-4 border-b border-[#967259]/10">
                <p className="font-serif font-black text-[#32170d] text-sm uppercase tracking-wider">
                  WARKOP EMI
                </p>
                <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mt-1">
                  Nota Pembayaran Resmi
                </p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider ${
                    selectedSale.status === 'voided'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {selectedSale.status === 'voided' ? 'TRANSAKSI BATAL (VOIDED)' : 'TRANSAKSI SELESAI'}
                  </span>
                </div>
              </div>

              {/* Transaction Metadata */}
              <div className="bg-white border border-[#967259]/10 p-3 rounded-xs font-mono text-[9px] text-stone-600 space-y-1">
                <div className="flex justify-between">
                  <span>ID NOTA:</span>
                  <span className="font-bold text-[#32170d]">{selectedSale.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>TANGGAL:</span>
                  <span>{selectedSale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>WAKTU:</span>
                  <span>{selectedSale.time} WIB</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-[10px] text-[#32170d] uppercase tracking-wider border-b border-[#967259]/10 pb-1">
                  Daftar Belanja
                </h3>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-sans font-bold text-[#32170d] leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-[9px] font-mono text-[#967259] mt-0.5">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-serif font-bold text-[#32170d] flex-shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashed Line */}
              <div className="border-t border-dashed border-[#967259]/25 py-1"></div>

              {/* Receipt Totals */}
              <div className="bg-white border border-[#967259]/10 p-3.5 rounded-xs space-y-2 select-none">
                <div className="flex justify-between text-xs text-stone-650 font-sans">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#32170d]">
                    {formatCurrency(selectedSale.totalAmount - (selectedSale.manualAmount || 0))}
                  </span>
                </div>
                {selectedSale.manualAmount > 0 && (
                  <div className="flex justify-between text-xs text-stone-650 font-sans">
                    <span>Input Manual:</span>
                    <span className="font-bold text-[#32170d]">
                      {formatCurrency(selectedSale.manualAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-[#967259]/10 pt-2 select-none font-serif font-black text-[#32170d]">
                  <span>Total Tagihan:</span>
                  <span className={selectedSale.status === 'voided' ? 'line-through text-stone-400' : 'text-[#32170d]'}>
                    {formatCurrency(selectedSale.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Transaction Notes */}
              {selectedSale.notes && (
                <div className="bg-[#F0EBE1]/40 border border-[#967259]/10 p-3 rounded-xs text-[10px] font-sans text-stone-600">
                  <span className="font-bold uppercase tracking-wider block text-[#32170d] mb-1">
                    Catatan Kasir:
                  </span>
                  <p className="italic">{selectedSale.notes}</p>
                </div>
              )}

            </div>

            {/* Action Buttons Section */}
            <div className="space-y-3 pt-4 border-t border-[#967259]/10">
              
              {selectedSale.status === 'voided' ? (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xs flex items-start space-x-2 select-none text-[10px] text-rose-800">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider">Nota Telah Dibatalkan</span>
                    <p className="mt-0.5 leading-normal">
                      Transaksi ini telah di-void. Stok bahan baku sudah dipulihkan dan nominal ini tidak lagi dihitung dalam omzet keuangan.
                    </p>
                  </div>
                </div>
              ) : currentUserRole === 'admin' ? (
                <button
                  onClick={() => handleConfirmVoid(selectedSale.id)}
                  className="w-full bg-red-650 hover:bg-red-750 text-white py-2.5 px-4 rounded-xs text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all active:scale-97 cursor-pointer border-0 shadow-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Void Nota (Batalkan)</span>
                </button>
              ) : (
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-xs flex items-start space-x-2 text-[10px] text-stone-500">
                  <UserCheck className="h-4 w-4 flex-shrink-0 text-stone-400 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider">Akses Terbatas</span>
                    <p className="mt-0.5 leading-normal">
                      Hanya user dengan role **Admin** yang memiliki wewenang untuk membatalkan (void) nota transaksi ini.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-stone-400 h-full">
            <Receipt className="h-12 w-12 text-stone-300 stroke-[1.2px] mb-4 animate-bounce" />
            <p className="font-serif italic text-xs">Pilih salah satu nota di daftar untuk melihat rincian belanja</p>
          </div>
        )}
      </div>

    </div>
  );
}
