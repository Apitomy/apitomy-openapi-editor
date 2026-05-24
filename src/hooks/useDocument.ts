/**
 * Custom hook for accessing document state and operations
 */

import { useDocumentStore } from '@stores/documentStore';
import { useEditorServices } from '@services/EditorContext';
import { ModelTypeUtil } from '@apitomy/data-models';

/**
 * OpenAPI specification version
 */
export type SpecVersion = '2.0' | '3.0' | '3.1' | null;

/**
 * Determine the OpenAPI specification version from a document
 */
function getSpecVersion(document: any): SpecVersion {
    if (!document) {
        return null;
    }

    if (ModelTypeUtil.isOpenApi2Model(document)) {
        return '2.0';
    }

    if (ModelTypeUtil.isOpenApi30Model(document)) {
        return '3.0';
    }

    if (ModelTypeUtil.isOpenApi31Model(document)) {
        return '3.1';
    }

    return null;
}

/**
 * Hook for working with the OpenAPI document
 */
export const useDocument = () => {
    const { documentService } = useEditorServices();

    // Subscribe to document store state
    const document = useDocumentStore((state) => state.document);
    const isDirty = useDocumentStore((state) => state.isDirty);
    const isLoading = useDocumentStore((state) => state.isLoading);
    const error = useDocumentStore((state) => state.error);
    const version = useDocumentStore((state) => state.version);

    // Derive spec version from document (not stored)
    const specVersion = getSpecVersion(document);

    return {
        // State
        document,
        isDirty,
        isLoading,
        error,
        version,
        specVersion,

        // Actions
        loadDocument: (content: object | string, resetCommands?: boolean) =>
            documentService.loadDocument(content, resetCommands),
        getDocument: () => documentService.getDocument(),
        toObject: () => documentService.toObject(),
        toJSON: () => documentService.toJSON(),
        validateDocument: () => documentService.validateDocument(),
        reset: () => documentService.reset(),
    };
};
