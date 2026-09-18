<?php
namespace App\Domain\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class StaffInvitation extends Model
{
    protected $guarded = ['id'];
    protected $hidden = ['token_hash'];
    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'accepted_at' => 'datetime', 'revoked_at' => 'datetime'];
    }
    public function staff() { return $this->belongsTo(OwnerStaff::class, 'owner_staff_id'); }
}
