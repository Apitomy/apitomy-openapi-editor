/**
 * Source form for editing OpenAPI source code
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem,
    ToggleGroup,
    ToggleGroupItem,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useDocument } from '@hooks/useDocument';
import { useSelection } from '@hooks/useSelection';
import { useCommand } from '@hooks/useCommand';
import { Library } from '@apitomy/data-models';
import { UpdateNodeCommand } from '@commands/UpdateNodeCommand';
import * as YAML from 'yaml';
import './SourceForm.css';

type SourceFormat = 'json' | 'yaml';

/**
 * Source form component for editing OpenAPI source code
 */
export const SourceForm: React.FC = () => {
    const { document } = useDocument();
    const { navigationObject } = useSelection();
    const { executeCommand } = useCommand();

    // Track the current format (JSON or YAML)
    const [format, setFormat] = useState<SourceFormat>('json');

    // Track whether dark theme is active by observing the HTML element
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
        if (typeof window !== 'undefined' && window.document?.documentElement) {
            return window.document.documentElement.classList.contains('pf-v6-theme-dark');
        }
        return false;
    });

    // Track the original source code
    const [originalSource, setOriginalSource] = useState<string>('');

    // Track the current edited source code
    const [currentSource, setCurrentSource] = useState<string>('');

    // Track dirty state
    const [isDirty, setIsDirty] = useState<boolean>(false);

    // Track validity state
    const [isValid, setIsValid] = useState<boolean>(true);

    // Debounce timer for validation
    const validationTimerRef = useRef<number | null>(null);

    /**
     * Get the selected model as a JSON string
     */
    const getSelectedModelJSON = (): string => {
        // Use the navigation object if available, otherwise use the document
        const modelToSerialize = navigationObject || document;

        if (!modelToSerialize) {
            return '{}';
        }

        // Use Library.writeNode() to convert the model to JSON
        const nodeObj = Library.writeNode(modelToSerialize);
        return JSON.stringify(nodeObj, null, 2);
    };

    /**
     * Get the selected model as a YAML string
     */
    const getSelectedModelYAML = (): string => {
        // Use the navigation object if available, otherwise use the document
        const modelToSerialize = navigationObject || document;

        if (!modelToSerialize) {
            return '';
        }

        // Use Library.writeNode() to convert the model to an object
        const nodeObj = Library.writeNode(modelToSerialize);

        // Convert to YAML string
        return YAML.stringify(nodeObj, { indent: 2 });
    };

    /**
     * Get the source code in the current format
     */
    const getSourceInFormat = (sourceFormat: SourceFormat): string => {
        return sourceFormat === 'json' ? getSelectedModelJSON() : getSelectedModelYAML();
    };

    /**
     * Validate source code based on current format
     */
    const validateSource = (source: string, sourceFormat: SourceFormat): boolean => {
        if (!source.trim()) {
            return false;
        }

        try {
            if (sourceFormat === 'json') {
                JSON.parse(source);
            } else {
                YAML.parse(source);
            }
            return true;
        } catch {
            return false;
        }
    };

    /**
     * Convert source from one format to another
     */
    const convertFormat = (source: string, fromFormat: SourceFormat, toFormat: SourceFormat): string => {
        try {
            let obj: any;

            // Parse from current format
            if (fromFormat === 'json') {
                obj = JSON.parse(source);
            } else {
                obj = YAML.parse(source);
            }

            // Convert to target format
            if (toFormat === 'json') {
                return JSON.stringify(obj, null, 2);
            } else {
                return YAML.stringify(obj, { indent: 2 });
            }
        } catch {
            // If conversion fails, return the original source
            return source;
        }
    };

    /**
     * Initialize source code when document or navigation object changes
     * Note: We do NOT include 'format' in the dependency array because format changes
     * are handled by handleFormatChange, which converts the current editor contents
     */
    useEffect(() => {
        // Clear any pending validation
        if (validationTimerRef.current !== null) {
            clearTimeout(validationTimerRef.current);
            validationTimerRef.current = null;
        }

        const source = getSourceInFormat(format);
        setOriginalSource(source);
        setCurrentSource(source);
        setIsDirty(false);
        setIsValid(true);
    }, [document, navigationObject]);

    /**
     * Handle source code changes in the editor
     * Updates the editor immediately but debounces validation and dirty checking
     */
    const handleSourceChange = (value: string) => {
        // Update the editor content immediately for responsive typing
        setCurrentSource(value);

        // Clear any existing validation timer
        if (validationTimerRef.current !== null) {
            clearTimeout(validationTimerRef.current);
        }

        // Debounce validation and dirty checking (500ms delay)
        validationTimerRef.current = window.setTimeout(() => {
            setIsDirty(value !== originalSource);
            setIsValid(validateSource(value, format));
            validationTimerRef.current = null;
        }, 500);
    };

    /**
     * Observe theme changes by watching the HTML element's class attribute
     */
    useEffect(() => {
        if (typeof window === 'undefined' || !window.document?.documentElement) {
            return;
        }

        const observer = new MutationObserver(() => {
            const hasDarkTheme = window.document.documentElement.classList.contains('pf-v6-theme-dark');
            setIsDarkTheme(hasDarkTheme);
        });

        observer.observe(window.document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    /**
     * Cleanup validation timer on unmount
     */
    useEffect(() => {
        return () => {
            if (validationTimerRef.current !== null) {
                clearTimeout(validationTimerRef.current);
            }
        };
    }, []);

    /**
     * Handle format toggle (JSON/YAML)
     * Converts the actual editor contents (including any user edits) to the new format
     */
    const handleFormatChange = (_event: any, isSelected: boolean, newFormat: SourceFormat) => {
        if (isSelected && newFormat !== format) {
            // Clear any pending validation
            if (validationTimerRef.current !== null) {
                clearTimeout(validationTimerRef.current);
                validationTimerRef.current = null;
            }

            // Convert the actual editor contents (currentSource) to the new format
            // This preserves any edits the user has made
            const converted = convertFormat(currentSource, format, newFormat);
            setFormat(newFormat);
            setCurrentSource(converted);

            // Also convert the original baseline source to maintain dirty tracking
            const convertedOriginal = convertFormat(originalSource, format, newFormat);
            setOriginalSource(convertedOriginal);

            // Update dirty state by comparing converted editor contents to converted original
            setIsDirty(converted !== convertedOriginal);

            // Validate the converted source immediately
            setIsValid(validateSource(converted, newFormat));
        }
    };

    /**
     * Handle Format button click
     */
    const handleFormat = () => {
        if (!isValid) {
            return;
        }

        // Clear any pending validation
        if (validationTimerRef.current !== null) {
            clearTimeout(validationTimerRef.current);
            validationTimerRef.current = null;
        }

        try {
            // Re-format the current source
            const formatted = convertFormat(currentSource, format, format);
            setCurrentSource(formatted);
            setIsDirty(formatted !== originalSource);
        } catch (err) {
            console.error('Failed to format source:', err);
        }
    };

    /**
     * Handle Revert button click
     */
    const handleRevert = () => {
        // Clear any pending validation
        if (validationTimerRef.current !== null) {
            clearTimeout(validationTimerRef.current);
            validationTimerRef.current = null;
        }

        setCurrentSource(originalSource);
        setIsDirty(false);
        setIsValid(true);
    };

    /**
     * Handle Save button click
     */
    const handleSave = () => {
        // Validate that we can save
        if (!isValid || !navigationObject) {
            console.error('Cannot save: content is invalid or no navigation object selected');
            return;
        }

        // Clear any pending validation
        if (validationTimerRef.current !== null) {
            clearTimeout(validationTimerRef.current);
            validationTimerRef.current = null;
        }

        try {
            // Parse the current source based on format
            let parsedContent: any;
            if (format === 'json') {
                parsedContent = JSON.parse(currentSource);
            } else {
                parsedContent = YAML.parse(currentSource);
            }

            // Create and execute the update command
            const command = new UpdateNodeCommand(navigationObject, parsedContent);
            executeCommand(command, 'Update from source editor');

            // Update the original source to the current source (now saved)
            setOriginalSource(currentSource);
            setIsDirty(false);
        } catch (err) {
            console.error('Failed to save source changes:', err);
            // TODO: Show error message to user
        }
    };

    return (
        <div className="source-form">
            {/* Toolbar with actions */}
            <Toolbar>
                <ToolbarContent>
                    <ToolbarGroup>
                        <ToolbarItem>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleFormat}
                                isDisabled={!isValid}
                            >
                                Format
                            </Button>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleRevert}
                                isDisabled={!isDirty}
                            >
                                Revert
                            </Button>
                        </ToolbarItem>
                        <ToolbarItem>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSave}
                                isDisabled={!isDirty || !isValid}
                            >
                                Save
                            </Button>
                        </ToolbarItem>
                    </ToolbarGroup>

                    <ToolbarGroup align={{ default: 'alignEnd' }}>
                        <ToolbarItem>
                            <ToggleGroup aria-label="Source format toggle">
                                <ToggleGroupItem
                                    text="JSON"
                                    buttonId="json-toggle"
                                    isSelected={format === 'json'}
                                    isDisabled={!isValid}
                                    onChange={(event, isSelected) => handleFormatChange(event, isSelected, 'json')}
                                />
                                <ToggleGroupItem
                                    text="YAML"
                                    buttonId="yaml-toggle"
                                    isSelected={format === 'yaml'}
                                    isDisabled={!isValid}
                                    onChange={(event, isSelected) => handleFormatChange(event, isSelected, 'yaml')}
                                />
                            </ToggleGroup>
                        </ToolbarItem>
                    </ToolbarGroup>
                </ToolbarContent>
            </Toolbar>

            {/* Code Editor */}
            <div className="source-editor-container">
                <CodeEditor
                    isReadOnly={false}
                    code={currentSource}
                    onChange={handleSourceChange}
                    language={format === 'json' ? Language.json : Language.yaml}
                    height="100%"
                    isDarkTheme={isDarkTheme}
                />
            </div>
        </div>
    );
};
