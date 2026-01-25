'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, CheckCircle2, Shield, Zap, Target } from 'lucide-react';

import { Button, Input, Card, Divider, AnimatedAlert } from '@/components/ui';
import { GoogleAuthButton } from '@/domains/auth/components';
import { useRegister } from '@/domains/auth';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const registerMutation = useRegister({
        onSuccess: (session) => {
            // Students go to email verification
            if (session.user.role === 'STUDENT') {
                router.push('/verify-email');
            } else {
                router.push('/onboarding');
            }
        },
        onError: (error) => {
            setGeneralError(error.message || 'Registration failed. Please try again.');
        },
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (!acceptTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) return;

        registerMutation.mutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
        });
    };

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

        return {
            strength,
            label: labels[strength - 1] || '',
            color: colors[strength - 1] || '',
        };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex">
            {/* Left side - Hero */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-linear-to-br from-accent-600 via-primary-600 to-accent-700">
                {/* Animated blobs */}
                <div className="absolute inset-0">
                    <motion.div
                        className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
                        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center text-white p-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold mb-6">
                            Unlock Your Full
                            <span className="block mt-2">IELTS Potential</span>
                        </h2>
                        <p className="text-xl text-accent-100 max-w-md mb-12">
                            Get access to comprehensive study materials, AI-powered feedback, and personalized learning paths.
                        </p>
                    </motion.div>

                    {/* Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {[
                            { icon: Target, title: 'Personalized Learning', desc: 'AI-tailored study plans for your goals' },
                            { icon: Zap, title: 'Instant Feedback', desc: 'Get real-time analysis on your answers' },
                            { icon: Shield, title: 'Exam Simulation', desc: 'Practice with real test conditions' },
                        ].map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                                    <p className="text-sm text-accent-200">{benefit.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-neutral-950 overflow-y-auto">
                <motion.div
                    className="w-full max-w-md"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div variants={staggerItem} className="mb-6 text-center">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                            Create an Account
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Join thousands of successful IELTS achievers
                        </p>
                    </motion.div>

                    {/* Error Alert */}
                    <motion.div variants={staggerItem}>
                        <AnimatedAlert
                            show={!!generalError}
                            variant="error"
                            title="Registration Failed"
                            dismissible
                            onDismiss={() => setGeneralError('')}
                        >
                            {generalError}
                        </AnimatedAlert>
                    </motion.div>

                    {/* Register Form */}
                    <motion.form
                        variants={staggerItem}
                        onSubmit={handleSubmit}
                        className="space-y-4 mt-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="First Name"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                error={errors.firstName}
                                leftIcon={<User className="w-5 h-5" />}
                                autoComplete="given-name"
                                autoFocus
                            />
                            <Input
                                type="text"
                                label="Last Name"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                error={errors.lastName}
                                autoComplete="family-name"
                            />
                        </div>

                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                            leftIcon={<Mail className="w-5 h-5" />}
                            autoComplete="email"
                        />

                        <div className="space-y-2">
                            <Input
                                type="password"
                                label="Password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                                leftIcon={<Lock className="w-5 h-5" />}
                                showPasswordToggle
                                autoComplete="new-password"
                            />
                            {formData.password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.strength ? passwordStrength.color : 'bg-neutral-200 dark:bg-neutral-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Password strength: <span className="font-medium">{passwordStrength.label}</span>
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="space-y-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <motion.div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors shrink-0 ${acceptTerms
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-neutral-300 dark:border-neutral-600 group-hover:border-primary-400'
                                        }`}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAcceptTerms(!acceptTerms);
                                    }}
                                >
                                    {acceptTerms && (
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
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary-600 hover:underline dark:text-primary-400">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-primary-600 hover:underline dark:text-primary-400">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>
                            {errors.terms && (
                                <p className="text-sm text-red-500">{errors.terms}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={registerMutation.isPending}
                            className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white"
                        >
                            Create Account
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.form>

                    {/* Divider */}
                    <motion.div variants={staggerItem} className="my-6">
                        <Divider>Or sign up with</Divider>
                    </motion.div>

                    {/* Social Register */}
                    <motion.div variants={staggerItem} className="space-y-3">
                        <GoogleAuthButton
                            text="Sign up with Google"
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
                                Sign up with Telegram
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Sign In Link */}
                    <motion.div variants={staggerItem} className="mt-6">
                        <p className="text-neutral-600 dark:text-neutral-400 text-center">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
