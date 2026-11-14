"use client";

import React, { createContext, useContext, ReactNode } from "react";

/**
 * Configuration for AI features in the Notiq editor.
 */
export interface AIConfig {
    /**
     * The API endpoint for AI completions. Defaults to "/api/ai".
     */
    apiEndpoint?: string;
    /**
     * Default writing style preset ("balanced" | "technical" | "editorial" | "executive" | "academic").
     */
    writingStyle?: string;
    /**
     * Custom brand voice / style guide instructions injected into AI prompts.
     */
    styleGuide?: string;
}

const AIContext = createContext<AIConfig>({
    apiEndpoint: "/api/ai",
});

/**
 * Hook to access the current AI configuration.
 */
export const useAI = () => useContext(AIContext);

/**
 * Provider component for AI configuration.
 */
export const AIProvider = ({
    config,
    children
}: {
    config?: AIConfig;
    children: ReactNode
}) => {
    const value = React.useMemo(() => ({
        apiEndpoint: config?.apiEndpoint || "/api/ai",
        writingStyle: config?.writingStyle,
        styleGuide: config?.styleGuide,
    }), [config]);

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    );
};
