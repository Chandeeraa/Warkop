import { useState, useEffect } from 'react';
import { 
  Coffee, 
  BarChart2, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Clock,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  UserCheck,
  Wallet
} from 'lucide-react';
import axios from 'axios';

import { TabType, Product, SaleTransaction, ExpenseItem, InventoryItem, User, Category } from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SALES, 
  INITIAL_EXPENSES, 
  INITIAL_INVENTORY 
} from './initialData';

import { StatsView } from './components/StatsView';
import { SalesView } from './components/SalesView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { StokView } from './components/StokView';
import { ProdukView } from './components/ProdukView';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { HistoryView } from './components/HistoryView';

export default function App() {
  // 1. Core local states
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const cached = localStorage.getItem('warkop_tab');
    return (cached as TabType) || 'stats';
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<SaleTransaction[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('warkop_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Load data from MySQL backend via Laravel API
  const loadDataFromApi = async () => {
    try {
      const [resProducts, resSales, resExpenses, resInventories, resCategories] = await Promise.all([
        axios.get<Product[]>('/api/products'),
        axios.get<SaleTransaction[]>('/api/sales'),
        axios.get<ExpenseItem[]>('/api/expenses'),
        axios.get<InventoryItem[]>('/api/inventories'),
        axios.get<Category[]>('/api/categories')
      ]);
      setProducts(resProducts.data);
      setSales(resSales.data);
      setExpenses(resExpenses.data);
      setInventory(resInventories.data);
      setCategories(resCategories.data);
    } catch (error: any) {
      console.error("Gagal mengambil data dari API, menggunakan data lokal fallback:", error);
      if (error.response && error.response.status === 401) {
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify session on mount (auto login using backend session cookie)
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get('/api/user/me');
        if (res.data.success && res.data.user) {
          setCurrentUser(res.data.user as User);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Session tidak valid atau belum masuk.");
        setCurrentUser(null);
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDataFromApi();
    }
  }, [currentUser]);

  // Save active tab preference
  useEffect(() => {
    localStorage.setItem('warkop_tab', activeTab);
  }, [activeTab]);

  // Save active user session and guard tabs
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('warkop_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('warkop_user');
    }

    if (currentUser?.role === 'pegawai' && activeTab === 'produk') {
      setActiveTab('sales');
    }
  }, [currentUser, activeTab]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error("Gagal memanggil API logout:", error);
    }
    setCurrentUser(null);
    setActiveTab('stats');
  };

  // 2. State modifiers connected to API endpoints
  // onAddSale called from Point of Sale
  const handleAddSale = async (newSaleData: Omit<SaleTransaction, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const customId = 'tx_s_' + now.getTime();
    
    const payload = {
      ...newSaleData,
      id: customId
    };

    try {
      const response = await axios.post('/api/sales', payload);
      if (response.data.success) {
        const savedSale: SaleTransaction = response.data.sale;
        setSales(prev => [savedSale, ...prev]);
        
        // Refresh inventory state because the backend executes the recipe deduction!
        const resInv = await axios.get<InventoryItem[]>('/api/inventories');
        setInventory(resInv.data);
      }
    } catch (error) {
      console.error("Gagal menyimpan transaksi ke database:", error);
      alert("Gagal menyimpan transaksi ke database. Silakan coba lagi.");
    }
  };

  // onVoidSale called from Arsip Nota
  const handleVoidSale = async (saleId: string) => {
    try {
      const response = await axios.post(`/api/sales/${saleId}/void`);
      if (response.data.success) {
        const updatedSale: SaleTransaction = response.data.sale;
        // Update sales state
        setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
        // Refresh inventory state because voiding reverses the recipe ingredient depletion!
        const resInv = await axios.get<InventoryItem[]>('/api/inventories');
        setInventory(resInv.data);
        alert("Nota berhasil dibatalkan (void). Stok bahan baku telah dikembalikan.");
      }
    } catch (error: any) {
      console.error("Gagal melakukan void transaksi:", error);
      const errMsg = error.response?.data?.message || "Gagal melakukan void transaksi.";
      alert(errMsg);
    }
  };

  // onAddExpense called from cashflow logs
  const handleAddExpense = async (newExpenseData: Omit<ExpenseItem, 'id' | 'time' | 'date'>) => {
    const now = new Date();
    const customId = 'tx_e_' + now.getTime();
    
    const payload = {
      ...newExpenseData,
      id: customId
    };

    try {
      const response = await axios.post('/api/expenses', payload);
      if (response.data.success) {
        const savedExpense: ExpenseItem = response.data.expense;
        setExpenses(prev => [savedExpense, ...prev]);
      }
    } catch (error) {
      console.error("Gagal menyimpan pengeluaran ke database:", error);
      alert("Gagal menyimpan pengeluaran ke database. Silakan coba lagi.");
    }
  };

  // onDeleteExpense
  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await axios.delete(`/api/expenses/${id}`);
      if (response.data.success) {
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error("Gagal menghapus pengeluaran dari database:", error);
      alert("Gagal menghapus pengeluaran dari database.");
    }
  };

  // onAddInventoryItem
  const handleAddInventoryItem = async (newItemData: Omit<InventoryItem, 'id'>) => {
    const customId = 'inv_' + Date.now();
    const payload = {
      ...newItemData,
      id: customId
    };
    
    try {
      const response = await axios.post('/api/inventories', payload);
      if (response.data.success) {
        const savedItem: InventoryItem = response.data.inventory;
        setInventory(prev => [...prev, savedItem]);
      }
    } catch (error: any) {
      console.error("Gagal menambahkan bahan ke database:", error);
      const errMsg = error.response?.data?.message || "Gagal menambahkan bahan ke database.";
      alert(errMsg);
    }
  };

  // onUpdateInventoryItem
  const handleUpdateInventoryItem = async (updatedItem: InventoryItem) => {
    try {
      const response = await axios.put(`/api/inventories/${updatedItem.id}`, updatedItem);
      if (response.data.success) {
        const savedItem: InventoryItem = response.data.inventory;
        setInventory(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
      }
    } catch (error: any) {
      console.error("Gagal memperbarui bahan di database:", error);
      const errMsg = error.response?.data?.message || "Gagal memperbarui bahan di database.";
      alert(errMsg);
    }
  };

  // onDeleteInventoryItem
  const handleDeleteInventoryItem = async (id: string) => {
    try {
      const response = await axios.delete(`/api/inventories/${id}`);
      if (response.data.success) {
        setInventory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error: any) {
      console.error("Gagal menghapus bahan dari database:", error);
      const errMsg = error.response?.data?.message || "Gagal menghapus bahan dari database.";
      alert(errMsg);
    }
  };

  // onAddProduct called from Kelola Menu
  const handleAddProduct = async (newProd: Product) => {
    try {
      const response = await axios.post('/api/products', newProd);
      if (response.data.success) {
        const saved: Product = response.data.product;
        setProducts(prev => [...prev, saved]);
      }
    } catch (error: any) {
      console.error("Gagal menambahkan produk:", error);
      const errMsg = error.response?.data?.message || "Gagal menambahkan produk ke database.";
      alert(errMsg);
    }
  };

  // onUpdateProduct
  const handleUpdateProduct = async (updatedProd: Product) => {
    try {
      const response = await axios.put(`/api/products/${updatedProd.id}`, updatedProd);
      if (response.data.success) {
        const saved: Product = response.data.product;
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
      }
    } catch (error: any) {
      console.error("Gagal memperbarui produk:", error);
      const errMsg = error.response?.data?.message || "Gagal memperbarui produk di database.";
      alert(errMsg);
    }
  };

  // onDeleteProduct
  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await axios.delete(`/api/products/${id}`);
      if (response.data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error: any) {
      console.error("Gagal menghapus produk:", error);
      const errMsg = error.response?.data?.message || "Gagal menghapus produk dari database.";
      alert(errMsg);
    }
  };

  // onAddCategory
  const handleAddCategory = async (name: string) => {
    try {
      const response = await axios.post('/api/categories', { name });
      if (response.data.success) {
        const savedCat: Category = response.data.category;
        setCategories(prev => [...prev, savedCat]);
      }
    } catch (error) {
      console.error("Gagal menambahkan kategori:", error);
      alert("Gagal menambahkan kategori. Nama kategori mungkin sudah terdaftar.");
    }
  };

  // handleDeleteCategory
  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await axios.delete(`/api/categories/${id}`);
      if (response.data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (error: any) {
      console.error("Gagal menghapus kategori:", error);
      const errMsg = error.response?.data?.message || "Gagal menghapus kategori dari database.";
      alert(errMsg);
    }
  };

  // Dynamic current date in WITA (GMT+8) for sidebar/headers (e.g., "22 MEI 2026")
  const currentDateLabel = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Makassar'
  }).toUpperCase();

  if (!currentUser) {
    return (
      <>
        <LandingPage onOpenPOS={() => setShowAuthModal(true)} />
        {showAuthModal && (
          <AuthView 
            onClose={() => setShowAuthModal(false)} 
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setShowAuthModal(false);
            }} 
          />
        )}
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EBE1] flex items-center justify-center font-sans">
        <div className="text-center space-y-4 animate-pulse">
          <div className="bg-[#32170d] p-4 rounded-xl text-[#feb300] inline-block">
            <Coffee className="h-8 w-8" />
          </div>
          <div>
            <p className="font-serif font-bold text-[#32170d] text-lg">Warkop <span className="italic font-light text-[#967259]">emi</span></p>
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-2">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EBE1] flex items-center justify-center font-sans p-0 md:p-6">
      
      {/* App Container: Mobile is full screen, Desktop is a beautiful tablet/desktop frame */}
      <div className="w-full max-w-md md:max-w-6xl min-h-screen md:min-h-0 md:h-[88vh] bg-[#FAF9F5] shadow-xl relative flex flex-col md:flex-row overflow-hidden border-x md:border border-[#967259]/15 md:rounded-lg animate-fade-in">
        
        {/* SIDEBAR FOR DESKTOP ONLY */}
        <aside className="hidden md:flex md:w-64 bg-[#FAF9F5] border-r border-[#967259]/15 flex-col justify-between p-6 select-none">
          <div className="space-y-8">
            {/* Branding */}
            <div className="flex items-center space-x-2.5">
              <div className="bg-[#32170d] p-2 rounded-xs text-[#feb300] shadow-xs">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="font-serif font-extrabold text-[#32170d] text-xl uppercase tracking-tight">
                Warkop <span className="italic font-light text-[#967259] lowercase">emi</span>
              </span>
            </div>

            {/* User Profile & Actions */}
            <div className="bg-[#F0EBE1]/60 p-3.5 rounded-xs border border-[#967259]/15 space-y-2.5">
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 cursor-pointer group hover:bg-[#FAF9F5]/80 p-1.5 -m-1.5 rounded-xs transition-all"
                title="Kelola Profil"
              >
                {currentUser.photo ? (
                  <img 
                    src={currentUser.photo} 
                    alt={currentUser.name} 
                    className="h-7.5 w-7.5 rounded-full object-cover border border-[#feb300] flex-shrink-0 group-hover:scale-105 transition-transform" 
                  />
                ) : (
                  <div className="bg-[#32170d] p-2 rounded-full text-[#feb300] flex-shrink-0 group-hover:scale-105 transition-transform">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-sans font-bold text-stone-400 group-hover:text-[#feb300] uppercase tracking-widest leading-none transition-colors">Petugas Aktif</p>
                  <p className="font-serif font-bold text-xs text-[#32170d] truncate mt-1 italic leading-none">{currentUser.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#967259]/10">
                <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-xs uppercase ${
                  currentUser.role === 'admin' 
                    ? 'bg-[#32170d] text-[#feb300]' 
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Pegawai'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-[9px] font-bold text-red-650 hover:text-red-800 uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer bg-transparent border-0"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Vertical) */}
            <nav className="flex flex-col space-y-1.5">
              {[
                { id: 'stats', label: 'Stats', icon: BarChart2, rotation: '' },
                { id: 'sales', label: 'POS Terminal', icon: ShoppingCart, rotation: '' },
                { id: 'history', label: 'Arsip Nota', icon: Receipt, rotation: '' },
                ...(currentUser.role === 'admin' ? [{ id: 'produk', label: 'Kelola Menu', icon: Coffee, rotation: '' }] : []),
                { id: 'reports', label: 'Reports', icon: BarChart2, rotation: 'rotate-90' },
                { id: 'stok', label: 'Stok', icon: Package, rotation: '' },
                { id: 'expenses', label: 'Belanja', icon: Wallet, rotation: '' }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-3.5 w-full py-3 px-4 rounded-xs font-bold text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#32170d] text-[#feb300] shadow-sm'
                        : 'text-stone-400 hover:text-[#32170d] hover:bg-stone-50'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 stroke-[2px] ${tab.rotation}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer / Time info inside sidebar */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 bg-white border border-[#967259]/15 px-3.5 py-2.5 text-xs font-mono tracking-wider text-stone-600 justify-center">
              <Clock className="h-3.5 w-3.5 text-[#feb300]" />
              <span>{currentDateLabel}</span>
            </div>
            <div className="text-[10px] text-stone-400 font-mono text-center">
              Warkop Emi POS • Terkunci Aman
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Top bar branding structure - Mobile Only */}
          <header className="md:hidden bg-[#FAF9F5] border-b border-[#967259]/15 px-4 py-4 flex flex-col space-y-3 sticky top-0 z-30 select-none shadow-xs">
            <div className="flex items-between justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-[#32170d] p-1.5 rounded-xs text-[#feb300] shadow-xs">
                  <Coffee className="h-4 w-4" />
                </div>
                <span className="font-serif font-extrabold text-[#32170d] text-base uppercase tracking-tight">
                  Warkop <span className="italic font-light text-[#967259] lowercase">emi</span>
                </span>
              </div>

              <div className="flex items-center space-x-1.5 bg-white border border-[#967259]/15 px-2 py-0.5 text-[8px] font-mono tracking-wider text-stone-600">
                <Clock className="h-2.5 w-2.5 text-[#feb300]" />
                <span>{currentDateLabel}</span>
              </div>
            </div>

            {/* Mobile User Profile & Logout */}
            <div className="bg-[#F0EBE1]/60 p-2.5 rounded-xs border border-[#967259]/15 flex items-center justify-between text-left">
              <div 
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 min-w-0 cursor-pointer active:opacity-75"
                title="Kelola Profil"
              >
                {currentUser.photo ? (
                  <img 
                    src={currentUser.photo} 
                    alt={currentUser.name} 
                    className="h-6.5 w-6.5 rounded-full object-cover border border-[#feb300] flex-shrink-0" 
                  />
                ) : (
                  <div className="bg-[#32170d] p-1.5 rounded-full text-[#feb300] flex-shrink-0">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-serif font-bold text-[#32170d] truncate leading-none italic">{currentUser.name}</p>
                  <p className="text-[8px] font-mono text-stone-400 uppercase tracking-widest mt-0.5 leading-none">{currentUser.role === 'admin' ? 'Admin' : 'Pegawai'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white hover:bg-stone-50 border border-[#967259]/15 text-rose-700 px-2.5 py-1 rounded-xs font-bold text-[9px] uppercase tracking-wider flex items-center space-x-1 transition-all cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span>Keluar</span>
              </button>
            </div>
          </header>

          {/* Content wrapper with smooth height auto limits */}
          <main className="flex-1 px-5 py-5 md:px-8 md:py-8 overflow-y-auto bg-[#FAF9F5] pb-24 md:pb-8">
            {activeTab === 'stats' && (
              <StatsView 
                sales={sales} 
                expenses={expenses} 
                inventory={inventory} 
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'sales' && (
              <SalesView 
                products={products} 
                inventory={inventory}
                categories={categories}
                onAddSale={handleAddSale}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView 
                expenses={expenses} 
                onAddExpense={handleAddExpense} 
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView 
                sales={sales} 
                expenses={expenses}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView 
                sales={sales} 
                currentUserRole={currentUser.role}
                onVoidSale={handleVoidSale}
              />
            )}

            {activeTab === 'stok' && (
              <StokView 
                inventory={inventory} 
                currentUserRole={currentUser.role}
                onAddInventoryItem={handleAddInventoryItem}
                onUpdateInventoryItem={handleUpdateInventoryItem}
                onDeleteInventoryItem={handleDeleteInventoryItem}
              />
            )}

            {activeTab === 'produk' && currentUser.role === 'admin' && (
              <ProdukView
                products={products}
                inventory={inventory}
                categories={categories}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView 
                currentUser={currentUser}
                onUpdateCurrentUser={setCurrentUser}
              />
            )}
          </main>

          {/* Bottom tab bars navigation - Mobile Only */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#967259]/15 px-2 py-1.5 flex items-center justify-between z-50 select-none shadow-lg h-16">
            
            {/* LEFT GROUP OF BUTTONS */}
            <div className="flex-1 flex justify-around items-center">
              {/* TAB: Stats */}
              <button 
                id="tab-stats"
                onClick={() => setActiveTab('stats')}
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
              >
                <div className={`px-2 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'stats' 
                    ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                    : 'text-stone-400 hover:text-[#32170d]'
                }`}>
                  <BarChart2 className="h-4.5 w-4.5 stroke-[2px]" />
                </div>
                <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                  activeTab === 'stats' ? 'text-[#32170d]' : 'text-stone-400'
                }`}>Stats</span>
              </button>

              {/* TAB: History / Arsip */}
              <button 
                id="tab-history"
                onClick={() => setActiveTab('history')}
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
              >
                <div className={`px-2 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'history' 
                    ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                    : 'text-stone-400 hover:text-[#32170d]'
                }`}>
                  <Receipt className="h-4.5 w-4.5 stroke-[2px]" />
                </div>
                <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                  activeTab === 'history' ? 'text-[#32170d]' : 'text-stone-400'
                }`}>Arsip</span>
              </button>

              {/* TAB: Reports (Always on Left for both Admin and Pegawai) */}
              <button 
                id="tab-reports"
                onClick={() => setActiveTab('reports')}
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
              >
                <div className={`px-2 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'reports' 
                    ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                    : 'text-stone-400 hover:text-[#32170d]'
                }`}>
                  <BarChart2 className="h-4.5 w-4.5 stroke-[2px] rotate-90" />
                </div>
                <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                  activeTab === 'reports' ? 'text-[#32170d]' : 'text-stone-400'
                }`}>Reports</span>
              </button>
            </div>

            {/* CENTER ACTION BUTTON: POS TERMINAL (SALES) */}
            <div className="flex-shrink-0 px-2 flex flex-col items-center justify-center relative -mt-4.5">
              <button 
                id="tab-sales"
                onClick={() => setActiveTab('sales')}
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 relative"
              >
                {/* Floating circular POS terminal style button */}
                <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-md border-4 border-white relative ${
                  activeTab === 'sales' 
                    ? 'bg-[#32170d] text-[#feb300]' 
                    : 'bg-[#967259] text-white hover:bg-[#32170d]'
                }`}>
                  <ShoppingCart className="h-5.5 w-5.5 stroke-[2.5px]" />
                  
                  {/* Permanent small yellow dot (Status Indicator) */}
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#feb300] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#feb300] border-2 border-white"></span>
                  </span>
                </div>
                <span className={`text-[8.5px] font-sans tracking-widest uppercase font-extrabold mt-1 text-center ${
                  activeTab === 'sales' ? 'text-[#32170d]' : 'text-stone-400'
                }`}>POS Terminal</span>
              </button>
            </div>

            {/* RIGHT GROUP OF BUTTONS */}
            <div className="flex-1 flex justify-around items-center">
              {/* TAB: Stok */}
              <button 
                id="tab-stok"
                onClick={() => setActiveTab('stok')}
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
              >
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'stok' 
                    ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                    : 'text-stone-400 hover:text-[#32170d]'
                }`}>
                  <Package className="h-4.5 w-4.5 stroke-[2px]" />
                </div>
                <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                  activeTab === 'stok' ? 'text-[#32170d]' : 'text-stone-400'
                }`}>Stok</span>
              </button>

              {/* TAB: Belanja / Expenses (Always shown to balance the layout) */}
              <button 
                id="tab-expenses"
                onClick={() => setActiveTab('expenses')}
                className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
              >
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'expenses' 
                    ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                    : 'text-stone-400 hover:text-[#32170d]'
                }`}>
                  <Wallet className="h-4.5 w-4.5 stroke-[2px]" />
                </div>
                <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                  activeTab === 'expenses' ? 'text-[#32170d]' : 'text-stone-400'
                }`}>Belanja</span>
              </button>

              {/* TAB: Kelola Menu (Admin Only) */}
              {currentUser.role === 'admin' && (
                <button 
                  id="tab-produk"
                  onClick={() => setActiveTab('produk')}
                  className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
                >
                  <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                    activeTab === 'produk' 
                      ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                      : 'text-stone-400 hover:text-[#32170d]'
                  }`}>
                    <Coffee className="h-4.5 w-4.5 stroke-[2px]" />
                  </div>
                  <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                    activeTab === 'produk' ? 'text-[#32170d]' : 'text-stone-400'
                  }`}>Menu</span>
                </button>
              )}

              {/* TAB: Profil (Only on right for Pegawai to balance layout) */}
              {currentUser.role !== 'admin' && (
                <button 
                  id="tab-profile"
                  onClick={() => setActiveTab('profile')}
                  className="flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 flex-1"
                >
                  <div className={`px-2.5 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-[#32170d] text-[#feb300] shadow-sm' 
                      : 'text-stone-400 hover:text-[#32170d]'
                  }`}>
                    <UserIcon className="h-4.5 w-4.5 stroke-[2px]" />
                  </div>
                  <span className={`text-[8px] font-sans tracking-wider uppercase font-bold mt-1 ${
                    activeTab === 'profile' ? 'text-[#32170d]' : 'text-stone-400'
                  }`}>Profil</span>
                </button>
              )}
            </div>

          </nav>

        </div>
      </div>
    </div>
  );
}
