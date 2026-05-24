/**
 * Types related to OpenAPI documents
 */

import { Document } from '@apitomy/data-models';

/**
 * Represents the state of an OpenAPI document in the editor
 */
export interface DocumentState {
    /**
     * The parsed OpenAPI document (from apitomy-data-models)
     */
    document: Document | null;

    /**
     * The original content as provided to the editor
     */
    originalContent: object | null;

    /**
     * Whether the document has been modified since loading
     */
    isDirty: boolean;

    /**
     * Loading state
     */
    isLoading: boolean;

    /**
     * Error state if document failed to load/parse
     */
    error: string | null;

    /**
     * Version counter that increments on every document change
     * Used to trigger re-renders when document is mutated
     */
    version: number;
}

/**
 * Validation problem from the data-models library
 */
export interface ValidationProblem {
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    nodePath: string;
}
