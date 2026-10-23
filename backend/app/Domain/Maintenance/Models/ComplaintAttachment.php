<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ComplaintAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'uploaded_by',
    ];

    protected $appends = [
        'url',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): ?string
    {
        if (empty($this->file_path)) {
            return null;
        }

        if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
            return $this->file_path;
        }

        return Storage::disk('public')->url($this->file_path);
    }
}
