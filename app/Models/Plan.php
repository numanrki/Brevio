<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'free',
        'price_monthly',
        'price_yearly',
        'price_lifetime',
        'limits',
        'features',
        'position',
        'is_active',
        'stripe_monthly_id',
        'stripe_yearly_id',
        'paddle_monthly_id',
        'paddle_yearly_id',
    ];

    protected function casts(): array
    {
        return [
            'limits' => 'array',
            'features' => 'array',
            'free' => 'boolean',
            'is_active' => 'boolean',
            'price_monthly' => 'decimal:2',
            'price_yearly' => 'decimal:2',
            'price_lifetime' => 'decimal:2',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
