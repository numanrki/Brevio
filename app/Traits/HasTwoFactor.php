<?php

namespace App\Traits;

/**
 * Safely wraps Fortify's TwoFactorAuthenticatable trait.
 * If Fortify is NOT installed, all 2FA methods are no-ops
 * so the application doesn't crash with a "class not found" error.
 */
trait HasTwoFactor
{
    public function initializeHasTwoFactor(): void
    {
        if (!class_exists(\Laravel\Fortify\Fortify::class)) {
            return;
        }

        // Merge the hidden fields and casts that Fortify's trait would add
        $this->hidden = array_unique(array_merge($this->hidden, [
            'two_factor_secret',
            'two_factor_recovery_codes',
        ]));

        $this->mergeCasts([
            'two_factor_confirmed_at' => 'datetime',
        ]);
    }

    /**
     * Get the QR code SVG for 2FA setup.
     */
    public function twoFactorQrCodeSvg(): string
    {
        if (!class_exists(\BaconQrCode\Writer::class)) {
            return '';
        }

        return (string) (new \BaconQrCode\Writer(
            new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(192),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            )
        ))->writeString($this->twoFactorQrCodeUrl());
    }

    /**
     * Get the OTP auth URL for 2FA setup.
     */
    public function twoFactorQrCodeUrl(): string
    {
        if (!class_exists(\PragmaRX\Google2FA\Google2FA::class) || !$this->two_factor_secret) {
            return '';
        }

        return app(\PragmaRX\Google2FA\Google2FA::class)->getQRCodeUrl(
            config('app.name'),
            $this->email,
            decrypt($this->two_factor_secret)
        );
    }
}
