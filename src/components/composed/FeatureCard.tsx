"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, scaleIn } from "@/lib/animations";

export interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

export const FeatureCard = ({
    icon: Icon,
    title,
    description,
    className,
}: FeatureCardProps) => {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={cn("relative group", className)}
        >
            {/* Gradient border on hover */}
            <div
                className={cn(
                    "absolute -inset-[1px] rounded-2xl opacity-0 blur-sm transition-opacity duration-500",
                    "bg-gradient-to-r from-primary-400 via-accent-500 to-primary-400",
                    "group-hover:opacity-100"
                )}
            />

            {/* Glass morphism card */}
            <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                    "relative h-full p-6 rounded-2xl",
                    "bg-white/5 backdrop-blur-xl",
                    "border border-white/10",
                    "shadow-lg shadow-black/5",
                    "transition-all duration-300",
                    "group-hover:bg-white/10 group-hover:border-white/20",
                    "group-hover:shadow-xl group-hover:shadow-primary-500/10"
                )}
            >
                {/* Icon container */}
                <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={cn(
                        "inline-flex items-center justify-center",
                        "w-12 h-12 mb-4 rounded-xl",
                        "bg-gradient-to-br from-primary-500/20 to-accent-500/20",
                        "border border-primary-500/30",
                        "group-hover:from-primary-500/30 group-hover:to-accent-500/30",
                        "transition-all duration-300"
                    )}
                >
                    <Icon className="w-6 h-6 text-primary-400 group-hover:text-primary-300 transition-colors" />
                </motion.div>

                {/* Content */}
                <h3
                    className={cn(
                        "text-lg font-semibold mb-2",
                        "text-neutral-100 group-hover:text-white",
                        "transition-colors duration-300"
                    )}
                >
                    {title}
                </h3>

                <p
                    className={cn(
                        "text-sm leading-relaxed",
                        "text-neutral-400 group-hover:text-neutral-300",
                        "transition-colors duration-300"
                    )}
                >
                    {description}
                </p>

                {/* Subtle glow effect */}
                <div
                    className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2",
                        "w-1/2 h-px",
                        "bg-gradient-to-r from-transparent via-primary-500/50 to-transparent",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-500"
                    )}
                />
            </motion.div>
        </motion.div>
    );
};

export default FeatureCard;
