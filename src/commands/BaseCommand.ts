/**
 * Base command class with selection tracking
 */

import {Document, NodePath} from '@apitomy/data-models';
import { ICommand } from './ICommand';
import {SelectionChangeEvent} from '@models/SelectionTypes';

/**
 * Abstract base class for commands that includes selection tracking
 */
export abstract class BaseCommand implements ICommand {
    private _selection: NodePath | null = null;
    private _propertyName: string | null = null;

    /**
     * Returns the type/name of the command
     */
    abstract type(): string;

    /**
     * Execute the command
     * @param document The OpenAPI document to modify
     */
    abstract execute(document: Document): void;

    /**
     * Undo the command
     * @param document The OpenAPI document to restore
     */
    abstract undo(document: Document): void;

    /**
     * Get the selection path that was active when this command was created
     */
    getSelection(): NodePath | null {
        return this._selection;
    }

    /**
     * Get the property name that was active when this command was created
     */
    getPropertyName(): string | null {
        return this._propertyName;
    }

    /**
     * Set the selection path and property name for this command
     * @param selection The selection path (e.g., "/paths//pets", "/components/schemas/Pet")
     * @param propertyName Optional property name for fine-grained selection
     */
    setSelection(selection: NodePath | null, propertyName?: string | null): void {
        this._selection = selection;
        this._propertyName = propertyName ?? null;
    }

    /**
     * Get the selection as a SelectionChangeEvent
     * This is a convenience method that combines getSelection() and getPropertyName()
     */
    getSelectionEvent(): SelectionChangeEvent | null {
        if (!this._selection) {
            return null;
        }

        return {
            path: this._selection,
            propertyName: this._propertyName
        };
    }

    /**
     * Set the selection from a SelectionChangeEvent
     * This is a convenience method for setSelection()
     * @param event The selection change event
     */
    setSelectionFromEvent(event: SelectionChangeEvent): void {
        this.setSelection(event.path, event.propertyName);
    }
}
