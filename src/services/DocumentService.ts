/**
 * Service for managing OpenAPI documents
 */

import { Document, Library } from '@apitomy/data-models';
import { useDocumentStore } from '@stores/documentStore';
import { useCommandStore } from '@stores/commandStore';
import { ValidationProblem } from '@models/DocumentTypes';

/**
 * DocumentService handles all operations related to the OpenAPI document
 */
export class DocumentService {
    /**
     * Load and parse an OpenAPI document from content
     * @param content The document content to load
     * @param resetCommands Whether to reset the undo/redo stack (default: true)
     */
    loadDocument(content: object | string, resetCommands: boolean = true): Document | null {
        console.info("[DocumentService] Loading document...");
        try {
            const store = useDocumentStore.getState();
            store.setError(null);

            let doc: Document;

            if (typeof content === 'string') {
                console.debug("[DocumentService] Loading content from string");
                doc = Library.readDocumentFromJSONString(content);
            } else {
                console.debug("[DocumentService] Loading content from object");
                doc = Library.readDocument(content);
            }

            store.updateDocument(doc);
            store.loadDocument(content);

            // Reset the command stack when loading a new document (if requested)
            if (resetCommands) {
                useCommandStore.getState().reset();
            }

            return doc;
        } catch (error) {
            const store = useDocumentStore.getState();
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse document';
            store.setError(errorMessage);
            return null;
        }
    }

    /**
     * Get the current document
     */
    getDocument(): Document | null {
        return useDocumentStore.getState().document;
    }

    /**
     * Serialize the document to a JavaScript object
     */
    toObject(): object | null {
        const doc = this.getDocument();
        if (!doc) {
            return null;
        }
        return Library.writeNode(doc) as object;
    }

    /**
     * Serialize the document to a JSON string
     */
    toJSON(): string | null {
        const obj = this.toObject();
        if (!obj) {
            return null;
        }
        return JSON.stringify(obj, null, 2);
    }

    /**
     * Validate the current document
     */
    validateDocument(): Promise<ValidationProblem[]> {
        const doc = this.getDocument();
        if (!doc) {
            return Promise.resolve([]);
        }

        return new Promise((resolve) => {
            try {
                // Use the data-models validation (pass null for default severity registry)
                const problems = Library.validate(doc, null as any);

                // Map to our ValidationProblem type
                const mappedProblems = problems.map((p: any) => ({
                    code: p.errorCode || '',
                    message: p.message || '',
                    severity: this.mapSeverity(p.severity || 0),
                    nodePath: p.nodePath ? p.nodePath.toString() : '',
                }));

                resolve(mappedProblems);
            } catch (error) {
                console.error('Validation error:', error);
                resolve([]);
            }
        });
    }

    /**
     * Map data-models severity to our severity type
     */
    private mapSeverity(severity: number): 'error' | 'warning' | 'info' {
        // Assuming: 0 = low/info, 1 = medium/warning, 2+ = high/error
        if (severity >= 2) {
            return 'error';
        } else if (severity === 1) {
            return 'warning';
        }
        return 'info';
    }

    /**
     * Check if the document has been modified
     */
    isDirty(): boolean {
        return useDocumentStore.getState().isDirty;
    }

    /**
     * Reset the document to initial state
     */
    reset(): void {
        useDocumentStore.getState().reset();
    }
}
