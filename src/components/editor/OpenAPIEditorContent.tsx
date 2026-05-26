/* eslint-disable react-hooks/exhaustive-deps -- intentional: run once on mount */
 
/**
 * OpenAPI Editor content (wrapped by EditorProvider)
 */

import React, { useEffect, useState } from 'react';
import { OpenAPIEditorProps } from '@models/EditorProps';
import { useDocument } from '@hooks/useDocument';
import { useSelection } from '@hooks/useSelection';
import { EditorLayout } from './EditorLayout';
import { EditorToolbar, EditorView, EditorMode } from './EditorToolbar';
import './OpenAPIEditorContent.css';

/**
 * The content of the OpenAPI Editor (requires EditorProvider)
 */
export const OpenAPIEditorContent: React.FC<OpenAPIEditorProps> = ({
    initialContent,
    onChange,
    onSelectionChange,
}) => {
    const { document, isDirty, version, loadDocument, toObject } = useDocument();
    const { selectedPath, selectedPropertyName, selectRoot } = useSelection();
    const [currentView, setCurrentView] = useState<EditorView>('navigation');
    const [currentMode, setCurrentMode] = useState<EditorMode>('design');

    /**
     * Load content when initialContent changes (only on first load)
     */
    useEffect(() => {
        if (initialContent) {
            loadDocument(initialContent, true);
            selectRoot();
     
        }
    }, [initialContent]); // Only run on initial load

    /**
     * Notify parent when document changes
     * Use callback pattern to avoid serializing document until needed
     */
    useEffect(() => {
        // Fire onChange event when document becomes dirty
        if (onChange) {
            onChange({
                isDirty,
                version,
                getContent: () => toObject(),
            });
        }
         
    }, [version]);

    /**
     * Notify parent when selection changes
     */
    useEffect(() => {
        if (onSelectionChange && selectedPath) {
            onSelectionChange({
                path: selectedPath,
                propertyName: selectedPropertyName,
            });
        }
    }, [selectedPath, selectedPropertyName, onSelectionChange]);

    return (
        <div className="apitomy-openapi-editor">
            {/* Toolbar */}
            <EditorToolbar
                currentView={currentView}
                onViewChange={setCurrentView}
                currentMode={currentMode}
                onModeChange={setCurrentMode}
            />

            {/* Editor content */}
            <div className="editor-content">
                {!document ? (
                    <div style={{ padding: '1rem' }}>
                        <p>Loading OpenAPI document...</p>
                        {initialContent && (
                            <pre style={{ fontSize: '0.85em', maxHeight: '400px', overflow: 'auto' }}>
                                {typeof initialContent === 'string'
                                    ? initialContent
                                    : JSON.stringify(initialContent, null, 2)}
                            </pre>
                        )}
                    </div>
                ) : (
                    <EditorLayout
                        showValidationPanel={currentView === 'validation'}
                        editorMode={currentMode}
                    />
                )}
            </div>
        </div>
    );
};
