'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';

import { Button, Card, Logo, AnimatedAlert } from '@/components/ui';
import { OTPInput, CountdownTimer } from '@/domains/auth/components';
import { useSendVerificationCode, useVerifyEmailCode } from '@/domains/auth';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function VerifyEmailPage() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(Array(4).fill(''));
    const [email, setEmail] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // Get email from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData?.email) {
                    setEmail(userData.email);
                }
            } catch {
                // Ignore parsing errors
            }
        }
        // Send verification code on mount
        sendCodeMutation.mutate();
    }, []);

    const sendCodeMutation = useSendVerificationCode({
        onSuccess: () => {
            setSuccess('Verification code sent to your email');
            setCanResend(false);
            setTimeout(() => setSuccess(''), 5000);
        },
        onError: (err) => {
            setError(err.message || 'Failed to send verification code');
        },
    });

    const verifyCodeMutation = useVerifyEmailCode({
        onSuccess: () => {
            setIsVerified(true);
            setSuccess('Email verified successfully!');
            // Redirect to onboarding after short delay
            setTimeout(() => {
                router.push('/onboarding');
            }, 2000);
        },
        onError: (err) => {
            setError(err.message || 'Invalid verification code');
            setCode(Array(4).fill(''));
        },
    });

    const handleCodeComplete = (completedCode: string) => {
        setError('');
        verifyCodeMutation.mutate(completedCode);
    };

    const handleResend = () => {
        setError('');
        sendCodeMutation.mutate();
    };

    const maskEmail = (email: string) => {
        const [local, domain] = email.split('@');
        const maskedLocal = local.length > 2
            ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
            : local;
        return `${maskedLocal}@${domain}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-neutral-50 to-primary-50 dark:from-neutral-950 dark:to-neutral-900">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-300/30 dark:bg-primary-600/20 rounded-full blur-3xl"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-300/30 dark:bg-accent-600/20 rounded-full blur-3xl"
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
                    {/* Logo */}
                    <motion.div variants={staggerItem} className="text-center mb-6">
                        <Link href="/">
                            <Logo size="md" className="mx-auto" />
                        </Link>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {!isVerified ? (
                            <motion.div
                                key="verification-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Icon */}
                                <motion.div
                                    variants={staggerItem}
                                    className="flex justify-center"
                                >
                                    <motion.div
                                        className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Mail className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                                    </motion.div>
                                </motion.div>

                                {/* Header */}
                                <motion.div variants={staggerItem} className="text-center">
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                        Check Your Email
                                    </h1>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        We've sent a verification code to
                                        <br />
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            {email ? maskEmail(email) : 'your email'}
                                        </span>
                                    </p>
                                </motion.div>

                                {/* Alerts */}
                                <motion.div variants={staggerItem}>
                                    <AnimatedAlert
                                        show={!!error}
                                        variant="error"
                                        dismissible
                                        onDismiss={() => setError('')}
                                    >
                                        {error}
                                    </AnimatedAlert>
                                    <AnimatedAlert
                                        show={!!success && !error}
                                        variant="success"
                                    >
                                        {success}
                                    </AnimatedAlert>
                                </motion.div>

                                {/* OTP Input */}
                                <motion.div variants={staggerItem}>
                                    <OTPInput
                                        length={4}
                                        value={code}
                                        onChange={setCode}
                                        onComplete={handleCodeComplete}
                                        disabled={verifyCodeMutation.isPending}
                                        error={!!error}
                                    />
                                </motion.div>

                                {/* Verify Button */}
                                <motion.div variants={staggerItem}>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        isLoading={verifyCodeMutation.isPending}
                                        disabled={code.some(c => !c)}
                                        onClick={() => handleCodeComplete(code.join(''))}
                                    >
                                        Verify Email
                                    </Button>
                                </motion.div>

                                {/* Resend */}
                                <motion.div variants={staggerItem} className="text-center space-y-3">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Didn't receive the code?
                                    </p>
                                    {canResend ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResend}
                                            isLoading={sendCodeMutation.isPending}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Resend Code
                                        </Button>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                            <span>Resend available in</span>
                                            <CountdownTimer
                                                seconds={60}
                                                onComplete={() => setCanResend(true)}
                                                className="font-semibold text-primary-600 dark:text-primary-400"
                                            />
                                        </div>
                                    )}
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
                        ) : (
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
                                    <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                                </motion.div>

                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Email Verified!
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    Your email has been verified successfully.
                                    <br />
                                    Redirecting to complete your profile...
                                </p>

                                <motion.div
                                    className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Setting up your account</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}
