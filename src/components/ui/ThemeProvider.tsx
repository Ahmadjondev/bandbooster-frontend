'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'bandbooster-theme';

function getSystemTheme(): ResolvedTheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
    }
    return 'system';
}

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
    const [mounted, setMounted] = useState(false);

    // Initialize theme from storage
    useEffect(() => {
        const stored = getStoredTheme();
        setThemeState(stored);
        setMounted(true);
    }, []);

    // Update resolved theme and apply to document
    useEffect(() => {
        if (!mounted) return;

        const resolved = theme === 'system' ? getSystemTheme() : theme;
        setResolvedTheme(resolved);

        // Apply theme class to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);

        // Also set color-scheme for native elements
        root.style.colorScheme = resolved;
    }, [theme, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (!mounted || theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setResolvedTheme(e.matches ? 'dark' : 'light');
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(storageKey, newTheme);
    }, [storageKey]);

    const toggleTheme = useCallback(() => {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }, [resolvedTheme, setTheme]);

    // Prevent flash of wrong theme
    const value: ThemeContextValue = {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Hook for checking if mounted (useful for SSR)
export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
