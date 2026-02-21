import { Head } from '@inertiajs/react';

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
}

export default function Show({ bio }: Props) {
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
                                        <h2
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: theme.textColor || '#ffffff',
                                                margin: 0,
                                                letterSpacing: '0.02em',
                                            }}
                                        >
                                            {widget.content.text}
                                        </h2>
                                    </div>
                                );
                            }

                            if (widget.type === 'text') {
                                return (
                                    <div key={widget.id} style={{ padding: '4px 0', textAlign: 'center' }}>
                                        <p
                                            style={{
                                                fontSize: '14px',
                                                color: theme.textColor || '#ffffff',
                                                opacity: 0.7,
                                                margin: 0,
                                                lineHeight: '1.6',
                                                maxWidth: '480px',
                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                            }}
                                        >
                                            {widget.content.text}
                                        </p>
                                    </div>
                                );
                            }

                            if (widget.type === 'social') {
                                const platforms: SocialPlatform[] = widget.content.platforms || [];
                                return (
                                    <div
                                        key={widget.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '16px',
                                            padding: '12px 0',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {platforms.map((platform, i) => (
                                            <a
                                                key={i}
                                                href={platform.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={platform.name}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '50%',
                                                    background: (theme.textColor || '#ffffff') + '15',
                                                    color: theme.textColor || '#ffffff',
                                                    transition: 'all 0.2s ease',
                                                    textDecoration: 'none',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = platform.color;
                                                    e.currentTarget.style.color = '#ffffff';
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = (theme.textColor || '#ffffff') + '15';
                                                    e.currentTarget.style.color = theme.textColor || '#ffffff';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d={platform.icon} />
                                                </svg>
                                            </a>
                                        ))}
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
                                margin: 0,
                            }}
                        >
                            Powered by Brevio
                        </p>
                    </div>
                </div>

                {/* Custom CSS */}
                {bio.custom_css && <style dangerouslySetInnerHTML={{ __html: bio.custom_css }} />}
            </div>
        </>
    );
}
