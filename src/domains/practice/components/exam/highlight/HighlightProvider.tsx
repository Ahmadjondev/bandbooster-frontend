/**
 * Highlight Context Provider
 * Provides highlighting functionality to all components in the tree
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useTextHighlight, type UseTextHighlightOptions } from './useTextHighlight';
import type { HighlightContextValue } from './types';

const HighlightContext = createContext<HighlightContextValue | null>(null);

export interface HighlightProviderProps {
    children: ReactNode;
    /** Options for the highlight hook */
    options?: UseTextHighlightOptions;
}

export function HighlightProvider({ children, options }: HighlightProviderProps) {
    const highlightValue = useTextHighlight(options);

    return (
        <HighlightContext.Provider value={highlightValue}>
            {children}
        </HighlightContext.Provider>
    );
}

export function useHighlightContext(): HighlightContextValue {
    const context = useContext(HighlightContext);

    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }

    return context;
}

/**
 * Optional hook that returns null if not within a provider
 * Useful for components that may or may not have highlighting
 */
export function useOptionalHighlightContext(): HighlightContextValue | null {
    return useContext(HighlightContext);
}

export default HighlightProvider;
