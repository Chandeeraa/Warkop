<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $table = 'inventories';
    protected $fillable = ['id', 'name', 'description', 'quantity', 'unit', 'threshold', 'image'];
}
