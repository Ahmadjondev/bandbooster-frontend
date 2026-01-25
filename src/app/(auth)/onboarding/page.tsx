'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Target,
    Calendar,
    Trophy,
    MessageSquare,
    Users,
    Youtube,
    Instagram,
    Globe,
    UserPlus,
    Briefcase,
    GraduationCap,
    BookOpen,
    Plane,
    Home,
    Check,
    Loader2,
} from 'lucide-react';

import { Button, Logo, AnimatedAlert } from '@/components/ui';
import { useOnboardingData, useSubmitOnboarding } from '@/domains/auth';
import type { OnboardingData } from '@/domains/auth/models/domain';
import { staggerContainer, staggerItem } from '@/lib/animations';

type Step = 'heard_from' | 'main_goal' | 'exam_type' | 'target_score' | 'exam_date';

interface StepConfig {
    id: Step;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
}

const steps: StepConfig[] = [
    { id: 'heard_from', title: 'How did you hear about us?', subtitle: 'Help us understand our community', icon: MessageSquare },
    { id: 'main_goal', title: 'What\'s your main goal?', subtitle: 'Tell us why you\'re preparing for IELTS', icon: Target },
    { id: 'exam_type', title: 'Which exam are you preparing for?', subtitle: 'Choose your IELTS exam type', icon: BookOpen },
    { id: 'target_score', title: 'What\'s your target band score?', subtitle: 'Set your goal to track progress', icon: Trophy },
    { id: 'exam_date', title: 'When is your exam?', subtitle: 'We\'ll create a personalized study plan', icon: Calendar },
];

