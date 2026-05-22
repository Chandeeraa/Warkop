import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Coins, 
  Download, 
  Share2, 
  Coffee, 
  Utensils, 
  IceCream,
  CheckCircle2,
  X
} from 'lucide-react';
import { SaleTransaction, ExpenseItem } from '../types';
import { jsPDF } from 'jspdf';

interface ReportsViewProps {
  sales: SaleTransaction[];
  expenses: ExpenseItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sales, expenses }) => {
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Date picker helper formatting in WITA (GMT+8)
  const getDateLabel = (offset: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + offset);
    
    return baseDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Makassar'
    });
  };

  const getISODateString = (offset: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + offset);
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Makassar'
    }).format(baseDate);
  };

  const currentISODate = getISODateString(selectedDateOffset);

  // Filter today's sales and expenses (excluding voided sales)
  let daySales = sales.filter(s => s.date === currentISODate && s.status !== 'voided');
  let dayExpenses = expenses.filter(e => e.date === currentISODate);

  // Calculate stats based on selected day lists
  const currentSalesTotal = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const currentExpensesTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentNetProfit = currentSalesTotal - currentExpensesTotal;

  // Real breakdown from sale items
  const itemRevenueMap: { [name: string]: number } = {};
  daySales.forEach(sale => {
    sale.items.forEach(item => {
      itemRevenueMap[item.name] = (itemRevenueMap[item.name] || 0) + (item.price * item.quantity);
    });
    // Include manual amount if present
    if (sale.manualAmount > 0) {
      itemRevenueMap['Penjualan Manual'] = (itemRevenueMap['Penjualan Manual'] || 0) + sale.manualAmount;
    }
  });

  const topRevenueItems = Object.entries(itemRevenueMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  // Actions
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top colored bar (Coffee Brown #32170d)
      doc.setFillColor(50, 23, 13);
      doc.rect(0, 0, 210, 8, 'F');

      // WARKOP EMI title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(50, 23, 13);
      doc.text('WARKOP EMI', 20, 25);

      // Subtitle
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(150, 114, 89);
      doc.text('Sistem Kasir Traditional-Modern POS', 20, 31);

      // Right side header info
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(50, 23, 13);
      doc.text('LAPORAN HARIAN', 190, 25, { align: 'right' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 114, 89);
      doc.text(getDateLabel(selectedDateOffset), 190, 31, { align: 'right' });

      // Separator line
      doc.setDrawColor(150, 114, 89);
      doc.setLineWidth(0.25);
      doc.line(20, 36, 190, 36);

      // Financial Summary Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(50, 23, 13);
      doc.text('RINGKASAN KEUANGAN', 20, 47);

      // Box Container for Summary
      doc.setFillColor(250, 249, 245);
      doc.setDrawColor(150, 114, 89);
      doc.rect(20, 52, 170, 28, 'FD');

      // Row 1: Total Omzet
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 23, 13);
      doc.text('Total Omzet (Pendapatan Kasir)', 26, 61);
      doc.setFont('Helvetica', 'bold');
      doc.text(`Rp ${currentSalesTotal.toLocaleString('id-ID')}`, 184, 61, { align: 'right' });

      // Divider inside box
      doc.setDrawColor(150, 114, 89);
      doc.line(26, 67, 184, 67);

      // Row 2: Laba Bersih
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(50, 23, 13);
      doc.text('Laba Bersih Hari Ini', 26, 74);

      // Net profit badge box
      doc.setFillColor(50, 23, 13);
      doc.rect(130, 68, 54, 8, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(254, 179, 0); // Gold Accent #feb300
      doc.text(`Rp ${currentNetProfit.toLocaleString('id-ID')}`, 157, 73.5, { align: 'center' });

      // Top selling items section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(50, 23, 13);
      doc.text('DETAIL PENJUALAN MENU UTAMA', 20, 104);

      // Table Header Row
      doc.setFillColor(50, 23, 13);
      doc.rect(20, 109, 170, 8, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('No.', 24, 114.5);
      doc.text('Nama Menu Jualan', 40, 114.5);
      doc.text('Pendapatan Omzet', 120, 114.5);
      doc.text('Kontribusi (%)', 160, 114.5);

      let currentY = 117;
      if (topRevenueItems.length === 0) {
        doc.setDrawColor(150, 114, 89);
        doc.line(20, 117, 190, 117);
        doc.line(20, 127, 190, 127);
        doc.line(20, 117, 20, 127);
        doc.line(190, 117, 190, 127);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 114, 89);
        doc.text('Tidak ada transaksi pada tanggal ini.', 105, 123, { align: 'center' });
        currentY = 127;
      } else {
        topRevenueItems.forEach((item, index) => {
          const percentage = currentSalesTotal > 0 ? Math.round((item.revenue / currentSalesTotal) * 100) : 0;
          const rowY = currentY + 10;
          
          doc.setDrawColor(150, 114, 89);
          // Bottom border for the row
          doc.line(20, rowY, 190, rowY);
          // Vertical borders
          doc.line(20, currentY, 20, rowY);
          doc.line(190, currentY, 190, rowY);

          // Content
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(50, 23, 13);
          doc.text(`${index + 1}`, 25, currentY + 6.5);
          doc.setFont('Helvetica', 'bold');
          doc.text(item.name, 40, currentY + 6.5);
          doc.setFont('Helvetica', 'normal');
          doc.text(`Rp ${item.revenue.toLocaleString('id-ID')}`, 120, currentY + 6.5);
          doc.text(`${percentage}%`, 160, currentY + 6.5);

          currentY = rowY;
        });
      }

      // Get current user name from localStorage
      let currentUserName = 'Petugas Warkop';
      try {
        const cachedUser = localStorage.getItem('warkop_user');
        if (cachedUser) {
          const userObj = JSON.parse(cachedUser);
          if (userObj && userObj.name) {
            currentUserName = userObj.name;
          }
        }
      } catch (e) {
        console.error(e);
      }

      // Signature section
      const signY = currentY + 25;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 23, 13);
      doc.text('Tertanda,', 140, signY);

      // Signature line placeholder or space
      doc.setDrawColor(150, 114, 89);
      doc.line(140, signY + 18, 185, signY + 18);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(currentUserName, 140, signY + 23);

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 114, 89);
      doc.text('Petugas Warkop Emi POS', 140, signY + 27);

      // Footer
      doc.setDrawColor(150, 114, 89);
      doc.line(20, 270, 190, 270);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 114, 89);
      doc.text('Laporan ini sah dibuat secara otomatis oleh sistem POS Warkop Emi.', 105, 276, { align: 'center' });
      doc.text('Halaman 1 dari 1', 105, 281, { align: 'center' });

      // Trigger download
      const filename = `Laporan_Harian_Warkop_Emi_${currentISODate}.pdf`;
      doc.save(filename);

      setToastMessage('Laporan Keuangan PDF berhasil diunduh!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err) {
      console.error('Gagal membuat PDF:', err);
      setToastMessage('Gagal membuat laporan PDF!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
  };


  const handleShareWhatsApp = () => {
    const text = `*LAPORAN HARIAN WARKOP EMI*\n*Tanggal:* ${getDateLabel(selectedDateOffset)}\n\n*Omzet:* Rp ${currentSalesTotal.toLocaleString('id-ID')}\n*Laba Bersih:* *Rp ${currentNetProfit.toLocaleString('id-ID')}*\n\nData tercatat otomatis di POS Warkop Emi.`;
    const encodedText = encodeURIComponent(text);
    
    setToastMessage('Membuka WhatsApp untuk membagikan laporan...');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#32170d]">
      {/* Header section */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          DOKUMEN HARIAN
        </span>
        <h1 className="text-3xl font-normal font-serif text-[#32170d] mt-2 italic">
          Laporan <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Harian</span>
        </h1>
      </div>

      {/* Success alert message */}
      {showToast && (
        <div className="bg-[#32170d] border border-[#feb300] text-[#FAF9F5] p-4 rounded-xs flex items-center space-x-3 shadow-md animate-slide-up z-50">
          <CheckCircle2 className="h-5 w-5 text-[#feb300] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider text-[#feb300]">Status Laporan</p>
            <p className="text-xs text-[#FAF9F5]/80 mt-1">{toastMessage}</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-stone-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Date selector with fine Cozy Cafe edges */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#967259] uppercase tracking-widest">Pilih Tanggal Laporan</span>
        
        <div className="flex items-center justify-between bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-1.5">
          <button 
            id="btn-prev-date-report"
            onClick={() => setSelectedDateOffset(prev => prev - 1)}
            className="p-2 hover:bg-[#F0EBE1] rounded-xs text-[#32170d] transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>

          <div className="flex items-center space-x-2 text-[#32170d] font-serif font-bold text-xs italic">
            <Calendar className="h-4 w-4 text-[#feb300]" />
            <span>{getDateLabel(selectedDateOffset)}</span>
          </div>

          <button 
            id="btn-next-date-report"
            disabled={selectedDateOffset >= 0}
            onClick={() => setSelectedDateOffset(prev => prev + 1)}
            className={`p-2 rounded-xs transition-all ${selectedDateOffset >= 0 ? 'text-stone-300 cursor-not-allowed' : 'hover:bg-[#F0EBE1] text-[#32170d] cursor-pointer'}`}
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Financial Summary card structure in thin border frame */}
      <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 space-y-4">
        <div className="flex items-baseline justify-between pb-2 border-b border-[#967259]/15">
          <h4 className="font-serif font-bold text-[#32170d] text-base italic">Volume Ringkasan</h4>
          <Coins className="h-4 w-4 text-[#feb300]" />
        </div>

        <div className="space-y-2.5">
          {/* Total Sales row */}
          <div className="flex items-center justify-between text-xs font-sans py-0.5 border-b border-[#967259]/5">
            <span className="font-bold text-[#967259] uppercase tracking-wider">Omzet Kasir</span>
            <span className="font-mono font-bold text-[#32170d]">
              Rp {currentSalesTotal.toLocaleString('id-ID')}
            </span>
          </div>



          {/* Divider line style */}
          <div className="pt-2.5 flex items-center justify-between">
            <span className="font-serif font-bold text-xs italic text-[#32170d]">Laba Bersih Hari Ini</span>
            {/* Elegant high contrast dark tag */}
            <div className="bg-[#32170d] text-[#FAF9F5] border border-[#feb300] px-3.5 py-1.5 rounded-sm font-mono font-bold text-xs">
              Rp {currentNetProfit.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown per item section */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-[#feb300] uppercase tracking-[0.2em]">Detail Penjualan</h3>

        <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 space-y-4">
          {topRevenueItems.length === 0 ? (
            <div className="text-center py-6">
              <Coffee className="h-6 w-6 text-stone-300 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-[#967259] uppercase tracking-widest">Tidak ada transaksi pada tanggal ini</p>
            </div>
          ) : (
            topRevenueItems.map((item, index) => {
              const percentage = currentSalesTotal > 0 ? Math.round((item.revenue / currentSalesTotal) * 100) : 0;
              const icons = [Coffee, Utensils, IceCream];
              const IconComp = icons[index] || Coffee;
              return (
                <div key={item.name} className={`flex items-center justify-between py-1 ${index < topRevenueItems.length - 1 ? 'border-b border-[#967259]/10' : ''}`}>
                  <div className="flex items-center space-x-3 truncate">
                    <div className="bg-[#F0EBE1] p-2 rounded-xs border border-[#967259]/10 text-[#32170d]">
                      <IconComp className="h-4.5 w-4.5 text-[#feb300]" />
                    </div>
                    <div className="truncate">
                      <p className="font-serif font-bold text-xs text-[#32170d] truncate">{item.name}</p>
                      <p className="text-[9px] font-sans font-medium text-stone-400">Rp {item.revenue.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[9px] font-mono font-bold ${index === 0 ? 'text-[#feb300] bg-[#32170d] border-[#32170d]' : 'text-[#32170d] bg-[#F0EBE1] border-[#967259]/15'} border px-1.5 py-0.5 rounded-sm inline-block`}>
                      {percentage}% SHARE
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action triggers Buttons rows */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* PDF Download */}
        <button
          onClick={handleDownloadPDF}
          className="h-11 bg-[#32170d] hover:bg-[#4b2c20] border border-[#32170d] text-[#feb300] rounded-xs font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Download className="h-4 w-4 text-[#feb300]" />
          <span>Simpan Laporan</span>
        </button>

        {/* Whatsapp share button */}
        <button
          onClick={handleShareWhatsApp}
          className="h-11 bg-[#FAF9F5] hover:bg-[#F0EBE1] border border-[#967259]/25 text-[#32170d] rounded-xs font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Share2 className="h-4 w-4 text-[#32170d]" />
          <span>Bagi Laporan</span>
        </button>
      </div>

      {/* Steaming Mocha Background Card element */}
      <div 
        className="relative overflow-hidden rounded-xs h-36 bg-cover bg-center text-white p-6 flex flex-col justify-end shadow-xs"
        style={{
          backgroundImage: `linear-gradient(rgba(50, 23, 13, 0.45), rgba(50, 23, 13, 0.9)), url('https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop')`,
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#feb300] mb-1">
          Pantau Neraca Usaha — Vol. 04
        </span>
        <h4 className="text-sm font-serif italic text-stone-100">Evaluasi Margin Bisnis</h4>
        <p className="text-[10px] text-gray-300 mt-1">Sistem menyinkronkan data seketika per entri tersimpan.</p>
      </div>
    </div>
  );
};
