<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id', 'date', 'time', 'manual_amount', 'notes', 'total_amount', 'status'];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }
}
