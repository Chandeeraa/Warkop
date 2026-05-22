<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->date('date');
            $table->string('time');
            $table->integer('manual_amount')->default(0);
            $table->text('notes')->nullable();
            $table->integer('total_amount');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
