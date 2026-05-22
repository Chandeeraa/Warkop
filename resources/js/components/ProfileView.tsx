import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Lock, 
  Save, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Coffee,
  Mail,
  UserCheck,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import axios from 'axios';
import { User } from '../types';

interface ProfileViewProps {
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateCurrentUser }) => {
  // Profile details state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Format file harus berupa gambar!', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showFeedback('Ukuran foto maksimal 2MB!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('email', currentUser.email);

    setIsUploadingPhoto(true);
    try {
      const response = await axios.post('/api/user/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onUpdateCurrentUser(response.data.user);
        showFeedback('Foto profil berhasil diperbarui!', 'success');
      }
    } catch (error: any) {
      console.error('Gagal mengunggah foto profil:', error);
      const errMsg = error.response?.data?.message || 'Gagal mengunggah foto profil.';
      showFeedback(errMsg, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) {
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const response = await axios.delete('/api/user/photo', {
        data: { email: currentUser.email }
      });

      if (response.data.success) {
        onUpdateCurrentUser(response.data.user);
        showFeedback('Foto profil berhasil dihapus!', 'success');
      }
    } catch (error: any) {
      console.error('Gagal menghapus foto profil:', error);
      const errMsg = error.response?.data?.message || 'Gagal menghapus foto profil.';
      showFeedback(errMsg, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showFeedback('Nama dan email tidak boleh kosong!', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await axios.put('/api/user/profile', {
        current_email: currentUser.email,
        name: name,
        email: email
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        onUpdateCurrentUser(updatedUser);
        showFeedback('Profil Anda berhasil diperbarui!', 'success');
      }
    } catch (error: any) {
      console.error('Gagal memperbarui profil:', error);
      const errMsg = error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.';
      showFeedback(errMsg, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showFeedback('Semua kolom kata sandi wajib diisi!', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showFeedback('Kata sandi baru minimal harus 6 karakter!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showFeedback('Konfirmasi kata sandi baru tidak cocok!', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await axios.put('/api/user/password', {
        email: currentUser.email,
        current_password: currentPassword,
        new_password: newPassword
      });

      if (response.data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showFeedback('Kata sandi berhasil diperbarui!', 'success');
      }
    } catch (error: any) {
      console.error('Gagal memperbarui kata sandi:', error);
      const errMsg = error.response?.data?.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.';
      showFeedback(errMsg, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Get user avatar initials
  const getInitials = (userName: string) => {
    return userName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#32170d]">
      {/* Header section */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          PENGATURAN AKUN
        </span>
        <h1 className="text-3xl font-normal font-serif text-[#32170d] mt-2 italic">
          Profil <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Petugas</span>
        </h1>
      </div>

      {/* Success/Error Toast Message */}
      {toast.show && (
        <div className={`border p-4 rounded-xs flex items-center space-x-3 shadow-md animate-slide-up z-50 transition-all ${
          toast.type === 'success' 
            ? 'bg-[#32170d] border-[#feb300] text-[#FAF9F5]' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-[#feb300] flex-shrink-0" />
          ) : (
            <X className="h-5 w-5 text-red-650 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider text-[#feb300]">
              {toast.type === 'success' ? 'Status Pembaruan' : 'Terjadi Kesalahan'}
            </p>
            <p className="text-xs mt-1 opacity-90">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className="text-stone-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* User Info & Avatar Section */}
      <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative group">
          {currentUser.photo ? (
            <img 
              src={currentUser.photo} 
              alt={currentUser.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-[#feb300] shadow-sm transition-opacity duration-200"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-[#32170d] border-2 border-[#feb300] flex items-center justify-center text-[#feb300] text-2xl font-serif font-bold shadow-sm">
              {getInitials(currentUser.name)}
            </div>
          )}
          
          <label className="absolute inset-0 flex items-center justify-center bg-black/55 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
            <Camera className="h-6 w-6 text-[#feb300] animate-pulse" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              className="hidden" 
              disabled={isUploadingPhoto}
            />
          </label>

          <div className="absolute -bottom-1.5 -right-1.5 bg-[#feb300] text-[#32170d] p-1.5 rounded-full border border-[#FAF9F5] z-10 shadow-xs">
            {currentUser.role === 'admin' ? <ShieldCheck className="h-4.5 w-4.5" /> : <UserCheck className="h-4.5 w-4.5" />}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-xl font-serif font-bold italic text-[#32170d]">{currentUser.name}</h2>
          <p className="text-xs text-[#967259] font-mono">{currentUser.email}</p>
          
          <div className="pt-2.5 flex flex-wrap gap-2 justify-center md:justify-start items-center">
            <span className={`text-[9px] font-bold tracking-widest px-3 py-1.5 rounded-sm uppercase ${
              currentUser.role === 'admin' 
                ? 'bg-[#32170d] text-[#feb300] border border-[#feb300]/30' 
                : 'bg-stone-200 text-stone-600'
            }`}>
              Peran: {currentUser.role === 'admin' ? 'Administrator' : 'Pegawai POS'}
            </span>
            
            <label className="text-[9px] font-bold tracking-widest px-3 py-1.5 rounded-sm uppercase bg-[#FAF9F5] hover:bg-[#F0EBE1] border border-[#967259]/25 text-[#32170d] flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs">
              <Upload className="h-3.5 w-3.5 text-[#feb300]" />
              {isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="hidden" 
                disabled={isUploadingPhoto}
              />
            </label>
            
            {currentUser.photo && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={isUploadingPhoto}
                className="text-[9px] font-bold tracking-widest px-3 py-1.5 rounded-sm uppercase bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Edit Profile Details */}
        <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 space-y-4">
          <div className="flex items-baseline justify-between pb-2 border-b border-[#967259]/15">
            <h4 className="font-serif font-bold text-[#32170d] text-sm italic flex items-center gap-2">
              <UserIcon className="h-4.5 w-4.5 text-[#feb300]" />
              Detail Informasi Profil
            </h4>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-widest mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#967259]/15 text-[#32170d] rounded-xs px-3.5 py-2.5 text-xs font-sans focus:outline-none focus:border-[#32170d] transition-all"
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-widest mb-1.5">
                Alamat Email (Digunakan untuk Masuk)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#967259]/15 text-[#32170d] rounded-xs pl-9 pr-3.5 py-2.5 text-xs font-sans focus:outline-none focus:border-[#32170d] transition-all"
                  placeholder="email@warkopemi.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full h-10 bg-[#32170d] hover:bg-[#4b2c20] text-[#feb300] border border-[#32170d] rounded-xs font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isUpdatingProfile ? 'Menyimpan...' : 'Simpan Profil'}</span>
            </button>
          </form>
        </div>

        {/* Form 2: Change Password */}
        <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 space-y-4">
          <div className="flex items-baseline justify-between pb-2 border-b border-[#967259]/15">
            <h4 className="font-serif font-bold text-[#32170d] text-sm italic flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5 text-[#feb300]" />
              Ubah Kata Sandi
            </h4>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-widest mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-[#967259]/15 text-[#32170d] rounded-xs pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-[#32170d] transition-all"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-widest mb-1.5">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-[#967259]/15 text-[#32170d] rounded-xs pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-[#32170d] transition-all"
                  placeholder="Min. 6 karakter"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-widest mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-[#967259]/15 text-[#32170d] rounded-xs pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-[#32170d] transition-all"
                  placeholder="Ketik ulang kata sandi baru"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full h-10 bg-[#FAF9F5] hover:bg-[#F0EBE1] border border-[#967259]/25 text-[#32170d] rounded-xs font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4 text-[#feb300]" />
              <span>{isUpdatingPassword ? 'Memproses...' : 'Ubah Sandi'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Decorative Brand Card */}
      <div 
        className="relative overflow-hidden rounded-xs h-36 bg-cover bg-center text-white p-6 flex flex-col justify-end shadow-xs"
        style={{
          backgroundImage: `linear-gradient(rgba(50, 23, 13, 0.45), rgba(50, 23, 13, 0.95)), url('https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop')`,
          backgroundPosition: 'center 45%'
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#feb300] mb-1">
          Petugas Warkop Emi POS • Keamanan Terkunci
        </span>
        <h4 className="text-sm font-serif italic text-stone-100">Kredensial Keamanan Akun</h4>
        <p className="text-[10px] text-gray-300 mt-1">Harap jaga kerahasiaan kata sandi Anda dan ganti secara berkala demi keamanan usaha.</p>
      </div>
    </div>
  );
};
