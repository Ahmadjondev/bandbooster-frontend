'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Icons
const icons = {
  bell: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  user: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logout: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  settings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  menu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  x: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  chevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

interface User {
  name: string;
  email: string;
  avatar?: string;
  isPremium?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
}

interface NavbarProps {
  user?: User;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({ user, onMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Practice Completed!',
      message: 'You scored 85% on Reading Practice #3',
      time: '5 min ago',
      isRead: false,
      type: 'success',
    },
    {
      id: '2',
      title: 'New Listening Tests',
      message: '5 new listening practices are available',
      time: '1 hour ago',
      isRead: false,
      type: 'info',
    },
    {
      id: '3',
      title: 'Weekly Goal',
      message: "You're 2 practices away from your weekly goal",
      time: '2 hours ago',
      isRead: true,
      type: 'warning',
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Redirect to login
    window.location.href = '/login';
  };

  const defaultUser: User = {
    name: 'Student',
    email: 'student@example.com',
    isPremium: false,
  };

  const currentUser = user || defaultUser;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed top-0 right-0 left-0 z-30 h-16',
          'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
          'border-b border-neutral-200 dark:border-neutral-800',
          'transition-all duration-300'
        )}
        style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              {isMobileMenuOpen ? (
                <icons.x className="w-5 h-5" />
              ) : (
                <icons.menu className="w-5 h-5" />
              )}
            </motion.button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <motion.div
                initial={false}
                animate={{ width: isSearchOpen ? 320 : 200 }}
                className="relative"
              >
                <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search practices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  className={cn(
                    'w-full pl-10 pr-16 py-2 rounded-xl text-sm',
                    'bg-neutral-100 dark:bg-neutral-800',
                    'border border-transparent focus:border-primary-500',
                    'text-neutral-900 dark:text-white placeholder-neutral-400',
                    'outline-none transition-all duration-200'
                  )}
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-neutral-400 bg-neutral-200 dark:bg-neutral-700 rounded">
                  ⌘K
                </kbd>
              </motion.div>
            </div>
          </div>

          {/* Right Section - Theme Toggle, Notifications & Profile */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              <icons.search className="w-5 h-5" />
            </motion.button>

            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  'relative p-2 rounded-xl transition-colors',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  isNotificationsOpen && 'bg-neutral-100 dark:bg-neutral-800'
                )}
              >
                <icons.bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'absolute right-0 mt-2 w-80 py-2',
                      'bg-white dark:bg-neutral-900',
                      'border border-neutral-200 dark:border-neutral-800',
                      'rounded-2xl shadow-xl'
                    )}
                  >
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="text-xs text-primary-600 hover:text-primary-700">
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors',
                            !notification.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
                          )}
                        >
                          <div className="flex gap-3">
                            <div
                              className={cn(
                                'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                                notification.type === 'success' && 'bg-green-500',
                                notification.type === 'info' && 'bg-blue-500',
                                notification.type === 'warning' && 'bg-amber-500'
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="px-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <Link
                        href="/dashboard/notifications"
                        className="block text-center text-sm text-primary-600 hover:text-primary-700 py-1"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-colors',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  isProfileOpen && 'bg-neutral-100 dark:bg-neutral-800'
                )}
              >
                <div className="relative">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {currentUser.email}
                  </p>
                </div>
                <icons.chevronDown
                  className={cn(
                    'w-4 h-4 text-neutral-400 transition-transform duration-200',
                    isProfileOpen && 'rotate-180'
                  )}
                />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'absolute right-0 mt-2 w-56 py-2',
                      'bg-white dark:bg-neutral-900',
                      'border border-neutral-200 dark:border-neutral-800',
                      'rounded-2xl shadow-xl'
                    )}
                  >
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <icons.user className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <icons.settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <icons.logout className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search practices..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl text-base',
                      'bg-neutral-100 dark:bg-neutral-800',
                      'text-neutral-900 dark:text-white placeholder-neutral-400',
                      'outline-none'
                    )}
                  />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-neutral-500"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
