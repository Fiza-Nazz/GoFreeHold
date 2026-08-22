<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Item extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category', 'brand', 'remark'];

    public function unitItems(): HasMany
    {
        return $this->hasMany(UnitItem::class);
    }

    public function store(): HasOne
    {
        return $this->hasOne(ItemStore::class);
    }
}
