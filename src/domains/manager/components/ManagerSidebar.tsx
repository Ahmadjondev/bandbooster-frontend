'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// ICONS
// ============================================================================

const icons = {
    dashboard: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    reading: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
        </svg>
    ),
    listening: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
    ),
    extract: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    ),
    chevronLeft: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    ),
    chevronRight: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
};

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: keyof typeof icons;
    color?: string;
    badge?: string;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

const navigation: NavSection[] = [
    {
        items: [
            { id: 'dashboard', label: 'Dashboard', href: '/manager', icon: 'dashboard' },
        ],
    },
    {
        title: 'Content',
        items: [
            { id: 'reading', label: 'Reading Passages', href: '/manager/reading', icon: 'reading', color: 'text-emerald-500' },
            { id: 'listening', label: 'Listening Parts', href: '/manager/listening', icon: 'listening', color: 'text-blue-500' },
        ],
    },
    {
        title: 'Tools',
        items: [
            { id: 'extract', label: 'Extract Content', href: '/manager/extract', icon: 'extract', color: 'text-purple-500' },
        ],
    },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface ManagerSidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function ManagerSidebar({ isCollapsed = false, onToggleCollapse }: ManagerSidebarProps) {
    const pathname = usePathname();
    const [localCollapsed, setLocalCollapsed] = useState(false);

    const collapsed = isCollapsed || localCollapsed;
    const handleToggle = onToggleCollapse || (() => setLocalCollapsed(!localCollapsed));

    const isActive = (href: string) => {
        if (href === '/manager') {
            return pathname === '/manager';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={cn(
                'flex flex-col bg-surface border-r border-border transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Toggle Button */}
            <div className="flex items-center justify-end p-2 border-b border-border">
                <button
                    onClick={handleToggle}
                    className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <icons.chevronRight className="w-4 h-4" />
                    ) : (
                        <icons.chevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                {navigation.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-4">
                        {/* Section Title */}
                        <AnimatePresence>
                            {section.title && !collapsed && (
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
                                >
                                    {section.title}
                                </motion.h3>
                            )}
                        </AnimatePresence>

                        {/* Section Items */}
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = icons[item.icon];
                                const active = isActive(item.href);

                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                                collapsed ? 'justify-center' : '',
                                                active
                                                    ? 'bg-primary-500/10 text-primary-500'
                                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                                            )}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <Icon
                                                className={cn(
                                                    'w-5 h-5 flex-shrink-0',
                                                    active ? 'text-primary-500' : item.color || ''
                                                )}
                                            />
                                            <AnimatePresence>
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: 'auto' }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        className="whitespace-nowrap overflow-hidden"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                            {item.badge && !collapsed && (
                                                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-500 rounded">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-text-muted text-center"
                        >
                            Manager Panel
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
}
