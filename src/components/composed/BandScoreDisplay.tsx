"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BandScoreDisplayProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

const sizeConfig = {
    sm: {
        container: "w-24 h-24",
        stroke: 6,
        fontSize: "text-2xl",
        labelSize: "text-xs",
        radius: 40,
    },
    md: {
        container: "w-36 h-36",
        stroke: 8,
        fontSize: "text-4xl",
        labelSize: "text-sm",
        radius: 60,
    },
    lg: {
        container: "w-48 h-48",
        stroke: 10,
        fontSize: "text-5xl",
        labelSize: "text-base",
        radius: 80,
    },
};

const getScoreColor = (score: number) => {
    if (score >= 8) return { main: "#22c55e", glow: "#22c55e40" }; // success
    if (score >= 7) return { main: "#0ea5e9", glow: "#0ea5e940" }; // primary
    if (score >= 6) return { main: "#a855f7", glow: "#a855f740" }; // accent
    if (score >= 5) return { main: "#f59e0b", glow: "#f59e0b40" }; // warning
    return { main: "#71717a", glow: "#71717a40" }; // neutral
};

const getScoreLevel = (score: number): string => {
    if (score >= 8.5) return "Expert";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Competent";
    if (score >= 5) return "Modest";
    if (score >= 4) return "Limited";
    return "Basic";
};

export const BandScoreDisplay = ({
    score,
    size = "md",
    showLabel = true,
    className,
}: BandScoreDisplayProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const config = sizeConfig[size];
    const colors = getScoreColor(score);
    const level = getScoreLevel(score);

    // Calculate circle properties
    const circumference = 2 * Math.PI * config.radius;
    const normalizedScore = Math.min(Math.max(score, 0), 9); // IELTS score 0-9
    const progress = normalizedScore / 9;

    // Spring animation for the score
    const springScore = useSpring(0, {
        stiffness: 50,
        damping: 20,
    });

    const displayScore = useTransform(springScore, (value) => value.toFixed(1));

    // Spring animation for progress
    const springProgress = useSpring(0, {
        stiffness: 30,
        damping: 25,
    });

    const strokeDashoffset = useTransform(
        springProgress,
        (value) => circumference * (1 - value)
    );

    useEffect(() => {
        setIsMounted(true);
        springScore.set(score);
        springProgress.set(progress);
    }, [score, progress, springScore, springProgress]);

    // SVG viewBox calculation
    const viewBoxSize = (config.radius + config.stroke) * 2;
    const center = viewBoxSize / 2;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={cn(
                "relative inline-flex flex-col items-center justify-center",
                className
            )}
        >
            {/* Glow effect */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full blur-xl opacity-50",
                    config.container
                )}
                style={{ backgroundColor: colors.glow }}
            />

            {/* SVG Circle */}
            <div className={cn("relative", config.container)}>
                <svg
                    className="w-full h-full -rotate-90"
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                >
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={config.radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={config.stroke}
                        className="text-neutral-800"
                    />

                    {/* Progress circle */}
                    {isMounted && (
                        <motion.circle
                            cx={center}
                            cy={center}
                            r={config.radius}
                            fill="none"
                            stroke={colors.main}
                            strokeWidth={config.stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset }}
                            className="drop-shadow-lg"
                            filter={`drop-shadow(0 0 6px ${colors.main})`}
                        />
                    )}

                    {/* Decorative dots */}
                    {[...Array(9)].map((_, i) => {
                        const angle = (i / 9) * 2 * Math.PI - Math.PI / 2;
                        const x = center + (config.radius + config.stroke + 4) * Math.cos(angle);
                        const y = center + (config.radius + config.stroke + 4) * Math.sin(angle);
                        const isActive = normalizedScore >= i + 1;

                        return (
                            <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={2}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isActive ? 0.8 : 0.2 }}
                                transition={{ delay: i * 0.05 }}
                                fill={isActive ? colors.main : "#52525b"}
                            />
                        );
                    })}
                </svg>

                {/* Score display in center */}
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col items-center justify-center"
                    )}
                >
                    <motion.span
                        className={cn("font-bold", config.fontSize)}
                        style={{ color: colors.main }}
                    >
                        {isMounted ? (
                            <motion.span>{displayScore}</motion.span>
                        ) : (
                            score.toFixed(1)
                        )}
                    </motion.span>

                    {showLabel && (
                        <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={cn(
                                "text-neutral-400 font-medium mt-1",
                                config.labelSize
                            )}
                        >
                            {level}
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Band score label */}
            {showLabel && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 text-center"
                >
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">
                        IELTS Band Score
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
};

export default BandScoreDisplay;
