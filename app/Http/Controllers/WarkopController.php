<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class WarkopController extends Controller
{
    // === PRODUCTS ===
    public function getProducts()
    {
        return response()->json(Product::all());
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'price' => 'required|integer',
            'category' => 'required|string',
            'icon' => 'required|string',
            'recipe_inventory_id' => 'nullable|string',
            'recipe_deduct_amount' => 'nullable|numeric'
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'product' => $product
        ], 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|integer',
            'category' => 'required|string',
            'icon' => 'required|string',
            'recipe_inventory_id' => 'nullable|string',
            'recipe_deduct_amount' => 'nullable|numeric'
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'product' => $product
        ]);
    }

    public function deleteProduct($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }

        $product->delete();
        return response()->json(['success' => true]);
    }

    // === SALES ===
    public function getSales()
    {
        $sales = Sale::with('items')->orderBy('date', 'desc')->orderBy('time', 'desc')->get();
        
        // Transform backend models to match frontend SaleTransaction format
        $formatted = $sales->map(function ($sale) {
            return [
                'id' => $sale->id,
                'date' => $sale->date,
                'time' => $sale->time,
                'manualAmount' => $sale->manual_amount,
                'notes' => $sale->notes ?? '',
                'totalAmount' => $sale->total_amount,
                'status' => $sale->status ?? 'completed',
                'items' => $sale->items->map(function ($item) {
                    return [
                        'productId' => $item->product_id,
                        'name' => $item->name,
                        'price' => $item->price,
                        'quantity' => $item->quantity
                    ];
                })
            ];
        });

        return response()->json($formatted);
    }

    public function storeSale(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'items' => 'array',
            'items.*.productId' => 'required|string',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric',
            'items.*.quantity' => 'required|numeric',
            'manualAmount' => 'numeric',
            'notes' => 'nullable|string',
            'totalAmount' => 'required|numeric'
        ]);

        $now = now()->timezone('Asia/Makassar');
        $dateStr = $now->format('Y-m-d');
        $timeStr = $now->format('H:i');

        DB::beginTransaction();
        try {
            // 1. Create Sale
            $sale = Sale::create([
                'id' => $validated['id'],
                'date' => $dateStr,
                'time' => $timeStr,
                'manual_amount' => $validated['manualAmount'] ?? 0,
                'notes' => $validated['notes'] ?? '',
                'total_amount' => $validated['totalAmount'],
                'status' => 'completed'
            ]);

            // 2. Create Sale Items & Reduce Inventory (Recipe Deduction Logic!)
            $items = $validated['items'] ?? [];
            foreach ($items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['productId'],
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity']
                ]);

                // Recipe Deduction Logic backend-side (Dynamic!):
                $qty = $item['quantity'];
                $productObj = Product::find($item['productId']);
                if ($productObj && $productObj->recipe_inventory_id && $productObj->recipe_deduct_amount > 0) {
                    $this->deductInventory($productObj->recipe_inventory_id, $productObj->recipe_deduct_amount * $qty);
                }
            }

            DB::commit();

            // Load Sale with Items and format it
            $loadedSale = Sale::with('items')->find($sale->id);
            return response()->json([
                'success' => true,
                'sale' => [
                    'id' => $loadedSale->id,
                    'date' => $loadedSale->date,
                    'time' => $loadedSale->time,
                    'manualAmount' => $loadedSale->manual_amount,
                    'notes' => $loadedSale->notes,
                    'totalAmount' => $loadedSale->total_amount,
                    'status' => $loadedSale->status ?? 'completed',
                    'items' => $loadedSale->items->map(function ($i) {
                        return [
                            'productId' => $i->product_id,
                            'name' => $i->name,
                            'price' => $i->price,
                            'quantity' => $i->quantity
                        ];
                    })
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    private function deductInventory($id, $amount)
    {
        $inv = Inventory::find($id);
        if ($inv) {
            $inv->quantity = max(0, $inv->quantity - $amount);
            $inv->save();
        }
    }

    // === EXPENSES ===
    public function getExpenses()
    {
        $expenses = Expense::orderBy('date', 'desc')->orderBy('time', 'desc')->get();
        return response()->json($expenses);
    }

    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'amount' => 'required|numeric',
            'category' => 'required|string'
        ]);

        $now = now()->timezone('Asia/Makassar');
        $dateStr = $now->format('Y-m-d');
        $timeStr = $now->format('H:i');

        $expense = Expense::create([
            'id' => $validated['id'],
            'name' => $validated['name'],
            'amount' => $validated['amount'],
            'category' => $validated['category'],
            'date' => $dateStr,
            'time' => $timeStr
        ]);

        return response()->json([
            'success' => true,
            'expense' => $expense
        ], 201);
    }

    public function deleteExpense($id)
    {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['success' => false, 'message' => 'Pengeluaran tidak ditemukan'], 404);
        }

        $expense->delete();
        return response()->json(['success' => true]);
    }

    // === INVENTORIES ===
    public function getInventories()
    {
        $inventories = Inventory::all();
        // Format to make sure properties match types
        $formatted = $inventories->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description ?? '',
                'quantity' => (float)$item->quantity,
                'unit' => $item->unit,
                'threshold' => (float)$item->threshold,
                'image' => $item->image ?? ''
            ];
        });
        return response()->json($formatted);
    }

    public function storeInventory(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'threshold' => 'required|numeric',
            'image' => 'nullable|string'
        ]);

        $item = Inventory::create([
            'id' => $validated['id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'threshold' => $validated['threshold'],
            'image' => $validated['image'] ?? ''
        ]);

        return response()->json([
            'success' => true,
            'inventory' => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description ?? '',
                'quantity' => (float)$item->quantity,
                'unit' => $item->unit,
                'threshold' => (float)$item->threshold,
                'image' => $item->image ?? ''
            ]
        ], 201);
    }

    public function updateInventory(Request $request, $id)
    {
        $item = Inventory::find($id);
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Bahan tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'threshold' => 'required|numeric',
            'image' => 'nullable|string'
        ]);

        $item->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'threshold' => $validated['threshold'],
            'image' => $validated['image'] ?? ''
        ]);

        return response()->json([
            'success' => true,
            'inventory' => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description ?? '',
                'quantity' => (float)$item->quantity,
                'unit' => $item->unit,
                'threshold' => (float)$item->threshold,
                'image' => $item->image ?? ''
            ]
        ]);
    }

    public function deleteInventory($id)
    {
        $item = Inventory::find($id);
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Bahan tidak ditemukan'], 404);
        }

        // Proteksi integritas data: Cek apakah bahan baku ini digunakan oleh resep produk aktif!
        $productCount = Product::where('recipe_inventory_id', $id)->count();
        if ($productCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Gagal menghapus bahan: Bahan '{$item->name}' sedang digunakan sebagai resep oleh {$productCount} menu jualan. Hapus pemetaan resep pada menu tersebut terlebih dahulu!"
            ], 400);
        }

        $item->delete();
        return response()->json(['success' => true]);
    }

    // === AUTHENTICATION ===
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,pegawai'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role']
        ]);

        // Start backend session immediately on register
        auth()->login($user);

        return response()->json([
            'success' => true,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'photo' => $user->photo
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi salah. Silakan coba lagi.'
            ], 401);
        }

        // Start backend session on login
        auth()->login($user);

        return response()->json([
            'success' => true,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'photo' => $user->photo
            ]
        ]);
    }

    public function logout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar'
        ]);
    }

    public function getCurrentUser(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi Anda telah berakhir.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'photo' => $user->photo
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid.'
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
        ]);

        if ($validated['email'] !== $user->email) {
            $existingUser = User::where('email', $validated['email'])->first();
            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email baru sudah terdaftar untuk pengguna lain.'
                ], 400);
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'photo' => $user->photo
            ]
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid.'
            ], 401);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Delete old photo if it exists
        if ($user->photo) {
            $oldPath = str_replace('/storage/', '', $user->photo);
            Storage::disk('public')->delete($oldPath);
        }

        // Store new photo
        $path = $request->file('photo')->store('profile_photos', 'public');
        $user->photo = '/storage/' . $path;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diperbarui.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'photo' => $user->photo
            ]
        ]);
    }

    public function deletePhoto(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid.'
            ], 401);
        }

        // Delete photo if it exists
        if ($user->photo) {
            $oldPath = str_replace('/storage/', '', $user->photo);
            Storage::disk('public')->delete($oldPath);
            $user->photo = null;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil dihapus.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'photo' => null
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid.'
            ], 401);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6'
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi lama tidak sesuai.'
            ], 400);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui.'
        ]);
    }


    // === CATEGORIES ===
    public function getCategories()
    {
        return response()->json(Category::all());
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name|max:100'
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'category' => $category
        ], 201);
    }

    public function deleteCategory($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan'], 404);
        }

        // Proteksi integritas data: Cek apakah kategori ini masih digunakan oleh produk aktif!
        $productCount = Product::where('category', $category->name)->count();
        if ($productCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Gagal menghapus kategori: Kategori '{$category->name}' sedang digunakan oleh {$productCount} menu jualan. Ubah kategori menu tersebut terlebih dahulu!"
            ], 400);
        }

        $category->delete();
        return response()->json(['success' => true]);
    }

    // === VOID SALES ===
    public function voidSale($id)
    {
        $currentUser = auth()->user();
        if (!$currentUser || $currentUser->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya administrator yang diizinkan untuk membatalkan transaksi.'
            ], 403);
        }

        $sale = Sale::with('items')->find($id);
        if (!$sale) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan.'
            ], 404);
        }

        if ($sale->status === 'voided') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi ini sudah dibatalkan sebelumnya.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Tandai transaksi sebagai voided
            $sale->status = 'voided';
            $sale->save();

            // Kembalikan stok bahan baku (Reverse Recipe Deduction!)
            foreach ($sale->items as $item) {
                $qty = $item->quantity;
                $productObj = Product::find($item->product_id);
                if ($productObj && $productObj->recipe_inventory_id && $productObj->recipe_deduct_amount > 0) {
                    $this->addInventory($productObj->recipe_inventory_id, $productObj->recipe_deduct_amount * $qty);
                }
            }

            DB::commit();

            // Re-fetch the sale with items for the frontend
            $sale->load('items');
            $formattedSale = [
                'id' => $sale->id,
                'date' => $sale->date,
                'time' => $sale->time,
                'notes' => $sale->notes ?? '',
                'manualAmount' => $sale->manual_amount ?? 0,
                'totalAmount' => $sale->total_amount,
                'status' => $sale->status,
                'items' => $sale->items->map(function ($item) {
                    return [
                        'productId' => $item->product_id,
                        'name' => $item->name,
                        'price' => $item->price,
                        'quantity' => $item->quantity,
                    ];
                })->toArray(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibatalkan (voided) dan stok bahan baku dikembalikan.',
                'sale' => $formattedSale,
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    private function addInventory($id, $amount)
    {
        $inv = Inventory::find($id);
        if ($inv) {
            $inv->quantity = $inv->quantity + $amount;
            $inv->save();
        }
    }
}
