import { ZevClient } from '../client';

export interface TrackPageViewOptions {
    /** Current page path (e.g. "/products/awesome-shirt") */
    page: string;
    /** Optional referrer URL */
    referrer?: string;
}

export class AnalyticsClient {
    private sessionId: string | null = null;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private lastPage: string = '';

    constructor(private client: ZevClient) { }

    /**
     * Derives the API base URL from the GraphQL endpoint.
     * e.g. "https://api.example.com/graphql/v1" → "https://api.example.com"
     */
    private getBaseUrl(): string {
        const endpoint = this.client.getEndpoint();
        const url = new URL(endpoint);
        return url.origin;
    }

    /**
     * Returns the tracking endpoint URL.
     */
    private getTrackUrl(): string {
        return `${this.getBaseUrl()}/api/v1/analytics-live/track/headless`;
    }

    /**
     * Gets or creates a session ID. Uses sessionStorage in the browser,
     * or generates a random ID per client instance for server-side usage.
     */
    public getSessionId(): string {
        if (this.sessionId) return this.sessionId;

        // Try sessionStorage (browser)
        if (typeof sessionStorage !== 'undefined') {
            try {
                const key = '__zev_sid';
                let sid = sessionStorage.getItem(key);
                if (!sid) {
                    sid = crypto.randomUUID();
                    sessionStorage.setItem(key, sid);
                }
                this.sessionId = sid;
                return sid;
            } catch {
                // sessionStorage not available (SSR, etc.)
            }
        }

        // Fallback: per-instance ID
        this.sessionId = crypto.randomUUID();
        return this.sessionId;
    }

    /**
     * Tracks a page view. Sends the event to the analytics endpoint
     * using fetch with keepalive for reliable delivery.
     */
    public trackPageView(options: TrackPageViewOptions): void {
        const { page, referrer } = options;
        const apiKey = this.client.getPublicKey();
        if (!apiKey) return; // Can't track without a public key

        const url = this.getTrackUrl();
        const body = JSON.stringify({
            sessionId: this.getSessionId(),
            page,
            ...(referrer ? { referrer } : {}),
        });

        try {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Storefront-Access-Token': apiKey,
                },
                body,
                keepalive: true,
            }).catch(() => {
                // Silently fail — analytics should never break the app
            });
        } catch {
            // Silently fail
        }
    }

    /**
     * Starts automatic page tracking with heartbeat.
     * Call this once when the page changes. It will:
     * 1. Send an immediate page view event
     * 2. Start a 30-second heartbeat to keep the session alive
     *
     * Call again on route change — the previous heartbeat is automatically stopped.
     */
    public startPageTracking(page: string, referrer?: string): void {
        // Stop any existing heartbeat
        this.stopHeartbeat();

        // Send initial page view if the page changed
        if (page !== this.lastPage) {
            this.lastPage = page;
            this.trackPageView({ page, referrer });
        }

        // Start heartbeat (30 seconds)
        this.heartbeatInterval = setInterval(() => {
            this.trackPageView({ page });
        }, 30_000);
    }

    /**
     * Stops the heartbeat interval. Call this on component unmount.
     */
    public stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}
