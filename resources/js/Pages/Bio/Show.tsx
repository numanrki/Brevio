import { Head } from '@inertiajs/react';
import { useCallback } from 'react';
import { SocialIcon, SOCIAL_ICON_MAP } from '@/Components/SocialIcons';

interface SocialPlatform {
    name: string;
    url: string;
    icon: string;
    color: string;
}

interface BioWidget {
    id: number;
    type: string;
    content: Record<string, any>;
    position: number;
    is_active: boolean;
}

interface Bio {
    id: number;
    name: string;
    alias: string;
    avatar?: string | null;
    theme?: Record<string, any> | null;
    seo_title?: string | null;
    seo_description?: string | null;
    custom_css?: string | null;
    widgets: BioWidget[];
}

interface Props {
    bio: Bio;
    trackUrl?: string;
}

export default function Show({ bio, trackUrl }: Props) {
    const theme = bio.theme || {
        background: '#0f0f1a',
        textColor: '#ffffff',
        buttonStyle: 'filled',
        buttonColor: '#7c3aed',
        buttonTextColor: '#ffffff',
        buttonRadius: '9999px',
        fontFamily: 'system-ui, sans-serif',
        backgroundType: 'solid',
        gradientFrom: '#7c3aed',
        gradientTo: '#ec4899',
    };

    const getBg = () => {
        if (theme.backgroundType === 'gradient') {
            return `linear-gradient(135deg, ${theme.gradientFrom || '#7c3aed'}, ${theme.gradientTo || '#ec4899'})`;
        }
        return theme.background || '#0f0f1a';
    };

    const getButtonStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            borderRadius: theme.buttonRadius || '9999px',
            fontFamily: theme.fontFamily || 'system-ui, sans-serif',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: 500,
            width: '100%',
            textAlign: 'center',
            display: 'block',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
        };
        switch (theme.buttonStyle) {
            case 'outline':
                return { ...base, background: 'transparent', border: `2px solid ${theme.buttonColor}`, color: theme.buttonColor };
            case 'soft':
                return { ...base, background: theme.buttonColor + '20', border: 'none', color: theme.buttonColor };
            case 'shadow':
                return { ...base, background: theme.buttonColor, border: 'none', color: theme.buttonTextColor, boxShadow: `0 4px 15px ${theme.buttonColor}40` };
            default:
                return { ...base, background: theme.buttonColor, border: 'none', color: theme.buttonTextColor };
        }
    };

    const pageTitle = bio.seo_title || bio.name;

    const trackClick = useCallback((widgetId: number, linkUrl: string) => {
        if (trackUrl) {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const token = csrfMeta?.getAttribute('content') || '';
            navigator.sendBeacon(trackUrl, new Blob([JSON.stringify({ widget_id: widgetId, url: linkUrl, _token: token })], { type: 'application/json' }));
        }
    }, [trackUrl]);

    const getEmbedUrl = (rawUrl: string, provider: string) => {
        if (provider === 'youtube') {
            const m = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
            return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
        }
        if (provider === 'vimeo') {
            const m = rawUrl.match(/vimeo\.com\/(\d+)/);
            return m ? `https://player.vimeo.com/video/${m[1]}` : null;
        }
        return null;
    };

    const getSpotifyEmbed = (rawUrl: string) => {
        const m = rawUrl.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([\w]+)/);
        return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
    };

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                {bio.seo_description && <meta name="description" content={bio.seo_description} />}
                <meta property="og:title" content={pageTitle} />
                {bio.seo_description && <meta property="og:description" content={bio.seo_description} />}
            </Head>

            <div
                style={{
                    background: getBg(),
                    minHeight: '100vh',
                    fontFamily: theme.fontFamily || 'system-ui, sans-serif',
                }}
            >
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 20px 64px' }}>
                    {/* Avatar & Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                        <div
                            style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                border: `3px solid ${theme.buttonColor || '#7c3aed'}`,
                                overflow: 'hidden',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {bio.avatar ? (
                                <img
                                    src={bio.avatar}
                                    alt={bio.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: `linear-gradient(135deg, ${theme.buttonColor || '#7c3aed'}, ${theme.gradientTo || theme.buttonColor || '#ec4899'})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <span style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
                                        {bio.name ? bio.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <h1
                            style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                color: theme.textColor || '#ffffff',
                                margin: '0 0 4px 0',
                                textAlign: 'center',
                            }}
                        >
                            {bio.name}
                        </h1>
                        <p
                            style={{
                                fontSize: '14px',
                                color: theme.textColor || '#ffffff',
                                opacity: 0.5,
                                margin: 0,
                                textAlign: 'center',
                            }}
                        >
                            @{bio.alias}
                        </p>
                    </div>

                    {/* Widgets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {bio.widgets.map((widget) => {
                            if (widget.type === 'link') {
                                return (
                                    <a
                                        key={widget.id}
                                        href={widget.content.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={getButtonStyle()}
                                        onClick={() => trackClick(widget.id, widget.content.url || '')}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                            e.currentTarget.style.opacity = '0.9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                    >
                                        {widget.content.title || 'Untitled Link'}
                                    </a>
                                );
                            }

                            if (widget.type === 'heading') {
                                return (
                                    <div key={widget.id} style={{ padding: '12px 0 4px', textAlign: 'center' }}>
                                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: theme.textColor || '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                                            {widget.content.text || widget.content.title}
                                        </h2>
                                    </div>
                                );
                            }

                            if (widget.type === 'text') {
                                return (
                                    <div key={widget.id} style={{ padding: '4px 0', textAlign: 'center' }}>
                                        <p style={{ fontSize: '14px', color: theme.textColor || '#ffffff', opacity: 0.7, margin: 0, lineHeight: '1.6', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                                            {widget.content.text || widget.content.title}
                                        </p>
                                    </div>
                                );
                            }

                            if (widget.type === 'divider') {
                                const divStyle = widget.content.style || 'solid';
                                if (divStyle === 'space') {
                                    return <div key={widget.id} style={{ height: '24px' }} />;
                                }
                                return (
                                    <div key={widget.id} style={{ padding: '8px 0' }}>
                                        <hr style={{ border: 'none', borderTop: `1px ${divStyle} ${(theme.textColor || '#ffffff') + '25'}`, margin: 0 }} />
                                    </div>
                                );
                            }

                            if (widget.type === 'image') {
                                const imgEl = (
                                    <img
                                        src={widget.content.url}
                                        alt={widget.content.alt || ''}
                                        style={{ width: '100%', borderRadius: '12px', display: 'block' }}
                                    />
                                );
                                if (widget.content.link) {
                                    return (
                                        <a key={widget.id} href={widget.content.link} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(widget.id, widget.content.link)}>
                                            {imgEl}
                                        </a>
                                    );
                                }
                                return <div key={widget.id}>{imgEl}</div>;
                            }

                            if (widget.type === 'social') {
                                const platforms: SocialPlatform[] = widget.content.platforms || [];
                                // Support both array format and object format
                                const platformList: { name: string; url: string }[] = Array.isArray(platforms)
                                    ? platforms
                                    : Object.entries(platforms).filter(([, v]) => v).map(([k, v]) => ({ name: k, url: v as string }));
                                return (
                                    <div key={widget.id} style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '12px 0', flexWrap: 'wrap' }}>
                                        {platformList.map((platform, i) => (
                                            <a
                                                key={i}
                                                href={platform.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={platform.name}
                                                onClick={() => trackClick(widget.id, platform.url)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '44px', height: '44px', borderRadius: '50%',
                                                    background: SOCIAL_ICON_MAP[platform.name.toLowerCase()]?.color || ((theme.textColor || '#ffffff') + '15'),
                                                    color: '#ffffff',
                                                    transition: 'all 0.2s ease', textDecoration: 'none',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.opacity = '0.8'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                                            >
                                                <SocialIcon platform={platform.name} size={20} color="#ffffff" />
                                            </a>
                                        ))}
                                    </div>
                                );
                            }

                            if (widget.type === 'video') {
                                const embedUrl = getEmbedUrl(widget.content.url || '', widget.content.provider || 'youtube');
                                if (!embedUrl) return null;
                                return (
                                    <div key={widget.id} style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
                                        <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                    </div>
                                );
                            }

                            if (widget.type === 'spotify') {
                                const spotifyEmbed = getSpotifyEmbed(widget.content.url || '');
                                if (!spotifyEmbed) return null;
                                return (
                                    <div key={widget.id} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                        <iframe src={spotifyEmbed} style={{ width: '100%', height: widget.content.type === 'track' ? '80px' : '380px', border: 'none' }} allow="encrypted-media" />
                                    </div>
                                );
                            }

                            if (widget.type === 'map') {
                                const addr = encodeURIComponent(widget.content.address || '');
                                if (!addr) return null;
                                return (
                                    <div key={widget.id} style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
                                        <iframe src={`https://maps.google.com/maps?q=${addr}&output=embed`} style={{ width: '100%', height: '100%', border: 'none' }} loading="lazy" />
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>

                    {/* Powered by */}
                    <div style={{ textAlign: 'center', marginTop: '48px' }}>
                        <p
                            style={{
                                fontSize: '11px',
                                color: theme.textColor || '#ffffff',
                                opacity: 0.25,
                                margin: '0 0 4px 0',
                            }}
                        >
                            Powered by{' '}
                            <a
                                href="https://github.com/numanrki/Brevio"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                                Brevio
                            </a>
                        </p>
                        <p
                            style={{
                                fontSize: '10px',
                                color: theme.textColor || '#ffffff',
                                opacity: 0.2,
                                margin: 0,
                            }}
                        >
                            Designed & Developed by{' '}
                            <a
                                href="https://x.com/numanrki"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                                Numan Rasheed
                            </a>
                        </p>
                    </div>
                </div>

                {/* Custom CSS */}
                {bio.custom_css && <style dangerouslySetInnerHTML={{ __html: bio.custom_css }} />}
            </div>
        </>
    );
}
