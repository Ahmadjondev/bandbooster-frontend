"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

export interface TestimonialCardProps {
    quote: string;
    name: string;
    role: string;
    avatarUrl: string;
    bandScore: number;
    className?: string;
}

const getBandScoreColor = (score: number): string => {
    if (score >= 8) return "from-success-400 to-success-600";
    if (score >= 7) return "from-primary-400 to-primary-600";
    if (score >= 6) return "from-accent-400 to-accent-600";
    if (score >= 5) return "from-warning-400 to-warning-600";
    return "from-neutral-400 to-neutral-600";
};

const getBandScoreBg = (score: number): string => {
    if (score >= 8) return "bg-success-500/20 border-success-500/30";
    if (score >= 7) return "bg-primary-500/20 border-primary-500/30";
    if (score >= 6) return "bg-accent-500/20 border-accent-500/30";
    if (score >= 5) return "bg-warning-500/20 border-warning-500/30";
    return "bg-neutral-500/20 border-neutral-500/30";
};

export const TestimonialCard = ({
    quote,
    name,
    role,
    avatarUrl,
    bandScore,
    className,
}: TestimonialCardProps) => {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={cn(
                "relative p-6 rounded-2xl",
                "bg-white/5 backdrop-blur-xl",
                "border border-white/10",
                "shadow-lg shadow-black/5",
                "transition-all duration-300",
                "hover:bg-white/8 hover:border-white/15",
                "hover:shadow-xl",
                className
            )}
        >
            {/* Quote icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="absolute -top-3 -left-3"
            >
                <div
                    className={cn(
                        "flex items-center justify-center",
                        "w-10 h-10 rounded-full",
                        "bg-gradient-to-br from-primary-500 to-accent-500",
                        "shadow-lg shadow-primary-500/30"
                    )}
                >
                    <Quote className="w-5 h-5 text-white" />
                </div>
            </motion.div>

            {/* Band Score Badge */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="absolute -top-3 -right-3"
            >
                <div
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        "border backdrop-blur-sm",
                        getBandScoreBg(bandScore)
                    )}
                >
                    <span
                        className={cn(
                            "text-xs font-medium",
                            "bg-gradient-to-r bg-clip-text text-transparent",
                            getBandScoreColor(bandScore)
                        )}
                    >
                        Band
                    </span>
                    <span
                        className={cn(
                            "text-sm font-bold",
                            "bg-gradient-to-r bg-clip-text text-transparent",
                            getBandScoreColor(bandScore)
                        )}
                    >
                        {bandScore.toFixed(1)}
                    </span>
                </div>
            </motion.div>

            {/* Quote text */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={cn(
                    "text-neutral-300 text-sm leading-relaxed",
                    "mt-4 mb-6",
                    "italic"
                )}
            >
                &ldquo;{quote}&rdquo;
            </motion.p>

            {/* Author info */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
            >
                <div
                    className={cn(
                        "relative w-12 h-12 rounded-full overflow-hidden",
                        "ring-2 ring-white/10",
                        "bg-neutral-800"
                    )}
                >
                    <Image
                        src={avatarUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-neutral-100">{name}</h4>
                    <p className="text-xs text-neutral-400">{role}</p>
                </div>
            </motion.div>

            {/* Subtle gradient line */}
            <div
                className={cn(
                    "absolute bottom-0 left-6 right-6 h-px",
                    "bg-gradient-to-r from-transparent via-white/10 to-transparent"
                )}
            />
        </motion.div>
    );
};

export default TestimonialCard;
