/**
 * Types related to node selection in the editor
 */

import {Node, NodePath} from '@apitomy/data-models';

/**
 * Represents the current selection state in the editor
 */
export interface SelectionState {
    /**
     * The path to the currently selected node (e.g., "/paths/~1pets/get")
     */
    selectedPath: NodePath | null;

    /**
     * The actual selected node from the document
     */
    selectedNode: Node | null;

    /**
     * Optional property name for fine-grained selection within a node
     * (e.g., "summary", "description", "operationId")
     */
    selectedPropertyName: string | null;

    /**
     * The top-level navigation object (PathItem, Schema, etc.) that contains the selected node
     * This is maintained separately to support granular selection without breaking navigation
     */
    navigationObject: Node | null;

    /**
     * The type of the selected navigation node (e.g., "path", "operation", "schema")
     */
    navigationObjectType: string | null;

    /**
     * Whether to highlight the selected node in the UI
     */
    highlightSelection: boolean;
}

/**
 * Selection event payload
 */
export interface SelectionEvent {
    path: NodePath;
    node: Node | null;
}

/**
 * Selection change event - represents a change in the editor selection
 */
export interface SelectionChangeEvent {
    /**
     * The path to the selected node
     */
    path: NodePath;

    /**
     * The optional property name for fine-grained selection
     */
    propertyName?: string | null;
}
