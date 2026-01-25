"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Github, Linkedin, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
    label: string;
    href: string;
}

interface SocialLink {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const footerLinks: FooterLink[] = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
];

const socialLinks: SocialLink[] = [
    { label: "Twitter", href: "https://twitter.com", icon: Twitter },
    { label: "GitHub", href: "https://github.com", icon: Github },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export const Footer = () => {
    const currentYear = 2026;

    return (
        <footer className="relative bg-neutral-100 dark:bg-neutral-950 border-t border-neutral-200 dark:border-white/5">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-primary-50 dark:from-primary-950/10 to-transparent pointer-events-none" />

            <div className="relative container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="py-16 md:py-20">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <Link href="/" className="inline-flex items-center gap-2 group mb-6">
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <Sparkles className="w-5 h-5 text-white" />
                                </motion.div>
                                <span className="text-xl font-bold text-neutral-900 dark:text-white">Bandbooster</span>
                            </Link>
                            <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mb-8 leading-relaxed">
                                AI-powered IELTS preparation platform. Master all four modules with personalized
                                feedback and achieve your dream band score.
                            </p>

                            {/* Newsletter */}
                            <div className="max-w-sm">
                                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Stay updated</p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-xl",
                                            "bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10",
                                            "text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                                            "focus:outline-none focus:border-primary-500 dark:focus:border-primary-500/50 focus:bg-white dark:focus:bg-white/[0.07]",
                                            "transition-all duration-300"
                                        )}
                                    />
                                    <button
                                        className={cn(
                                            "px-4 py-3 rounded-xl",
                                            "bg-linear-to-r from-primary-500 to-accent-500",
                                            "hover:from-primary-400 hover:to-accent-400",
                                            "text-white transition-all duration-300"
                                        )}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Links Column */}
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-6 uppercase tracking-wider">Quick Links</h4>
                            <ul className="space-y-4">
                                {footerLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-6 uppercase tracking-wider">Connect</h4>
                            <div className="flex items-center gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.label}
                                            className={cn(
                                                "w-11 h-11 rounded-xl flex items-center justify-center",
                                                "bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10",
                                                "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
                                                "hover:bg-neutral-50 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-white/20",
                                                "transition-all duration-300"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    );
                                })}
                            </div>

                            <div className="mt-8">
                                <p className="text-sm text-neutral-500 mb-2">Questions?</p>
                                <a
                                    href="mailto:support@bandbooster.uz"
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                                >
                                    support@bandbooster.uz
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-neutral-200 dark:border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-neutral-500">
                            © {currentYear} Bandbooster AI. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
