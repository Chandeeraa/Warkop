<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Expense;

use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Seed Default Categories
        Category::updateOrCreate(['name' => 'Minuman']);
        Category::updateOrCreate(['name' => 'Lainnya']);

        // 1. Create Default Admin Account if not exists
        User::updateOrCreate(
            ['email' => 'admin@warkop.com'],
            [
                'name' => 'Admin Warkop',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ]
        );

        // 2. Create Default Pegawai Account if not exists
        User::updateOrCreate(
            ['email' => 'pegawai@warkop.com'],
            [
                'name' => 'Pegawai Kasir',
                'password' => Hash::make('pegawai123'),
                'role' => 'pegawai'
            ]
        );

        // Database starts empty for products, inventories, sales, and expenses as requested.
        // Admin will manage products and stocks dynamically via the POS Admin dashboard!
    }
}
