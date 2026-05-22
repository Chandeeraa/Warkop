<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WarkopController;

// --- PUBLIC ROUTES ---
Route::post('/register', [WarkopController::class, 'register']);
Route::post('/login', [WarkopController::class, 'login']);
Route::post('/logout', [WarkopController::class, 'logout']);

// --- PROTECTED ROUTES ---
Route::middleware('session.auth')->group(function () {
    // Active Authenticated User Info
    Route::get('/user/me', [WarkopController::class, 'getCurrentUser']);

    // Products
    Route::get('/products', [WarkopController::class, 'getProducts']);
    Route::post('/products', [WarkopController::class, 'storeProduct']);
    Route::put('/products/{id}', [WarkopController::class, 'updateProduct']);
    Route::delete('/products/{id}', [WarkopController::class, 'deleteProduct']);

    // Categories
    Route::get('/categories', [WarkopController::class, 'getCategories']);
    Route::post('/categories', [WarkopController::class, 'storeCategory']);
    Route::delete('/categories/{id}', [WarkopController::class, 'deleteCategory']);

    // Sales
    Route::get('/sales', [WarkopController::class, 'getSales']);
    Route::post('/sales', [WarkopController::class, 'storeSale']);
    Route::post('/sales/{id}/void', [WarkopController::class, 'voidSale']); // Void Transaction Route

    // Expenses
    Route::get('/expenses', [WarkopController::class, 'getExpenses']);
    Route::post('/expenses', [WarkopController::class, 'storeExpense']);
    Route::delete('/expenses/{id}', [WarkopController::class, 'deleteExpense']);

    // Inventories (Stok)
    Route::get('/inventories', [WarkopController::class, 'getInventories']);
    Route::post('/inventories', [WarkopController::class, 'storeInventory']);
    Route::put('/inventories/{id}', [WarkopController::class, 'updateInventory']);
    Route::delete('/inventories/{id}', [WarkopController::class, 'deleteInventory']);

    // User Profile Actions (Self-managed under active session)
    Route::put('/user/profile', [WarkopController::class, 'updateProfile']);
    Route::put('/user/password', [WarkopController::class, 'updatePassword']);
    Route::post('/user/photo', [WarkopController::class, 'updatePhoto']);
    Route::delete('/user/photo', [WarkopController::class, 'deletePhoto']);
});

