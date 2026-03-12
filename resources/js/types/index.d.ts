export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'admin' | 'user';
    username?: string;
    avatar?: string;
    plan_id?: number;
    api_key?: string;
    is_banned: boolean;
    is_verified: boolean;
    bio?: string;
    country?: string;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
    plan?: Plan;
}

export interface Url {
    id: number;
    user_id?: number;
    alias: string;
    url: string;
    title?: string;
    description?: string;
    is_active: boolean;
    is_archived: boolean;
    total_clicks: number;
    expiry_date?: string;
    created_at: string;
    user?: User;
}

export interface Plan {
    id: number;
    name: string;
    slug: string;
    description?: string;
    free: boolean;
    price_monthly: number;
    price_yearly: number;
    limits: Record<string, number>;
    features: Record<string, boolean>;
    is_active: boolean;
}

export interface Click {
    id: number;
    url_id: number;
    country?: string;
    city?: string;
    browser?: string;
    os?: string;
    device?: string;
    referrer?: string;
    created_at: string;
}

export interface Bio {
    id: number;
    user_id: number;
    name: string;
    alias: string;
    is_active: boolean;
    views: number;
    created_at: string;
}

export interface QrCode {
    id: number;
    user_id: number;
    name: string;
    type: string;
    scans: number;
    created_at: string;
}

export interface Campaign {
    id: number;
    name: string;
    slug?: string;
    urls_count?: number;
}

export interface Domain {
    id: number;
    domain: string;
    status: 'active' | 'pending' | 'disabled';
}

export interface Overlay {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
}

export interface Pixel {
    id: number;
    name: string;
    provider: string;
    pixel_id: string;
}

export interface Report {
    id: number;
    url_id: number;
    reason: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    url?: Url;
    created_at: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface AnalyticsSummary {
    total_clicks: number;
    unique_clicks: number;
    avg_daily: number;
}

export interface TimeSeriesPoint {
    date: string;
    count: number;
}

export interface BreakdownItem {
    name: string;
    count: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    app_version?: string;
};
