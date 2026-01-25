"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui";

export interface PricingCardProps {
    planName: string;
    price: number | string;
    features: string[];
    isPopular?: boolean;
    ctaText: string;
    billingPeriod?: string;
    onCtaClick?: () => void;
    className?: string;
}

export const PricingCard = ({
    planName,
    price,
    features,
    isPopular = false,
    ctaText,
    billingPeriod = "/month",
    onCtaClick,
    className,
}: PricingCardProps) => {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={cn("relative group", className)}
        >
            {/* Popular badge */}
            {isPopular && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                    <div
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-full",
                            "bg-gradient-to-r from-primary-500 to-accent-500",
                            "shadow-lg shadow-primary-500/30",
                            "text-white text-xs font-semibold"
                        )}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                    </div>
                </motion.div>
            )}

            {/* Gradient border for popular card */}
            {isPopular && (
                <div
                    className={cn(
                        "absolute -inset-[2px] rounded-2xl",
                        "bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500",
                        "opacity-100"
                    )}
                />
            )}

            {/* Card content */}
            <motion.div
                whileHover={{ scale: isPopular ? 1.02 : 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "relative h-full p-6 rounded-2xl",
                    "bg-neutral-900/90 backdrop-blur-xl",
                    "border",
                    isPopular ? "border-transparent" : "border-white/10",
                    "shadow-lg",
                    isPopular ? "shadow-primary-500/20" : "shadow-black/5",
                    "transition-all duration-300",
                    !isPopular && "hover:border-white/20 hover:shadow-xl"
                )}
            >
                {/* Plan name */}
                <h3
                    className={cn(
                        "text-lg font-semibold mb-2",
                        isPopular ? "text-primary-400" : "text-neutral-200"
                    )}
                >
                    {planName}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-white">
                        {typeof price === "number" ? `$${price}` : price}
                    </span>
                    {typeof price === "number" && (
                        <span className="text-sm text-neutral-400">{billingPeriod}</span>
                    )}
                </div>

                {/* Features list */}
                <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-3 mb-8"
                >
                    {features.map((feature, index) => (
                        <motion.li
                            key={index}
                            variants={staggerItem}
                            className="flex items-start gap-3"
                        >
                            <div
                                className={cn(
                                    "flex-shrink-0 w-5 h-5 rounded-full",
                                    "flex items-center justify-center",
                                    isPopular
                                        ? "bg-primary-500/20 text-primary-400"
                                        : "bg-neutral-700/50 text-neutral-400"
                                )}
                            >
                                <Check className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-neutral-300">{feature}</span>
                        </motion.li>
                    ))}
                </motion.ul>

                {/* CTA Button */}
                <Button
                    variant={isPopular ? "primary" : "outline"}
                    size="lg"
                    className={cn(
                        "w-full",
                        isPopular &&
                        "bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400"
                    )}
                    onClick={onCtaClick}
                >
                    {ctaText}
                </Button>

                {/* Decorative element for popular */}
                {isPopular && (
                    <div
                        className={cn(
                            "absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32",
                            "bg-primary-500/10 blur-3xl rounded-full",
                            "pointer-events-none"
                        )}
                    />
                )}
            </motion.div>
        </motion.div>
    );
};

export default PricingCard;
