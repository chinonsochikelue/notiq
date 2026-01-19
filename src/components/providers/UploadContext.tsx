"use client";

import React, { createContext, useContext, ReactNode } from "react";

export interface UploadResponse {
    url: string;
}

/**
 * A function that handles file uploads.
 * @param file The file to upload.
 * @param onProgress Callback to report upload progress (0-100).
 * @returns A promise that resolves to an object containing the uploaded file's URL.
 */
export type UploadHandler = (
    file: File,
    onProgress?: (progress: number) => void
) => Promise<UploadResponse>;

export interface UploadConfig {
    /**
     * Custom upload handler. If not provided, the editor will attempt to use its default
     * (which currently depends on EdgeStore if configured).
     */
    uploadHandler?: UploadHandler;
}

const UploadContext = createContext<UploadConfig | undefined>(undefined);

/**
 * Hook to access the current Upload configuration.
 */
export const useUpload = () => useContext(UploadContext);

/**
 * Provider component for Upload configuration.
 */
export const UploadProvider = ({
    config,
    children
}: {
    config?: UploadConfig;
    children: ReactNode
}) => {
    return (
        <UploadContext.Provider value={config || {}}>
            {children}
        </UploadContext.Provider>
    );
};
