<?php
namespace App\Domain\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class OwnerStaff extends Model
{
    protected $table = 'owner_staff';
    protected $guarded = ['id'];
    public function user() { return $this->belongsTo(User::class); }
    public function owner() { return $this->belongsTo(Owner::class); }
    public function invitations() { return $this->hasMany(StaffInvitation::class); }
}
