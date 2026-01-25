'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

import { Button, Input, Card, Divider, AnimatedAlert } from '@/components/ui';
import { GoogleAuthButton } from '@/domains/auth/components';
import { useLogin } from '@/domains/auth';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const loginMutation = useLogin({
        onSuccess: (session) => {
            // Check if email verification is needed
            if (session.user.role === 'STUDENT' && !session.user.isVerified) {
                router.push('/verify-email');
                return;
            }

            // Check if onboarding is needed
            if (!session.user.onboardingCompleted) {
                router.push('/onboarding');
                return;
            }

            // Redirect based on role
            if (session.user.role === 'MANAGER') {
                router.push('/manager');
            } else if (session.user.role === 'TEACHER') {
                router.push('/teacher');
            } else {
                router.push('/dashboard');
            }
        },
        onError: (error) => {
            setGeneralError(error.message || 'Invalid credentials. Please try again.');
        },
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username or email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) return;

        loginMutation.mutate({
            username: formData.username,
            password: formData.password,
        });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-neutral-950">
                <motion.div
                    className="w-full max-w-md"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div variants={staggerItem} className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Sign in to continue your IELTS preparation journey
                        </p>
                    </motion.div>

                    {/* Error Alert */}
                    <motion.div variants={staggerItem}>
                        <AnimatedAlert
                            show={!!generalError}
                            variant="error"
                            title="Login Failed"
                            dismissible
                            onDismiss={() => setGeneralError('')}
                        >
                            {generalError}
                        </AnimatedAlert>
                    </motion.div>

                    {/* Login Form */}
                    <motion.form
                        variants={staggerItem}
                        onSubmit={handleSubmit}
                        className="space-y-5 mt-6"
                    >
                        <Input
                            type="text"
                            label="Username or Email"
                            placeholder="Enter your username or email"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            error={errors.username}
                            leftIcon={<Mail className="w-5 h-5" />}
                            autoComplete="username"
                            autoFocus
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                            leftIcon={<Lock className="w-5 h-5" />}
                            showPasswordToggle
                            autoComplete="current-password"
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <motion.div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberMe
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-neutral-300 dark:border-neutral-600 group-hover:border-primary-400'
                                        }`}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setRememberMe(!rememberMe)}
                                >
                                    {rememberMe && (
                                        <motion.svg
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </motion.svg>
                                    )}
                                </motion.div>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={loginMutation.isPending}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                        >
                            Sign In
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.form>

                    {/* Divider */}
                    <motion.div variants={staggerItem} className="my-8">
                        <Divider>Or continue with</Divider>
                    </motion.div>

                    {/* Social Login */}
                    <motion.div variants={staggerItem} className="space-y-3">
                        <GoogleAuthButton
                            text="Sign in with Google"
                            onError={(error) => setGeneralError(error)}
                        />

                        <Link href="/telegram" className="block">
                            <motion.button
                                type="button"
                                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                                </svg>
                                Sign in with Telegram
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Sign Up Link */}
                    <motion.div variants={staggerItem} className="mt-8">
                        <p className="text-neutral-600 dark:text-neutral-400 text-center">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            >
                                Create one now
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right side - Hero */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-linear-to-br from-primary-600 via-accent-600 to-primary-700">
                {/* Animated blobs */}
                <div className="absolute inset-0">
                    <motion.div
                        className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
                        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"
                        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">AI-Powered Learning</span>
                        </div>
                        <h2 className="text-5xl font-bold mb-4">
                            Start Your Journey to
                            <span className="block mt-2">IELTS Success</span>
                        </h2>
                        <p className="text-xl text-primary-100 max-w-md mx-auto">
                            Join thousands of students who have achieved their dream scores with our platform
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="grid grid-cols-3 gap-8 mt-8"
                    >
                        {[
                            { value: '500+', label: 'Questions' },
                            { value: '50+', label: 'Mock Tests' },
                            { value: '1K+', label: 'Students' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="text-4xl font-bold">{stat.value}</div>
                                <div className="text-primary-200">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Testimonial */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl max-w-md"
                    >
                        <p className="italic text-primary-100 mb-4">
                            "BandBooster helped me achieve Band 8.0 in just 3 months of practice. The AI feedback is incredibly helpful!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                S
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">Sarah K.</div>
                                <div className="text-sm text-primary-200">Band 8.0 Achiever</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
