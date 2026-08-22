<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemStore extends Model
{
    use HasFactory;

    protected $table = 'item_store';

    protected $fillable = ['item_id', 'qty', 'remark'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
