/**
 * Local command interface for undo/redo operations
 */

import {Document, NodePath} from '@apitomy/data-models';
import {SelectionChangeEvent} from '@models/SelectionTypes';

/**
 * Interface for commands that can be executed and undone
 */
export interface ICommand {
    /**
     * Returns the type/name of the command
     */
    type(): string;

    /**
     * Execute the command
     * @param document The OpenAPI document to modify
     */
    execute(document: Document): void;

    /**
     * Undo the command
     * @param document The OpenAPI document to restore
     */
    undo(document: Document): void;

    /**
     * Get the selection path that was active when this command was created
     * This allows undo/redo to restore the visual selection
     */
    getSelection(): NodePath | null;

    /**
     * Get the property name that was active when this command was created
     * This allows undo/redo to restore the specific property selection
     */
    getPropertyName(): string | null;

    /**
     * Set the selection path and property name for this command
     * @param selection The selection path (e.g., "/paths//pets", "/components/schemas/Pet")
     * @param propertyName Optional property name for fine-grained selection
     */
    setSelection(selection: NodePath | null, propertyName?: string | null): void;

    /**
     * Get the selection as a SelectionChangeEvent
     * This is a convenience method that combines getSelection() and getPropertyName()
     */
    getSelectionEvent(): SelectionChangeEvent | null;

    /**
     * Set the selection from a SelectionChangeEvent
     * This is a convenience method for setSelection()
     * @param event The selection change event
     */
    setSelectionFromEvent(event: SelectionChangeEvent): void;
}