const heardFromOptions = [
    { value: 'TELEGRAM', label: 'Telegram', icon: MessageSquare, color: 'bg-blue-500' },
    { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { value: 'YOUTUBE', label: 'YouTube', icon: Youtube, color: 'bg-red-500' },
    { value: 'TIKTOK', label: 'TikTok', icon: Globe, color: 'bg-neutral-900 dark:bg-white dark:text-neutral-900' },
    { value: 'FRIEND', label: 'Friend', icon: UserPlus, color: 'bg-green-500' },
    { value: 'TEACHER', label: 'Teacher', icon: GraduationCap, color: 'bg-amber-500' },
    { value: 'SEARCH', label: 'Online Search', icon: Globe, color: 'bg-primary-500' },
    { value: 'OTHER', label: 'Other', icon: Users, color: 'bg-neutral-500' },
];

const mainGoalOptions = [
    { value: 'STUDY_ABROAD', label: 'Study Abroad', icon: GraduationCap, desc: 'University or college admission', color: 'from-blue-500 to-cyan-500' },
    { value: 'IMMIGRATION', label: 'Immigration', icon: Plane, desc: 'Visa and permanent residency', color: 'from-green-500 to-emerald-500' },
    { value: 'WORK', label: 'Work', icon: Briefcase, desc: 'Job opportunities abroad', color: 'from-amber-500 to-orange-500' },
    { value: 'PERSONAL', label: 'Personal Growth', icon: Target, desc: 'Self-improvement and skills', color: 'from-purple-500 to-pink-500' },
    { value: 'OTHER', label: 'Other', icon: Home, desc: 'Other purposes', color: 'from-neutral-500 to-neutral-600' },
];

const examTypeOptions = [
    { value: 'ACADEMIC', label: 'IELTS Academic', desc: 'For higher education and professional registration', icon: '🎓' },
    { value: 'GENERAL', label: 'IELTS General Training', desc: 'For work experience and immigration', icon: '🌍' },
    { value: 'UKVI', label: 'IELTS for UKVI', desc: 'For UK visa and immigration', icon: '🇬🇧' },
];

const targetScoreOptions = [
    { value: '5.5', label: '5.5', desc: 'Modest user' },
    { value: '6.0', label: '6.0', desc: 'Competent user' },
    { value: '6.5', label: '6.5', desc: 'Competent user' },
    { value: '7.0', label: '7.0', desc: 'Good user' },
    { value: '7.5', label: '7.5', desc: 'Very good user' },
    { value: '8.0', label: '8.0', desc: 'Very good user' },
    { value: '8.5', label: '8.5+', desc: 'Expert user' },
];

const examDateOptions = [
    { value: 'WITHIN_MONTH', label: 'Within a month', icon: '⚡', desc: 'Intensive preparation' },
    { value: 'ONE_THREE_MONTHS', label: '1-3 months', icon: '📅', desc: 'Balanced preparation' },
    { value: 'THREE_SIX_MONTHS', label: '3-6 months', icon: '📚', desc: 'Comprehensive study' },
    { value: 'SIX_PLUS_MONTHS', label: '6+ months', icon: '🎯', desc: 'Long-term preparation' },
    { value: 'NOT_SCHEDULED', label: 'Not scheduled yet', icon: '❓', desc: 'Just exploring' },
];

// Form data interface matching backend expectations
interface OnboardingFormData {
    heardFrom?: string;
    mainGoal?: string;
    examType?: string;
    targetScore?: string;
    examDate?: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<OnboardingFormData>({});
    const [error, setError] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex) / steps.length) * 100;

    const { data: onboardingData, isLoading: loadingOptions } = useOnboardingData();

    const submitMutation = useSubmitOnboarding({
        onSuccess: () => {
            setIsComplete(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        },
        onError: (err) => {
            setError(err.message || 'Failed to save preferences');
        },
    });

    const handleSelect = (field: keyof OnboardingFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');

        // Auto-advance to next step after selection with slight delay
        setTimeout(() => {
            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            }
        }, 400);
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleFinish = () => {
        if (!formData.heardFrom || !formData.mainGoal || !formData.examType) {
            setError('Please complete all required steps');
            return;
        }

        submitMutation.mutate({
            heardFrom: formData.heardFrom as OnboardingData['heardFrom'],
            mainGoal: formData.mainGoal as OnboardingData['mainGoal'],
            examType: formData.examType as OnboardingData['examType'],
            targetScore: formData.targetScore as OnboardingData['targetScore'],
            examDate: formData.examDate,
        });
    };

    const isLastStep = currentStepIndex === steps.length - 1;
    const canFinish = formData.heardFrom && formData.mainGoal && formData.examType;

    return (
        <div className="min-h-screen flex flex-col bg-linear-to-br from-neutral-50 via-primary-50/50 to-accent-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Header */}
            <header className="p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Logo size="sm" />
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            Step {currentStepIndex + 1} of {steps.length}
                        </span>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1">
                <motion.div
                    className="h-full bg-linear-to-r from-primary-500 to-accent-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-3xl"
                        >
                            {/* Step Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                >
                                    <currentStep.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                                    {currentStep.title}
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {currentStep.subtitle}
                                </p>
                            </div>

                            {/* Error Alert */}
                            <AnimatedAlert
                                show={!!error}
                                variant="error"
                                dismissible
                                onDismiss={() => setError('')}
                                className="mb-6"
                            >
                                {error}
                            </AnimatedAlert>

                            {/* Options */}
                            <div className="space-y-4">
                                {/* Heard From Options */}
                                {currentStep.id === 'heard_from' && (
                                    <motion.div
                                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {heardFromOptions.map((option) => (
                                            <OptionCard
                                                key={option.value}
                                                selected={formData.heardFrom === option.value}
                                                onClick={() => handleSelect('heardFrom', option.value)}
                                            >
                                                <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center text-white mb-3`}>
                                                    <option.icon className="w-6 h-6" />
                                                </div>
                                                <span className="font-medium text-neutral-900 dark:text-white">
                                                    {option.label}
                                                </span>
                                            </OptionCard>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Main Goal Options */}
                                {currentStep.id === 'main_goal' && (
                                    <motion.div
                                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {mainGoalOptions.map((option) => (
                                            <OptionCard
                                                key={option.value}
                                                selected={formData.mainGoal === option.value}
                                                onClick={() => handleSelect('mainGoal', option.value)}
                                                className="text-left"
                                            >
                                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${option.color} flex items-center justify-center text-white mb-3`}>
                                                    <option.icon className="w-7 h-7" />
                                                </div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                    {option.label}
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    {option.desc}
                                                </p>
                                            </OptionCard>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Exam Type Options */}
                                {currentStep.id === 'exam_type' && (
                                    <motion.div
                                        className="space-y-4 max-w-lg mx-auto"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {examTypeOptions.map((option) => (
                                            <OptionCard
                                                key={option.value}
                                                selected={formData.examType === option.value}
                                                onClick={() => handleSelect('examType', option.value)}
                                                className="flex items-center gap-4 text-left"
                                                fullWidth
                                            >
                                                <span className="text-4xl">{option.icon}</span>
                                                <div>
                                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                        {option.label}
                                                    </h3>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {option.desc}
                                                    </p>
                                                </div>
                                            </OptionCard>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Target Score Options */}
                                {currentStep.id === 'target_score' && (
                                    <motion.div
                                        className="flex flex-wrap justify-center gap-4"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {targetScoreOptions.map((option) => (
                                            <OptionCard
                                                key={option.value}
                                                selected={formData.targetScore === option.value}
                                                onClick={() => handleSelect('targetScore', option.value)}
                                                className="w-24 h-24 flex flex-col items-center justify-center"
                                            >
                                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                    {option.label}
                                                </span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                    {option.desc}
                                                </span>
                                            </OptionCard>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Exam Date Options */}
                                {currentStep.id === 'exam_date' && (
                                    <motion.div
                                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {examDateOptions.map((option) => (
                                            <OptionCard
                                                key={option.value}
                                                selected={formData.examDate === option.value}
                                                onClick={() => handleSelect('examDate', option.value)}
                                                className="text-center"
                                            >
                                                <span className="text-3xl mb-2 block">{option.icon}</span>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                    {option.label}
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    {option.desc}
                                                </p>
                                            </OptionCard>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <CompletionScreen />
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            {!isComplete && (
                <footer className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStepIndex === 0}
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </Button>

                        <div className="flex gap-3">
                            {!isLastStep && (
                                <Button variant="ghost" onClick={handleSkip}>
                                    Skip
                                </Button>
                            )}

                            {isLastStep && canFinish && (
                                <Button
                                    variant="primary"
                                    onClick={handleFinish}
                                    isLoading={submitMutation.isPending}
                                >
                                    Finish Setup
                                    <Sparkles className="w-5 h-5 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

// Option Card Component
interface OptionCardProps {
    children: React.ReactNode;
    selected: boolean;
    onClick: () => void;
    className?: string;
    fullWidth?: boolean;
}

function OptionCard({ children, selected, onClick, className = '', fullWidth = false }: OptionCardProps) {
    return (
        <motion.button
            variants={staggerItem}
            className={`
        relative p-4 rounded-2xl border-2 transition-all duration-200
        ${selected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                }
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {selected && (
                <motion.div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                >
                    <Check className="w-4 h-4 text-white" />
                </motion.div>
            )}
            {children}
        </motion.button>
    );
}

// Completion Screen
function CompletionScreen() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg mx-auto"
        >
            <motion.div
                className="w-32 h-32 mx-auto mb-8 rounded-full bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.4 }}
                >
                    <Sparkles className="w-16 h-16 text-white" />
                </motion.div>
            </motion.div>

            <motion.h1
                className="text-4xl font-bold text-neutral-900 dark:text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                You're All Set! 🎉
            </motion.h1>

            <motion.p
                className="text-lg text-neutral-600 dark:text-neutral-400 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                Your personalized IELTS learning journey starts now. We've created a study plan tailored just for you.
            </motion.p>

            <motion.div
                className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing your dashboard...</span>
            </motion.div>

            {/* Celebration particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '50%',
                            backgroundColor: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'][Math.floor(Math.random() * 4)],
                        }}
                        initial={{ y: 0, opacity: 1 }}
                        animate={{
                            y: [0, -200 - Math.random() * 200],
                            x: [0, (Math.random() - 0.5) * 200],
                            opacity: [1, 0],
                            scale: [1, 0.5],
                        }}
                        transition={{
                            duration: 2 + Math.random(),
                            delay: Math.random() * 0.5,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}
