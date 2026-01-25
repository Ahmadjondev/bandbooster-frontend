'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ExternalLink, Sparkles } from 'lucide-react';

import { Button, Card, Input, AnimatedAlert } from '@/components/ui';
import { useTelegramBotInfo, useTelegramVerify } from '@/domains/auth';
import { staggerContainer, staggerItem } from '@/lib/animations';

// Default bot info in case API is loading or fails
const DEFAULT_BOT_USERNAME = 'BandBoosterBot';
const DEFAULT_BOT_URL = 'https://t.me/BandBoosterBot';

export default function TelegramAuthPage() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { data: botInfo } = useTelegramBotInfo();

    const verifyMutation = useTelegramVerify({
        onSuccess: (session) => {
            setSuccess(true);

            // Redirect based on user state
            setTimeout(() => {
                if (!session.user.isVerified) {
                    router.push('/verify-email');
                } else if (!session.user.onboardingCompleted) {
                    router.push('/onboarding');
                } else if (session.user.role === 'MANAGER') {
                    router.push('/manager');
                } else if (session.user.role === 'TEACHER') {
                    router.push('/teacher');
                } else {
                    router.push('/dashboard');
                }
            }, 2000);
        },
        onError: (err) => {
            setError(err.message || 'Invalid verification code');
        },
    });

    const handleOpenBot = () => {
        const url = botInfo?.botUrl || DEFAULT_BOT_URL;
        window.open(url, '_blank');
    };

    const handleVerify = () => {
        if (!code.trim()) {
            setError('Please enter your verification code');
            return;
        }
        setError('');
        verifyMutation.mutate(code.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0088cc]/5 dark:bg-neutral-950">
            {/* Telegram-themed background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 -left-20 w-80 h-80 bg-[#0088cc]/20 rounded-full blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#0088cc]/10 rounded-full blur-3xl"
                    animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <motion.div
                className="relative z-10 w-full max-w-md px-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <Card variant="glass" className="p-8">
                    <AnimatePresence mode="wait">
                        {/* Success State */}
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                >
                                    <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                                </motion.div>

                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Successfully Verified!
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    Your Telegram account has been connected.
                                    <br />
                                    Redirecting you now...
                                </p>

                                <motion.div
                                    className="flex items-center justify-center gap-2 text-[#0088cc]"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Setting up your account</span>
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* Main Content */
                            <motion.div
                                key="main"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Telegram Icon */}
                                <motion.div
                                    variants={staggerItem}
                                    className="flex justify-center"
                                >
                                    <motion.div
                                        className="w-20 h-20 rounded-full bg-[#0088cc] flex items-center justify-center"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                                        </svg>
                                    </motion.div>
                                </motion.div>

                                {/* Header */}
                                <motion.div variants={staggerItem} className="text-center">
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                        Sign in with Telegram
                                    </h1>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Get your verification code from our bot
                                    </p>
                                </motion.div>

                                {/* Open Bot Button */}
                                <motion.div variants={staggerItem}>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white"
                                        onClick={handleOpenBot}
                                    >
                                        Open Telegram Bot
                                        <ExternalLink className="w-5 h-5 ml-2" />
                                    </Button>
                                </motion.div>

                                {/* Divider */}
                                <motion.div variants={staggerItem} className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">then</span>
                                    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                                </motion.div>

                                {/* Error Alert */}
                                <motion.div variants={staggerItem}>
                                    <AnimatedAlert
                                        show={!!error}
                                        variant="error"
                                        dismissible
                                        onDismiss={() => setError('')}
                                    >
                                        {error}
                                    </AnimatedAlert>
                                </motion.div>

                                {/* Code Input */}
                                <motion.div variants={staggerItem}>
                                    <Input
                                        type="text"
                                        label="Verification Code"
                                        placeholder="Enter 6-digit code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        autoComplete="off"
                                        maxLength={6}
                                    />
                                </motion.div>

                                {/* Verify Button */}
                                <motion.div variants={staggerItem}>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                                        isLoading={verifyMutation.isPending}
                                        disabled={!code.trim()}
                                        onClick={handleVerify}
                                    >
                                        Verify & Sign In
                                    </Button>
                                </motion.div>

                                {/* Back to Login */}
                                <motion.div variants={staggerItem} className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </Link>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}
