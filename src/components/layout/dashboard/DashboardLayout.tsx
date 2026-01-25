'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; isPremium?: boolean } | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          name: userData.first_name || userData.username || 'Student',
          email: userData.email || 'student@example.com',
          isPremium: userData.is_premium || false,
        });
      } catch {
        // Use default user
      }
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
      if (window.innerWidth < 1280) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update CSS variable for sidebar width
  useEffect(() => {
    const width = isSidebarCollapsed ? '80px' : '280px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [isSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 lg:hidden"
            >
              <Sidebar
                isCollapsed={false}
                onToggle={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          'lg:ml-(--sidebar-width)'
        )}
        style={{ '--sidebar-width': isSidebarCollapsed ? '80px' : '280px' } as React.CSSProperties}
      >
        {/* Navbar */}
        <Navbar
          user={user || undefined}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
