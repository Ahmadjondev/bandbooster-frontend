/**
 * Play Dialog Component
 * Pixel-perfect modal overlay before starting listening practice
 * Matches IELTS official test interface exactly
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';

const HeadphonesIcon = () => (
    <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
);

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

export interface PlayDialogProps {
    isOpen: boolean;
    onStart: () => void;
}

export function PlayDialog({ isOpen, onStart }: PlayDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70"
                >
                    {/* Headphones Icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <HeadphonesIcon />
                    </motion.div>

                    {/* Instruction Text */}
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-center text-base font-semibold max-w-full px-6 mb-2 leading-relaxed"
                    >
                        You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.
                    </motion.p>

                    {/* Continue Text */}
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white text-center text-base font-semibold mb-6"
                    >
                        To continue, click Play.
                    </motion.p>

                    {/* Play Button */}
                    <motion.button
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={onStart}
                        className="flex items-center gap-2.5 px-6 py-2.5 bg-black hover:bg-neutral-500 text-white text-sm font-medium rounded transition-colors"
                    >
                        <PlayIcon />
                        Play
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
