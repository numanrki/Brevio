import {
    FaXTwitter, FaInstagram, FaFacebookF, FaTiktok, FaYoutube, FaLinkedinIn,
    FaGithub, FaDiscord, FaTwitch, FaSnapchat, FaPinterestP, FaRedditAlien,
    FaTelegram, FaWhatsapp, FaEnvelope, FaGlobe,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';

export interface SocialPlatformConfig {
    icon: IconType;
    color: string;
    label: string;
}

export const SOCIAL_ICON_MAP: Record<string, SocialPlatformConfig> = {
    twitter:   { icon: FaXTwitter,    color: '#000000', label: 'X (Twitter)' },
    instagram: { icon: FaInstagram,   color: '#E4405F', label: 'Instagram' },
    facebook:  { icon: FaFacebookF,   color: '#1877F2', label: 'Facebook' },
    tiktok:    { icon: FaTiktok,      color: '#000000', label: 'TikTok' },
    youtube:   { icon: FaYoutube,     color: '#FF0000', label: 'YouTube' },
    linkedin:  { icon: FaLinkedinIn,  color: '#0A66C2', label: 'LinkedIn' },
    github:    { icon: FaGithub,      color: '#181717', label: 'GitHub' },
    discord:   { icon: FaDiscord,     color: '#5865F2', label: 'Discord' },
    twitch:    { icon: FaTwitch,      color: '#9146FF', label: 'Twitch' },
    snapchat:  { icon: FaSnapchat,    color: '#FFFC00', label: 'Snapchat' },
    pinterest: { icon: FaPinterestP,  color: '#BD081C', label: 'Pinterest' },
    reddit:    { icon: FaRedditAlien, color: '#FF4500', label: 'Reddit' },
    telegram:  { icon: FaTelegram,    color: '#26A5E4', label: 'Telegram' },
    whatsapp:  { icon: FaWhatsapp,    color: '#25D366', label: 'WhatsApp' },
    email:     { icon: FaEnvelope,    color: '#EA4335', label: 'Email' },
    website:   { icon: FaGlobe,       color: '#7c3aed', label: 'Website' },
};

/**
 * Renders a social icon for a given platform name.
 * Falls back to first 2 letters if platform not found.
 */
export function SocialIcon({ platform, size = 18, color }: { platform: string; size?: number; color?: string }) {
    const config = SOCIAL_ICON_MAP[platform.toLowerCase()];
    if (!config) {
        return <span style={{ fontSize: size * 0.65, fontWeight: 600, textTransform: 'uppercase' }}>{platform.substring(0, 2)}</span>;
    }
    const Icon = config.icon;
    return <Icon size={size} color={color} />;
}
