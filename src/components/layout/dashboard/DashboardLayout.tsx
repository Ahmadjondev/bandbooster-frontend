'use client';

import { useState, useEffect, useCallback, useSyncExternalStore, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const SIDEBAR_COLLAPSED_KEY = 'dashboard-sidebar-collapsed';

// Custom hook for localStorage-backed state with SSR safety
function useLocalStorageState(key: string, defaultValue: boolean): [boolean, (value: boolean) => void] {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored === 'true';
  };

  const getServerSnapshot = () => defaultValue;

  const subscribe = (callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback((newValue: boolean) => {
    localStorage.setItem(key, String(newValue));
    // Trigger re-render by dispatching storage event
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, [key]);

  return [value, setValue];
}

interface UserData {
  name: string;
  email: string;
  isPremium: boolean;
}

// Custom hook for loading user from localStorage - uses useState to avoid infinite loop
function useUser(): UserData | null {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('user');
      if (!stored) {
        setUser(null);
        return;
      }
      try {
        const userData = JSON.parse(stored);
        setUser({
          name: userData.first_name || userData.username || 'Student',
          email: userData.email || 'student@example.com',
          isPremium: userData.is_premium || false,
        });
      } catch {
        setUser(null);
      }
    };

    loadUser();

    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return user;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Use localStorage-backed state for sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorageState(SIDEBAR_COLLAPSED_KEY, false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useUser();

  // Persist sidebar state to localStorage
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
      // Only auto-collapse on small screens if user hasn't set a preference
      const storedPreference = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (window.innerWidth < 1080 && storedPreference === null) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarCollapsed]);

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
          onToggle={handleSidebarToggle}
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
