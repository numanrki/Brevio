<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FaqCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'position',
    ];

    public function faqs(): HasMany
    {
        return $this->hasMany(Faq::class);
    }
}
