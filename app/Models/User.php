<?php

namespace App\Models;

use App\Traits\HasTwoFactor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasTwoFactor;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_banned',
        'is_verified',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'is_banned' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function urls(): HasMany
    {
        return $this->hasMany(Url::class);
    }

    public function clicks(): HasManyThrough
    {
        return $this->hasManyThrough(Click::class, Url::class);
    }

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function channels(): HasMany
    {
        return $this->hasMany(Channel::class);
    }

    public function qrCodes(): HasMany
    {
        return $this->hasMany(QrCode::class);
    }

    public function bios(): HasMany
    {
        return $this->hasMany(Bio::class);
    }

    public function overlays(): HasMany
    {
        return $this->hasMany(Overlay::class);
    }

    public function splashPages(): HasMany
    {
        return $this->hasMany(SplashPage::class);
    }

    public function pixels(): HasMany
    {
        return $this->hasMany(Pixel::class);
    }
}
