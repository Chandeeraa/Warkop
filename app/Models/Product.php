<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id', 'name', 'price', 'category', 'icon', 'recipe_inventory_id', 'recipe_deduct_amount'];
}
