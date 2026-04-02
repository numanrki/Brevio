<?php

namespace App\Http\Controllers;

use App\Models\LiveVisitor;
use App\Models\Pixel;
use App\Models\PixelFire;
use Illuminate\Http\Request;
use Stevebauman\Location\Facades\Location;

class PixelFireController extends Controller
{
    /**
     * Fire a pixel via 1x1 transparent GIF.
     * GET /pixel/{token}.gif
     */
    public function image(Request $request, string $token)
    {
        $this->fire($request, $token);

        // Return 1x1 transparent GIF
        $gif = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        return response($gif, 200, [
            'Content-Type' => 'image/gif',
            'Content-Length' => strlen($gif),
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * Fire a pixel via JS snippet.
     * GET /pixel/{token}.js
     */
    public function script(Request $request, string $token)
    {
        $this->fire($request, $token);

        $baseUrl = url("/pixel/{$token}.gif");

        $js = <<<JS
/* Brevio Pixel */
(function(){
  var d=new Date();
  var p=[];
  p.push('t='+d.getTime());
  p.push('url='+encodeURIComponent(window.location.href));
  p.push('ref='+encodeURIComponent(document.referrer||''));
  p.push('title='+encodeURIComponent(document.title||''));
  p.push('sw='+screen.width+'&sh='+screen.height);
  p.push('lang='+(navigator.language||''));
  try{p.push('tz='+encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone));}catch(e){}
  var u=new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(function(k){
    if(u.get(k))p.push(k+'='+encodeURIComponent(u.get(k)));
  });
  var i=new Image();
  i.src='{$baseUrl}?'+p.join('&');
})();
JS;

        return response($js, 200, [
            'Content-Type' => 'application/javascript',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }

    /**
     * Record a pixel fire.
     */
    private function fire(Request $request, string $token): void
    {
        $pixel = Pixel::where('token', $token)->where('is_active', true)->first();
        if (!$pixel) return;

        $userAgent = $request->userAgent() ?? '';
        $ip = $request->ip();
        $country = null;
        $city = null;
        $browser = $this->parseBrowser($userAgent);
        $os = $this->parseOs($userAgent);
        $device = $this->parseDevice($userAgent);

        try {
            if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
                $externalIp = @file_get_contents('https://api.ipify.org?format=text');
                if ($externalIp && filter_var(trim($externalIp), FILTER_VALIDATE_IP)) {
                    $ip = trim($externalIp);
                }
            }
            $position = Location::get($ip);
            if ($position) {
                $country = $position->countryCode;
                $city = $position->cityName;
            }
        } catch (\Throwable) {}

        $isUnique = !PixelFire::where('pixel_id', $pixel->id)
            ->where('ip', $request->ip())
            ->where('created_at', '>=', now()->subDay())
            ->exists();

        $pixel->increment('total_fires');

        // Record live visitor
        LiveVisitor::recordVisit($request, 'pixel', '/pixel/' . $token);

        // Collect tracking params from the JS pixel
        $query = $request->query();
        $utmParams = collect($query)->only(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'])->filter()->toArray();
        $extraParams = collect($query)->only(['url', 'title', 'sw', 'sh', 'lang', 'tz'])->filter()->toArray();
        $customParams = array_merge($utmParams, $extraParams);

        // Use referrer from JS pixel if available, otherwise from header
        $referrer = !empty($query['ref']) ? $query['ref'] : $request->header('referer');

        PixelFire::create([
            'pixel_id' => $pixel->id,
            'ip' => $request->ip(),
            'country' => $country,
            'city' => $city,
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
            'referrer' => $referrer,
            'user_agent' => $userAgent,
            'params' => !empty($customParams) ? $customParams : null,
            'is_unique' => $isUnique,
        ]);
    }

    private function parseBrowser(string $ua): string
    {
        if (str_contains($ua, 'Edg')) return 'Edge';
        if (str_contains($ua, 'OPR') || str_contains($ua, 'Opera')) return 'Opera';
        if (str_contains($ua, 'Chrome')) return 'Chrome';
        if (str_contains($ua, 'Safari')) return 'Safari';
        if (str_contains($ua, 'Firefox')) return 'Firefox';
        return 'Other';
    }

    private function parseOs(string $ua): string
    {
        if (str_contains($ua, 'Windows')) return 'Windows';
        if (str_contains($ua, 'Mac OS')) return 'macOS';
        if (str_contains($ua, 'Android')) return 'Android';
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) return 'iOS';
        if (str_contains($ua, 'Linux')) return 'Linux';
        return 'Other';
    }

    private function parseDevice(string $ua): string
    {
        if (str_contains($ua, 'Mobile') || str_contains($ua, 'Android')) return 'mobile';
        if (str_contains($ua, 'Tablet') || str_contains($ua, 'iPad')) return 'tablet';
        return 'desktop';
    }
}
