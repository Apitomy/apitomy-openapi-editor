/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- intentional state sync patterns */
 
/**
 * Reusable component for editing a single property of a model
 */

import React, { useState, useEffect } from 'react';
import { FormGroup, TextInput, TextArea } from '@patternfly/react-core';
import { Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { useCommand } from '@hooks/useCommand';
import { useSelection } from '@hooks/useSelection';
import { useDocumentStore } from '@stores/documentStore';
import { ChangePropertyCommand } from '@commands/ChangePropertyCommand';
import { ICommand } from "@commands/ICommand.ts";

export interface PropertyInputProps {
    /**
     * The model/node to edit
     */
    model: Node | null;

    /**
     * The property name to edit
     */
    propertyName: string;

    /**
     * Optional node path - used as fallback for selection when model is null
     */
    nodePath?: NodePath | null;

    /**
     * Label to display for the input
     */
    label: string;

    /**
     * Type of input to use
     */
    type?: 'text' | 'textarea';

    /**
     * Placeholder text
     */
    placeholder?: string;

    /**
     * Optional field ID (defaults to propertyName)
     */
    fieldId?: string;

    /**
     * Whether the field is required
     */
    isRequired?: boolean;

    /**
     * Optional command factory.  Use this to customize the behavior when the input value changes.
     */
    commandFactory?: (model: Node, propertyName: string, value: string, description: string) => ICommand;
}

/**
 * Component for editing a single property of a model with automatic change detection and command execution
 */
export const PropertyInput: React.FC<PropertyInputProps> = ({
    model,
    propertyName,
    nodePath,
    label,
    type = 'text',
    placeholder,
    fieldId,
    isRequired = false,
    commandFactory,
}) => {
    const { executeCommand } = useCommand();
    const { select } = useSelection();
    const version = useDocumentStore((state) => state.version);

    /**
     * Get the current value from the model
     */
    const getCurrentValue = (): string => {
        if (!model) return '';

        // Try getter method first (e.g., getSummary())
        const getterName = `get${propertyName.charAt(0).toUpperCase()}${propertyName.slice(1)}`;
        if (typeof (model as any)[getterName] === 'function') {
            return (model as any)[getterName]() || '';
        }

        // Fall back to direct property access
        return (model as any)[propertyName] || '';
    };

    // Local state for the input value
    const [value, setValue] = useState(getCurrentValue());

    /**
     * Update local state when model changes (e.g., from undo/redo or external changes)
     */
     
    useEffect(() => {
        const newValue = getCurrentValue();
     
        setValue(newValue);
    }, [version, model, propertyName]); // Re-run when document version changes (undo/redo), model, or propertyName changes

    /**
     * Handle committing the change
     */
    const handleCommit = () => {
        if (value !== getCurrentValue()) {
            const description = `Change ${label.toLowerCase()} to "${value}"`;
            const command = commandFactory ?
                commandFactory(model as Node, propertyName, value, description) :
                new ChangePropertyCommand(model as Node, propertyName, value);
            executeCommand(command, description);
        }
    };

    /**
     * Handle Enter key press (only for text inputs, not textareas)
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type === 'text') {
            e.preventDefault();
            handleCommit();
        }
    };

    /**
     * Handle focus - fire selection event
     */
    const handleFocus = () => {
        const target = model || nodePath;
        if (target) {
            select(target, propertyName);
        }
    };

    const inputFieldId = fieldId || `property-${propertyName}`;

    // Compute the path string for data-path attribute
    const pathString = model ? NodePathUtil.createNodePath(model).toString() : nodePath?.toString() || '';

    return (
        <FormGroup
            label={label}
            fieldId={inputFieldId}
            isRequired={isRequired}
            data-path={pathString}
            data-property-name={propertyName}
            data-selectable="true"
        >
            {type === 'textarea' ? (
                <TextArea
                    id={inputFieldId}
                    value={value}
                    onChange={(_event, newValue) => setValue(newValue)}
                    onFocus={handleFocus}
                    onBlur={handleCommit}
                    aria-label={label}
                    placeholder={placeholder}
                    resizeOrientation="vertical"
                />
            ) : (
                <TextInput
                    id={inputFieldId}
                    type="text"
                    value={value}
                    onChange={(_event, newValue) => setValue(newValue)}
                    onFocus={handleFocus}
                    onBlur={handleCommit}
                    onKeyDown={handleKeyDown}
                    aria-label={label}
                    placeholder={placeholder}
                />
            )}
        </FormGroup>
    );
};
