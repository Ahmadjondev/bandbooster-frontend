'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-9xl font-bold bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent mb-4"
          >
            404
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Search className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            <p className="text-3xl font-semibold text-neutral-800 dark:text-neutral-200">
              Page Not Found
            </p>
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-white/[0.03] rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xl shadow-neutral-200/50 dark:shadow-none backdrop-blur-sm p-8 mb-8"
        >
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            The page you're looking for doesn't exist. It might have been moved, deleted,
            or you may have mistyped the URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 group"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl transition-all duration-300 border border-neutral-200 dark:border-white/10 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-neutral-600 dark:text-neutral-400"
        >
          <p className="mb-3 text-sm font-medium">Looking for something? Try these:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white dark:bg-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.06] rounded-xl text-sm font-medium transition-all duration-300 border border-neutral-200/80 dark:border-white/10 hover:border-primary-200 dark:hover:border-white/20 shadow-sm hover:shadow-md"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/practice/listening"
              className="px-4 py-2 bg-white dark:bg-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.06] rounded-xl text-sm font-medium transition-all duration-300 border border-neutral-200/80 dark:border-white/10 hover:border-primary-200 dark:hover:border-white/20 shadow-sm hover:shadow-md"
            >
              Listening Practice
            </Link>
            <Link
              href="/dashboard/practice/reading"
              className="px-4 py-2 bg-white dark:bg-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.06] rounded-xl text-sm font-medium transition-all duration-300 border border-neutral-200/80 dark:border-white/10 hover:border-primary-200 dark:hover:border-white/20 shadow-sm hover:shadow-md"
            >
              Reading Practice
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
