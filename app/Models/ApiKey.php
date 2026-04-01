<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'key',
        'key_encrypted',
        'key_prefix',
        'scopes',
        'is_active',
        'last_used_at',
        'expires_at',
    ];

    protected $hidden = [
        'key',
        'key_encrypted',
    ];

    protected function casts(): array
    {
        return [
            'key_encrypted' => 'encrypted',
            'scopes' => 'array',
            'is_active' => 'boolean',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function getPlainKey(): string
    {
        return $this->key_encrypted;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hasScope(string $scope): bool
    {
        return in_array($scope, $this->scopes ?? [], true);
    }
}
