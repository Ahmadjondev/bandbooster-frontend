"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/domains/auth";
import {
  Headphones,
  BookOpen,
  Pen,
  Mic,
  Target,
  Brain,
  Zap,
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle2,
  MousePointer,
  Rocket,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// Floating particle component
const FloatingParticle = ({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary-500/20"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.2, 0.5, 0.2],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Glowing orb component
const GlowingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={cn("absolute rounded-full blur-[100px]", className)}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const features = [
  {
    icon: Headphones,
    title: "Listening",
    description: "Train with real IELTS audio samples and native speakers",
    gradient: "from-blue-500 to-cyan-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: BookOpen,
    title: "Reading",
    description: "Master comprehension with AI-analyzed passages",
    gradient: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: Pen,
    title: "Writing",
    description: "Get instant AI feedback on essays and reports",
    gradient: "from-violet-500 to-purple-400",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: Mic,
    title: "Speaking",
    description: "Practice with our AI examiner 24/7",
    gradient: "from-orange-500 to-amber-400",
    iconBg: "bg-orange-500/10",
  },
];

const steps = [
  {
    number: "01",
    title: "Take a Diagnostic Test",
    description: "Our AI assessment identifies your current level and pinpoints improvement areas in just 15 minutes.",
    icon: Target,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "Get Your Personalized Plan",
    description: "Receive a custom study plan tailored to your target score, timeline, and learning preferences.",
    icon: Brain,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    number: "03",
    title: "Practice & Improve",
    description: "Complete targeted exercises with instant AI feedback and watch your band score climb.",
    icon: Rocket,
    gradient: "from-emerald-500 to-teal-500",
  },
];

const aiFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced AI identifies weak points and creates personalized improvement paths.",
  },
  {
    icon: Target,
    title: "Score Prediction",
    description: "Get accurate band score predictions based on your performance patterns.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Receive detailed feedback in seconds, not days. Learn faster, improve quicker.",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Auto-redirect to dashboard if user is already logged in
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      const storedUser = authApi.getStoredUser();
      if (storedUser) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize particles
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        delay: Math.random() * 4,
        size: Math.random() * 8 + 4,
        x: Math.random() * 100,
        y: Math.random() * 100,
      })),
    []
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100 dark:from-primary-900/30 via-white dark:via-neutral-950 to-white dark:to-neutral-950" />

          {/* Floating orbs */}
          <GlowingOrb className="top-1/4 -left-32 w-[500px] h-[500px] bg-primary-400/20 dark:bg-primary-500/30" />
          <GlowingOrb className="bottom-1/4 -right-32 w-[500px] h-[500px] bg-accent-400/15 dark:bg-accent-500/25" delay={2} />
          <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-600/15" delay={4} />

          {/* Floating particles */}
          {mounted && particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />

        {/* Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 container mx-auto px-4 pt-32 pb-20"
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-md mb-10"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              </motion.div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">AI-Powered IELTS Preparation</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
              <span className="block text-neutral-900 dark:text-white">Achieve Your</span>
              <motion.span
                className="block mt-3 bg-linear-to-r from-primary-500 via-accent-500 to-primary-500 dark:from-primary-400 dark:via-accent-400 dark:to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Dream Score
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Experience the future of IELTS preparation. Our AI analyzes your performance
              and creates a personalized path to your target band score.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className={cn(
                    "bg-linear-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400",
                    "text-white font-semibold px-8 py-6 text-lg rounded-2xl",
                    "shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/40",
                    "transition-all duration-300 group"
                  )}
                >
                  Start Free Practice
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 px-8 py-6 text-lg rounded-2xl group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 text-neutral-500"
            >
              {[
                { icon: CheckCircle2, text: "Free Practice Tests" },
                { icon: Zap, text: "Instant AI Feedback" },
                { icon: Target, text: "Score Prediction" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-neutral-400 dark:text-neutral-500"
          >
            <MousePointer className="w-5 h-5" />
            <span className="text-xs font-medium">Scroll to explore</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 scroll-mt-20 bg-neutral-50 dark:bg-transparent">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
              All 4 Modules
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-neutral-900 dark:text-white">
              Master Every <span className="gradient-text">Section</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
              Comprehensive practice for all four IELTS modules with real-time AI feedback and personalized insights.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                {/* Hover glow effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10",
                    `bg-linear-to-br ${feature.gradient}`
                  )}
                  style={{ transform: "scale(0.8)" }}
                />

                <div className="relative h-full p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-all duration-500  dark:shadow-none">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl mb-6 flex items-center justify-center",
                      "bg-linear-to-br", feature.gradient,
                      "shadow-lg group-hover:scale-110 transition-transform duration-300"
                    )}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>

                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center text-neutral-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 overflow-hidden scroll-mt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-b from-white dark:from-neutral-950 via-primary-50 dark:via-primary-950/10 to-white dark:to-neutral-950" />
          <GlowingOrb className="top-1/2 left-1/4 w-[400px] h-[400px] bg-primary-400/10 dark:bg-primary-500/10" delay={1} />
          <GlowingOrb className="bottom-1/4 right-1/4 w-[350px] h-[350px] bg-accent-400/10 dark:bg-accent-500/10" delay={3} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 text-accent-600 dark:text-accent-400 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent-500 dark:bg-accent-400 animate-pulse" />
              Simple Process
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-neutral-900 dark:text-white">
              Your Path to <span className="gradient-text">Success</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
              Three simple steps to achieve your target band score
            </p>
          </motion.div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={cn(
                  "relative flex items-center gap-8 mb-16 last:mb-0",
                  index % 2 === 1 && "flex-row-reverse"
                )}
              >
                {/* Step Number */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className={cn(
                    "hidden md:flex items-center justify-center w-28 h-28 rounded-3xl shrink-0",
                    "bg-linear-to-br", step.gradient,
                    "shadow-2xl"
                  )}
                >
                  <span className="text-5xl font-black text-white">{step.number}</span>
                </motion.div>

                {/* Content Card */}
                <div className="flex-1 group">
                  <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-all duration-300  dark:shadow-none">
                    <div className="flex items-start gap-5">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                          "bg-linear-to-br", step.gradient,
                          "group-hover:scale-110 transition-transform duration-300"
                        )}
                      >
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <span className="md:hidden text-sm font-bold text-neutral-400 dark:text-neutral-500 mb-2 block">Step {step.number}</span>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="relative py-32 bg-neutral-50 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                AI Technology
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white">
                Powered by <span className="gradient-text">Advanced AI</span>
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
                Our cutting-edge AI technology provides instant, accurate feedback that rivals human examiners.
                Learn faster and smarter with personalized insights.
              </p>

              <div className="space-y-5">
                {aiFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/[0.06] hover:border-neutral-300 dark:hover:border-white/20 transition-all duration-300  dark:shadow-none"
                  >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary-100 dark:from-primary-500/20 to-accent-100 dark:to-accent-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-linear-to-r from-primary-400/20 dark:from-primary-500/20 to-accent-400/20 dark:to-accent-500/20 blur-3xl rounded-full scale-75" />

              <div className="relative p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 backdrop-blur-sm shadow-xl dark:shadow-none">
                {/* Score Display */}
                <div className="space-y-4">
                  {[
                    { label: "Writing", score: 7.0, width: "78%", gradient: "from-primary-500 to-accent-500" },
                    { label: "Speaking", score: 7.5, width: "83%", gradient: "from-emerald-500 to-teal-500" },
                    { label: "Listening", score: 8.0, width: "89%", gradient: "from-blue-500 to-cyan-500" },
                    { label: "Reading", score: 6.5, width: "72%", gradient: "from-violet-500 to-purple-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors">
                      <span className="text-neutral-600 dark:text-neutral-400">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: item.width }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                            className={cn("h-full rounded-full bg-linear-to-r", item.gradient)}
                          />
                        </div>
                        <span className="text-neutral-900 dark:text-white font-bold w-8">{item.score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Suggestion */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 p-4 rounded-xl bg-linear-to-r from-primary-50 dark:from-primary-500/10 to-accent-50 dark:to-accent-500/10 border border-primary-200 dark:border-primary-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">AI Recommendation</span>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Focus on Reading comprehension this week</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About / Stats Section */}
      <section id="about" className="relative py-32 overflow-hidden scroll-mt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-b from-white dark:from-neutral-950 via-accent-50 dark:via-accent-950/10 to-white dark:to-neutral-950" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
              About Bandbooster
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-neutral-900 dark:text-white">
              Why Students <span className="gradient-text">Choose Us</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
              We combine cutting-edge AI with proven IELTS strategies to deliver
              a learning experience that adapts to your unique needs.
            </p>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                { value: "AI", label: "Powered Feedback", sublabel: "Instant & accurate" },
                { value: "24/7", label: "Availability", sublabel: "Practice anytime" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all duration-300  dark:shadow-none"
                >
                  <div className="text-5xl md:text-6xl font-black gradient-text mb-3">{stat.value}</div>
                  <div className="text-neutral-900 dark:text-white text-lg font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-neutral-500">{stat.sublabel}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-neutral-50 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-linear-to-r from-primary-400/30 dark:from-primary-500/30 to-accent-400/30 dark:to-accent-500/30 blur-3xl rounded-3xl scale-95" />

            {/* Card */}
            <div className="relative p-12 md:p-20 rounded-[2.5rem] bg-linear-to-br from-primary-600 via-primary-700 to-accent-700 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

              {/* Grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to Boost Your Band Score?
                </h2>
                <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
                  Join thousands of students achieving their dream scores. Start your free practice today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-white text-primary-700 hover:bg-white/90 font-semibold px-10 py-6 text-lg rounded-2xl shadow-2xl group"
                    >
                      Start Free Practice
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-2xl"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
