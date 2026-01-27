"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps, type Easing } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = {
    primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 ",
    secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 ",
    ghost:
        "hover:bg-accent hover:text-accent-foreground",
    outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground ",
} as const;

const buttonSizes = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 py-2 text-sm rounded-md",
    lg: "h-12 px-6 text-base rounded-lg",
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    loadingText?: string;
    asChild?: boolean;
}

const Spinner = ({ className }: { className?: string }) => (
    <svg
        className={cn("animate-spin", className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width="16"
        height="16"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

const motionVariants = {
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: "easeOut" as Easing,
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
            ease: "easeIn" as Easing,
        },
    },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            loadingText,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading;

        return (
            <motion.button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    buttonVariants[variant],
                    buttonSizes[size],
                    className
                )}
                disabled={isDisabled}
                whileHover={!isDisabled ? motionVariants.hover : undefined}
                whileTap={!isDisabled ? motionVariants.tap : undefined}
                {...(props as HTMLMotionProps<"button">)}
            >
                {isLoading && <Spinner className="shrink-0" />}
                {isLoading && loadingText ? loadingText : children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
