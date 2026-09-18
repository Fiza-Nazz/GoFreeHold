<?php

namespace App\Domain\Auth\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    protected $attributes = ['account_status' => 'active'];
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Domain\Auth\Notifications\ResetPasswordNotification($token));
    }

    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }

    public function owner(): HasOne
    {
        return $this->hasOne(Owner::class);
    }

    public function staffMembership(): HasOne
    {
        return $this->hasOne(OwnerStaff::class);
    }

    public function revokeSessions(): void
    {
        // Historical tokens may have been issued through the compatibility alias.
        \Laravel\Sanctum\PersonalAccessToken::where('tokenable_id', $this->id)
            ->whereIn('tokenable_type', [self::class, \App\Models\User::class, $this->getMorphClass()])
            ->delete();
    }

    public function tenant(): HasOne
    {
        return $this->hasOne(Tenant::class);
    }

    public function ownerProfile(): HasOne
    {
        return $this->owner();
    }

    public function tenantProfile(): HasOne
    {
        return $this->tenant();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }
}
