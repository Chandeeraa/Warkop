import React from 'react';
import { 
  Coffee, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Compass, 
  Heart, 
  Sparkles, 
  Smartphone 
} from 'lucide-react';

interface LandingPageProps {
  onOpenPOS: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenPOS }) => {
  return (
    <div className="min-h-screen bg-[#F0EBE1] font-sans flex flex-col items-center justify-between text-[#32170d] select-none p-0 md:p-6">
      
      {/* Landing Page Container with beautiful traditional-editorial borders */}
      <div className="w-full max-w-5xl bg-[#FAF9F5] border-x md:border border-[#967259]/15 md:rounded-lg shadow-2xl overflow-hidden flex flex-col justify-between min-h-screen md:min-h-[90vh]">
        
        {/* TOP BAR / NAVIGATION */}
        <header className="px-6 py-5 border-b border-[#967259]/15 flex items-center justify-between bg-[#FAF9F5]/80 backdrop-blur-xs sticky top-0 z-40">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#32170d] p-2 rounded-xs text-[#feb300] shadow-xs">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="font-serif font-extrabold text-[#32170d] text-xl uppercase tracking-tight">
              Warkop <span className="italic font-light text-[#feb300] lowercase">emi</span>
            </span>
          </div>
 
          <button 
            onClick={onOpenPOS}
            className="bg-[#feb300] hover:bg-[#ffba38] text-[#32170d] border border-[#feb300] px-4.5 py-2.5 rounded-xs text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
          >
            <Smartphone className="h-4 w-4 text-[#32170d]" />
            <span>Buka Kasir POS</span>
          </button>
        </header>

        {/* MAIN BODY - MULTI-ROW EDITORIAL HERO */}
        <main className="flex-1 flex flex-col">
          
          {/* HERO PROFILE ROW */}
          <section className="px-6 md:px-12 py-12 md:py-20 border-b border-[#967259]/15 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#F0EBE1]/40">
            
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-[#feb300]/10 border border-[#feb300]/30 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3 text-[#feb300]" />
                <span className="text-[9px] font-bold text-[#967259] uppercase tracking-wider">Warisan Cita Rasa Tradisional</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#32170d] tracking-tight leading-[1.08] italic">
                Kembali ke <br />
                <span className="not-italic text-[#feb300] font-black">Kehangatan Asli</span>
              </h1>

              <p className="text-sm text-stone-600 leading-relaxed max-w-xl">
                Didirikan dengan kecintaan mendalam pada racikan kopi Nusantara, <strong>Warkop Emi</strong> hadir sebagai oase kehangatan di tengah hiruk-pikuk kota. Kami memadukan resep seduhan legendaris tradisional dengan suasana kumpul santai yang akrab, menghadirkan secangkir kopi murni yang jujur dan tak lekang oleh waktu.
              </p>

              {/* Quick Hours */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-white border border-[#967259]/15 px-4 py-3 rounded-xs flex items-center space-x-3 shadow-3xs">
                  <Clock className="h-4 w-4 text-[#feb300]" />
                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Jam Operasional</span>
                    <span className="text-xs font-serif font-bold text-[#32170d]">07.00 - 23.00 WIB</span>
                  </div>
                </div>

                <div className="bg-white border border-[#967259]/15 px-4 py-3 rounded-xs flex items-center space-x-3 shadow-3xs">
                  <Heart className="h-4 w-4 text-[#feb300]" />
                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Seduhan Favorit</span>
                    <span className="text-xs font-serif font-bold text-[#32170d]">Kopi Robusta & Kopi Susu Mantap</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Photo Grid Placeholder */}
            <div className="md:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-sm aspect-square bg-[#F0EBE1] border border-[#967259]/15 p-3 rounded-xs shadow-md">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-200/50 via-stone-300/10 to-stone-400/20 rounded-xs mix-blend-overlay"></div>
                <img 
                  src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600&auto=format&fit=crop"
                  alt="Kopi Tradisional Warkop Emi" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xs border border-[#967259]/10 shadow-inner"
                />
                <div className="absolute -bottom-3.5 -right-3.5 bg-[#feb300] text-[#32170d] border border-[#32170d] px-3.5 py-2.5 rounded-xs font-serif font-bold text-xs italic shadow-md font-black">
                  Est. 2018
                </div>
              </div>
            </div>

          </section>

          {/* INTRODUCTION STORY & PHILOSOPHY */}
          <section className="px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-[#967259]/15 bg-white">
            <div className="md:col-span-4">
              <span className="text-[9px] font-bold text-[#967259] uppercase tracking-[0.25em] block">TENTANG KAMI</span>
              <h2 className="text-2xl font-serif font-bold text-[#32170d] mt-2 leading-tight">
                Cita Rasa yang <br />
                <span className="italic font-normal">Mempersatukan Kita</span>
              </h2>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-600 leading-relaxed">
              <p>
                Di Warkop Emi, kopi bukan sekadar minuman berkafein, melainkan medium pemersatu hangatnya obrolan hangat tetangga, tawa renyah kawan lama, dan tempat merencanakan masa depan. Biji kopi Robusta pilihan kami dipanggang secara tradisional dengan tingkat kematangan medium-dark untuk melahirkan aroma kopi kampung yang kental, pekat, sekaligus bersahabat bagi lambung.
              </p>
              <p>
                Setiap seduhan dikerjakan dengan presisi menggunakan metode saring kain tradisional (tarik) guna melahirkan buih krim kopi susu alami yang legit. Ditambah camilan andalan mi rebus racikan warkop, roti bakar arang, serta gorengan hangat renyah yang selalu menemani momen beristirahat Anda dari kesibukan duniawi.
              </p>
            </div>
          </section>

          {/* LOKASI / PHYSICAL LOCATION & SIMULATED PETA MAP */}
          <section className="px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FAF9F5]">
            
            {/* Map visualizer left side */}
            <div className="md:col-span-6 space-y-4">
              <span className="text-[9px] font-bold text-[#967259] uppercase tracking-[0.25em] block">LOKASI WARKOP</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#32170d] italic">
                Mampir & <span className="not-italic font-black">Seduh Bersama Kami</span>
              </h2>
              
              <div className="space-y-4.5 pt-2">
                <div className="flex items-start space-x-3.5">
                  <div className="bg-[#feb300]/10 border border-[#feb300]/25 p-2.5 rounded-xs text-[#feb300] mt-0.5">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#32170d] tracking-wide">Alamat Lengkap</h4>
                    <p className="text-xs text-stone-550 mt-1 max-w-sm">
                      Jl. Baso Bobihoe No. 308, Kelurahan Kayubulan, Kecamatan Limboto, Kabupaten Gorontalo, Gorontalo 96211
                    </p>
                  </div>
                </div>
 
                <div className="flex items-start space-x-3.5">
                  <div className="bg-[#feb300]/10 border border-[#feb300]/25 p-2.5 rounded-xs text-[#feb300] mt-0.5">
                    <Compass className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-[#32170d] tracking-wide">Petunjuk Arah</h4>
                    <p className="text-xs text-stone-550 mt-1 max-w-sm">
                      Berada di pusat Kota Limboto, tepat di kawasan Menara Keagungan Limboto (Pakaya Tower) dan berdekatan dengan Masjid Agung Baiturrahman Limboto.
                    </p>
                  </div>
                </div>
              </div>
 
              {/* Real External Link Google Maps to direct users */}
              <div className="pt-4">
                <a 
                  href="https://maps.app.goo.gl/nBt4ezBvR731tvKV9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white border border-[#967259]/15 hover:border-[#32170d] text-[#32170d] px-5 py-3 rounded-xs font-bold text-[10px] uppercase tracking-widest transition-all shadow-3xs cursor-pointer"
                >
                  <span>Buka di Google Maps</span>
                  <ArrowRight className="h-3 w-3 text-[#feb300]" />
                </a>
              </div>
            </div>

            {/* Beautiful Simulated Interactive Map Container */}
            <div className="md:col-span-6">
              <div className="relative w-full aspect-video sm:aspect-16/10 bg-[#F0EBE1] border border-[#967259]/20 rounded-xs shadow-md p-2 overflow-hidden select-none">
                
                {/* Simulated Grid/Map Background Pattern */}
                <div className="absolute inset-0 bg-[#F0EBE1] bg-[linear-gradient(to_right,#e3ddd3_1px,transparent_1px),linear-gradient(to_bottom,#e3ddd3_1px,transparent_1px)] bg-[size:24px_24px] flex items-center justify-center">
                  
                  {/* Styled Green park area */}
                  <div className="absolute top-1/10 left-1/4 w-36 h-20 bg-emerald-100/60 border border-emerald-200/50 rounded-lg transform -rotate-12"></div>
                  
                  {/* Styled blue river */}
                  <div className="absolute bottom-1/5 left-0 right-0 h-4 bg-sky-200/50 transform rotate-6 border-y border-sky-300/30"></div>
                  
                  {/* Map Road paths */}
                  <div className="absolute top-1/2 left-0 right-0 h-10 bg-white/70 border-y border-[#967259]/10 shadow-2xs"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-10 bg-white/70 border-x border-[#967259]/10 shadow-2xs"></div>
                  
                  {/* Intersection Road Label */}
                  <span className="absolute top-[48%] left-8 text-[8px] font-sans font-bold tracking-widest text-stone-400 uppercase">Jl. Baso Bobihoe</span>
                  <span className="absolute top-10 left-[51%] text-[8px] font-sans font-bold tracking-widest text-stone-400 uppercase rotate-90 origin-left">Jl. Trans Sulawesi</span>
                  
                  {/* Neighboring building markers */}
                  <div className="absolute top-1/4 right-1/4 bg-[#FAF9F5] border border-stone-300 rounded-sm p-1.5 shadow-3xs flex flex-col items-center">
                    <span className="text-[7px] font-bold text-[#967259] uppercase">Menara Pakaya</span>
                  </div>
 
                  {/* WARKOP EMI PIN MARKER */}
                  <div className="absolute top-[42%] left-[46%] z-10 flex flex-col items-center group animate-bounce">
                    <div className="bg-[#32170d] text-[#FAF9F5] border border-[#feb300] p-2.5 rounded-full shadow-lg relative flex items-center justify-center">
                      <Coffee className="h-4.5 w-4.5 text-[#feb300]" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#32170d] border-r border-b border-[#feb300] rotate-45"></div>
                    </div>
                    
                    {/* Tooltip identity */}
                    <div className="bg-[#32170d] text-white border border-[#feb300]/30 px-2.5 py-1 rounded-sm mt-2 shadow-md">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider block text-[#feb300]">Warkop Emi</span>
                    </div>
                  </div>
 
                </div>
 
                {/* Compass visual indicator on top-right */}
                <div className="absolute top-4 right-4 bg-white/85 border border-[#967259]/15 p-2 rounded-full shadow-2xs">
                  <Compass className="h-4.5 w-4.5 text-[#32170d] animate-spin-slow" />
                </div>
              </div>
            </div>

          </section>

          {/* LOWER INTERACTIVE CALL TO ACTION BOARD */}
          <section className="px-6 md:px-12 py-12 border-t border-[#967259]/15 bg-[#32170d] text-white text-center flex flex-col items-center space-y-5">
            <span className="text-[9px] font-bold text-[#feb300] uppercase tracking-[0.3em]">MANAJEMEN WARKOP</span>
            <h3 className="text-xl md:text-2xl font-serif font-normal italic text-stone-200 max-w-xl">
              Apakah Anda Pengelola Warkop? Masuk ke sistem POS kasir Anda di sini.
            </h3>
            
            <div className="pt-2">
              <button 
                onClick={onOpenPOS}
                className="bg-[#feb300] hover:bg-[#ffba38] text-[#32170d] px-8 py-3.5 rounded-xs font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all duration-150 active:scale-95 cursor-pointer border border-[#feb300]"
              >
                <span>Masuk Aplikasi Kasir</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="px-6 py-5 border-t border-[#967259]/15 flex flex-col sm:flex-row justify-between items-center bg-[#F0EBE1]/40 text-[10px] text-stone-400 font-mono tracking-wider space-y-3 sm:space-y-0">
          <span>© 2026 WARKOP EMI GORONTALO. ALL RIGHTS RESERVED.</span>
          <span>ESTABLISHED TRADITIONAL BREWS</span>
        </footer>

      </div>
    </div>
  );
};
