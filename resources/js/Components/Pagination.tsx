import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    currentPage: number;
    lastPage: number;
}

export default function Pagination({ links, currentPage, lastPage }: PaginationProps) {
    if (lastPage <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-1 mt-6">
            {links.map((link, index) => {
                const label = decodeLabel(link.label);
                const isEllipsis = label === '...';

                if (isEllipsis) {
                    return (
                        <span
                            key={index}
                            className="px-3 py-2 text-sm text-gray-500 select-none"
                        >
                            …
                        </span>
                    );
                }

                if (!link.url) {
                    return (
                        <span
                            key={index}
                            className="px-3 py-2 text-sm text-gray-600 rounded-lg cursor-not-allowed select-none"
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            link.active
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

function decodeLabel(label: string): string {
    return label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .trim();
}
