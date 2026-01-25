"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ThemeToggle } from "@/components/ui";

interface NavLink {
    label: string;
    href: string;
}

const navLinks: NavLink[] = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
];

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Fixed container for the island navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
                <motion.header
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                        "relative flex items-center justify-between",
                        "px-4 py-2.5 rounded-2xl",
                        "transition-all duration-500 ease-out",
                        scrolled
                            ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-white/10 shadow-xl shadow-neutral-900/5 dark:shadow-black/20"
                            : "bg-neutral-100/50 dark:bg-white/5 backdrop-blur-md border border-neutral-200/50 dark:border-white/5",
                        "w-full max-w-4xl"
                    )}
                >
                    {/* Glow effect on scroll */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 0%, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
                        }}
                        animate={{ opacity: scrolled ? 1 : 0 }}
                    />

                    {/* Logo */}
                    <Link href="/" className="relative flex items-center gap-2 group">
                        <motion.div
                            className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <img src="/logo.png" alt="Bandbooster" className="w-full h-full object-contain" />
                        </motion.div>
                        <span className="text-lg font-bold text-neutral-900 dark:text-white hidden sm:block">
                            Bandbooster
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <motion.div key={link.href} whileHover={{ scale: 1.02 }}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-medium",
                                        "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
                                        "rounded-xl transition-all duration-300",
                                        "hover:bg-neutral-200/50 dark:hover:bg-white/10"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <ThemeToggle size="sm" />

                        <Link href="/login" className="hidden sm:block">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-white/10 rounded-xl"
                            >
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button
                                size="sm"
                                className={cn(
                                    "bg-gradient-to-r from-primary-500 to-accent-500",
                                    "hover:from-primary-400 hover:to-accent-400",
                                    "text-white font-medium rounded-xl",
                                    "shadow-lg shadow-primary-500/25",
                                    "transition-all duration-300"
                                )}
                            >
                                Get Started
                            </Button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMobileMenu}
                            className={cn(
                                "md:hidden p-2 rounded-xl",
                                "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
                                "hover:bg-neutral-200/50 dark:hover:bg-white/10 transition-colors"
                            )}
                            aria-label="Toggle menu"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isMobileMenuOpen ? "close" : "menu"}
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </motion.header>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={closeMobileMenu}
                        />

                        {/* Mobile Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "fixed top-20 left-4 right-4 z-50 md:hidden",
                                "p-6 rounded-2xl",
                                "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl",
                                "border border-neutral-200 dark:border-white/10",
                                "shadow-2xl shadow-neutral-900/10 dark:shadow-black/40"
                            )}
                        >
                            <nav className="space-y-2">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={closeMobileMenu}
                                            className={cn(
                                                "block px-4 py-3 rounded-xl",
                                                "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
                                                "hover:bg-neutral-100 dark:hover:bg-white/10 transition-all duration-200"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-white/10 space-y-3">
                                <Link href="/login" onClick={closeMobileMenu} className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={closeMobileMenu} className="block">
                                    <Button
                                        className={cn(
                                            "w-full bg-gradient-to-r from-primary-500 to-accent-500",
                                            "hover:from-primary-400 hover:to-accent-400",
                                            "text-white font-medium rounded-xl"
                                        )}
                                    >
                                        Get Started Free
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
