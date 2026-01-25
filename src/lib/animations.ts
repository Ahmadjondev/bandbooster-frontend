import type { Variants, Transition } from 'framer-motion';

// Shared transition configs
const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // easeInOut
};

const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Fade animations
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// Slide animations
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: gentleSpring,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: gentleSpring,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export const scaleInCenter: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// Stagger container for child animations
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.08,
      staggerDirection: -1,
    },
  },
};

// Stagger item (use as children of stagger container)
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

// Modal/Dialog animations
export const modalOverlay: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, delay: 0.1 },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 5,
    transition: { duration: 0.15 },
  },
};

// Dropdown/Popover animations
export const dropdownMenu: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.1 },
  },
};

// Tooltip animation
export const tooltip: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Page transition animations
export const pageSlideIn: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3 },
  },
};

export const pageFade: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Skeleton loading pulse
export const skeletonPulse: Variants = {
  hidden: {
    opacity: 0.5,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

// Utility function for creating custom stagger containers
export const createStaggerContainer = (
  staggerChildren: number = 0.1,
  delayChildren: number = 0.05
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: staggerChildren / 2,
      staggerDirection: -1,
    },
  },
});

// Utility function for creating fade with custom direction
export const createFadeVariant = (
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20
): Variants => {
  const isVertical = direction === 'up' || direction === 'down';
  const value = direction === 'up' || direction === 'left' ? distance : -distance;

  if (isVertical) {
    return {
      hidden: { opacity: 0, y: value },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      },
      exit: {
        opacity: 0,
        y: -value / 2,
        transition: { duration: 0.2 },
      },
    };
  }

  return {
    hidden: { opacity: 0, x: value },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      x: -value / 2,
      transition: { duration: 0.2 },
    },
  };
};
