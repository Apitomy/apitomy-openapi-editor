/* eslint-disable react-refresh/only-export-components */
/**
 * React Context for providing editor services
 */

import React, { createContext, useContext, useMemo } from 'react';
import { DocumentService } from './DocumentService';
import { CommandService } from './CommandService';
import { SelectionService } from './SelectionService';
import { ValidationService } from './ValidationService';

/**
 * Editor services available via context
 */
export interface EditorServices {
    documentService: DocumentService;
    commandService: CommandService;
    selectionService: SelectionService;
    validationService: ValidationService;
}

/**
 * Context for editor services
 */
const EditorContext = createContext<EditorServices | null>(null);

/**
 * Provider props
 */
interface EditorProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component that creates and provides editor services
 */
export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
    const services = useMemo(() => {
        const documentService = new DocumentService();
        const commandService = new CommandService();
        const selectionService = new SelectionService();
        const validationService = new ValidationService();

        return {
            documentService,
            commandService,
            selectionService,
            validationService,
        };
    }, []);

    return <EditorContext.Provider value={services}>{children}</EditorContext.Provider>;
};

/**
 * Hook to access editor services
 */
export const useEditorServices = (): EditorServices => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditorServices must be used within an EditorProvider');
    }
    return context;
};
