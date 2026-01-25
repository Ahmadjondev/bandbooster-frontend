'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
    variant?: 'auth' | 'onboarding' | 'default';
    className?: string;
}

export function AnimatedBackground({ variant = 'default', className }: AnimatedBackgroundProps) {
    const variants = {
        auth: {
            primary: 'from-primary-600 via-accent-600 to-primary-700',
            blobs: [
                { color: 'bg-primary-400/30', position: 'top-20 left-20', size: 'w-72 h-72' },
                { color: 'bg-accent-500/20', position: 'bottom-20 right-20', size: 'w-96 h-96' },
                { color: 'bg-primary-300/20', position: 'top-1/2 left-1/2', size: 'w-64 h-64' },
            ],
        },
        onboarding: {
            primary: 'from-violet-50 via-primary-50 to-accent-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950',
            blobs: [
                { color: 'bg-violet-300 dark:bg-violet-900/30', position: 'top-0 -left-4', size: 'w-72 h-72' },
                { color: 'bg-amber-300 dark:bg-amber-900/30', position: 'top-0 -right-4', size: 'w-72 h-72' },
                { color: 'bg-pink-300 dark:bg-pink-900/30', position: '-bottom-8 left-20', size: 'w-72 h-72' },
                { color: 'bg-primary-300 dark:bg-primary-900/30', position: 'bottom-20 right-20', size: 'w-72 h-72' },
            ],
        },
        default: {
            primary: 'from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950',
            blobs: [
                { color: 'bg-primary-200/50 dark:bg-primary-900/20', position: 'top-20 right-20', size: 'w-64 h-64' },
                { color: 'bg-accent-200/50 dark:bg-accent-900/20', position: 'bottom-20 left-20', size: 'w-48 h-48' },
            ],
        },
    };

    const config = variants[variant];

    return (
        <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
            {/* Base gradient */}
            <div className={cn('absolute inset-0 bg-linear-to-br', config.primary)} />

            {/* Animated blobs */}
            {config.blobs.map((blob, index) => (
                <motion.div
                    key={index}
                    className={cn(
                        'absolute rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70',
                        blob.color,
                        blob.position,
                        blob.size
                    )}
                    animate={{
                        x: [0, 30, -20, 0],
                        y: [0, -50, 20, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        delay: index * 2,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}

// Floating particles effect
export function FloatingParticles() {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 10,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white/20"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}
