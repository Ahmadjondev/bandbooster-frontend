'use client';

import { useState, useLayoutEffect, startTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// ============================================================================
// ICONS
// ============================================================================

const icons = {
    logo: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),
    classroom: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            <path d="M6 8h2" />
            <path d="M6 12h2" />
            <path d="M16 8h2" />
            <path d="M16 12h2" />
        </svg>
    ),
    users: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    clipboard: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
    ),
    checkSquare: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    ),
    barChart: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    ),
    arrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    ),
    bell: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    ),
    user: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    menu: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    ),
    x: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    ),
};

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: keyof typeof icons;
    badge?: string | number;
}

const teacherNavigation: NavItem[] = [
    { id: 'classrooms', label: 'My Classrooms', href: '/teacher/classroom', icon: 'classroom' },
    { id: 'grading', label: 'Grading Queue', href: '/teacher/grading', icon: 'checkSquare', badge: 'Soon' },
    { id: 'analytics', label: 'Analytics', href: '/teacher/analytics', icon: 'barChart', badge: 'Soon' },
];

// ============================================================================
// TEACHER NAVBAR
// ============================================================================

function TeacherNavbar({ onMenuToggle, isMobileMenuOpen }: { onMenuToggle: () => void; isMobileMenuOpen: boolean }) {
    const pathname = usePathname();

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'fixed top-0 left-0 right-0 z-40 h-16',
                'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
                'border-b border-neutral-200 dark:border-neutral-800'
            )}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-screen-2xl mx-auto">
                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-6">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        {isMobileMenuOpen ? (
                            <icons.x className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        ) : (
                            <icons.menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        )}
                    </button>

                    {/* Logo */}
                    <Link href="/teacher/classroom" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <icons.logo className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-bold text-neutral-900 dark:text-white">BandBooster</span>
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
                                Teacher
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {teacherNavigation.map((item) => {
                            const Icon = icons[item.icon];
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                            return (
                                <Link key={item.id} href={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Back to Dashboard */}
                    <Link href="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            )}
                        >
                            <icons.arrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Student Dashboard</span>
                        </motion.button>
                    </Link>

                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

                    {/* Theme Toggle */}
                    <ThemeToggle size="sm" />

                    {/* Notifications */}
                    <button
                        className={cn(
                            'relative p-2 rounded-lg transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        )}
                    >
                        <icons.bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                    </button>

                    {/* Profile */}
                    <button
                        className={cn(
                            'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        )}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <icons.user className="w-4 h-4 text-white" />
                        </div>
                    </button>
                </div>
            </div>
        </motion.header>
    );
}

// ============================================================================
// MOBILE MENU
// ============================================================================

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    />

                    {/* Menu */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={cn(
                            'fixed top-16 left-0 bottom-0 z-30 w-72',
                            'bg-white dark:bg-neutral-900',
                            'border-r border-neutral-200 dark:border-neutral-800',
                            'lg:hidden'
                        )}
                    >
                        <nav className="p-4 space-y-1">
                            {teacherNavigation.map((item) => {
                                const Icon = icons[item.icon];
                                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                                return (
                                    <Link key={item.id} href={item.href} onClick={onClose}>
                                        <div
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                                                isActive
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                            {item.badge && (
                                                <span className="ml-auto px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}

                            <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <Link href="/dashboard" onClick={onClose}>
                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                        <icons.arrowLeft className="w-5 h-5" />
                                        <span className="font-medium">Back to Student Dashboard</span>
                                    </div>
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// TEACHER LAYOUT
// ============================================================================

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change using transition to avoid blocking
    const pathname = usePathname();

    useLayoutEffect(() => {
        startTransition(() => {
            setIsMobileMenuOpen(false);
        });
    }, [pathname]);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <TeacherNavbar
                onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isMobileMenuOpen={isMobileMenuOpen}
            />
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <main className="pt-16">
                <div className="max-w-screen-2xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
