import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Coffee, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import { User } from '../types';

interface AuthViewProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'pegawai'>('admin');
  
  // Status states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Submit Handler for Login or Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const response = await axios.post('/api/login', { email, password });
        if (response.data.success) {
          setSuccessMsg('Berhasil masuk! Menyiapkan kasir...');
          setTimeout(() => {
            onLoginSuccess(response.data.user);
          }, 1000);
        }
      } else {
        const response = await axios.post('/api/register', { name, email, password, role });
        if (response.data.success) {
          setSuccessMsg('Pendaftaran akun berhasil! Mengalihkan ke login...');
          setTimeout(() => {
            setActiveTab('login');
            setPassword('');
            setSuccessMsg(null);
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper (verification via Laravel API)
  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/login', { email: demoEmail, password: demoPass });
      if (response.data.success) {
        setSuccessMsg(`Berhasil masuk sebagai ${response.data.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(response.data.user);
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal melakukan login demo cepat. Pastikan database Anda telah di-seed (`php artisan migrate:fresh --seed`).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#32170d]/75 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fade-in overflow-y-auto">
      
      {/* AUTH CONTAINER - Glassmorphism style with coffee theme */}
      <div className="bg-[#FAF9F5] w-full max-w-md rounded-xs border border-[#967259]/30 shadow-2xl overflow-hidden animate-slide-up my-8 relative">
        
        {/* Decorative brown top-strip */}
        <div className="h-1.5 bg-[#feb300] w-full"></div>

        {/* HEADER SECTION */}
        <div className="bg-[#32170d] text-white p-5 flex items-center justify-between border-b border-[#feb300]/20">
          <div className="flex items-center space-x-2">
            <Coffee className="h-4.5 w-4.5 text-[#feb300]" />
            <span className="font-serif font-bold text-sm text-white italic">
              Akses Aplikasi POS Kasir
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* TAB CONTROLS (LOGIN vs REGISTER) */}
        <div className="flex border-b border-[#967259]/15 bg-[#F0EBE1]/40">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white border-b-2 border-[#32170d] text-[#32170d]'
                : 'text-stone-400 hover:text-[#32170d] hover:bg-[#F0EBE1]/35'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white border-b-2 border-[#32170d] text-[#32170d]'
                : 'text-stone-400 hover:text-[#32170d] hover:bg-[#F0EBE1]/35'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* MAIN BODY FORM */}
        <div className="p-6 space-y-5">
          
          {/* Notifications / Feedback alerts */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-[#ba1a1a] p-3 rounded-xs flex items-start space-x-2 animate-slide-up text-left">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] font-sans font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xs flex items-start space-x-2 animate-slide-up text-left">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] font-sans font-medium">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* NAME FIELD (REGISTER ONLY) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-450" />
                  <input
                    type="text"
                    required
                    placeholder="Budi Sudarsono"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-450" />
                <input
                  type="email"
                  required
                  placeholder="kasir@warkop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300] font-mono"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-450" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-11 pr-11 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#32170d] cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ROLE SELECTOR (REGISTER ONLY) */}
            {activeTab === 'register' && (
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Hak Akses (Role)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-3 px-4 border rounded-xs font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer transition-colors ${
                      role === 'admin'
                        ? 'bg-[#32170d] border-[#32170d] text-white shadow-xs'
                        : 'bg-white border-[#967259]/15 text-[#32170d]/50 hover:bg-stone-50'
                    }`}
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('pegawai')}
                    className={`py-3 px-4 border rounded-xs font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer transition-colors ${
                      role === 'pegawai'
                        ? 'bg-[#32170d] border-[#32170d] text-white shadow-xs'
                        : 'bg-white border-[#967259]/15 text-[#32170d]/50 hover:bg-stone-50'
                    }`}
                  >
                    <UserCheck className="h-4.5 w-4.5" />
                    <span>Pegawai</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 bg-[#feb300] hover:bg-[#ffba38] border border-[#feb300] text-[#32170d] font-black text-xs uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition-colors mt-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 text-[#32170d] animate-spin" />
              ) : (
                <Coffee className="h-4.5 w-4.5 text-[#32170d]" />
              )}
              <span>{activeTab === 'login' ? 'Masuk Sekarang' : 'Daftarkan Akun'}</span>
            </button>
          </form>

          {/* QUICK DEMO SEEDED USERS SECTION (ONLY FOR LOGIN TAB) */}
          {activeTab === 'login' && (
            <div className="bg-[#F0EBE1]/45 border border-[#967259]/15 rounded-xs p-4.5 space-y-3.5 text-left">
              <div className="flex flex-col">
                <span className="text-[9px] font-sans font-bold text-stone-450 uppercase tracking-widest">
                  Akses Cepat Uji Coba (Demo)
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5">
                  Gunakan akun bawaan di bawah ini untuk menguji secara instan:
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Admin button */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@warkop.com', 'admin123')}
                  className="flex-1 bg-white hover:bg-[#F0EBE1]/30 border border-[#967259]/15 text-[#32170d] py-2 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-3xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#feb300]" />
                  <span>Admin Bawaan</span>
                </button>
                {/* Pegawai button */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('pegawai@warkop.com', 'pegawai123')}
                  className="flex-1 bg-white hover:bg-[#F0EBE1]/30 border border-[#967259]/15 text-[#32170d] py-2 px-3 rounded-xs font-bold text-[9px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-3xs"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#feb300]" />
                  <span>Pegawai Bawaan</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
