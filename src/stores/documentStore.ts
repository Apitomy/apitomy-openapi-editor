/**
 * Zustand store for OpenAPI document state
 */

import { create } from 'zustand/react';
import { Document } from '@apitomy/data-models';
import { DocumentState } from '@models/DocumentTypes';

interface DocumentStore extends DocumentState {
    /**
     * Load and parse an OpenAPI document
     */
    loadDocument: (content: object | string) => void;

    /**
     * Update the document (after a command is executed)
     */
    updateDocument: (document: Document) => void;

    /**
     * Mark the document as dirty (modified)
     */
    markDirty: () => void;

    /**
     * Mark the document as clean (saved)
     */
    markClean: () => void;

    /**
     * Set an error state
     */
    setError: (error: string | null) => void;

    /**
     * Reset the store to initial state
     */
    reset: () => void;
}

const initialState: DocumentState = {
    document: null,
    originalContent: null,
    isDirty: false,
    isLoading: false,
    error: null,
    version: 0,
};

export const useDocumentStore = create<DocumentStore>((set) => ({
    ...initialState,

    loadDocument: (content: object | string) => {
        set({ isLoading: true, error: null });
        try {
            // We'll implement actual parsing in the DocumentService
            // For now, just store the content
            const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
            set({
                originalContent: contentObj,
                isLoading: false,
                isDirty: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load document',
                isLoading: false,
            });
        }
    },

    updateDocument: (document: Document) => {
        set((state) => ({ document, isDirty: true, version: state.version + 1 }));
    },

    markDirty: () => {
        set((state) => ({ isDirty: true, version: state.version + 1 }));
    },

    markClean: () => {
        set({ isDirty: false });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    reset: () => {
        set(initialState);
    },
}));
