import { useEffect } from 'react';

/**
 * Sends a heartbeat ping to track live visitors.
 * Include this component in any public page to enable live tracking.
 */
export default function Heartbeat() {
    useEffect(() => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '';

        const sendPing = () => {
            const payload = JSON.stringify({ page: window.location.pathname });
            // Use sendBeacon for reliability (works even on page unload)
            if (navigator.sendBeacon) {
                navigator.sendBeacon(baseUrl + '/heartbeat', new Blob([payload], { type: 'application/json' }));
            } else {
                fetch(baseUrl + '/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                }).catch(() => {});
            }
        };

        // Send initial ping
        sendPing();

        // Ping every 30 seconds
        const interval = setInterval(sendPing, 30000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
