/**
 * Zustand store for selection state
 */

import { create } from 'zustand/react';
import {Node, NodePath} from '@apitomy/data-models';
import { SelectionState } from '@models/SelectionTypes';

interface SelectionStore extends SelectionState {
    /**
     * Select a node by path
     */
    selectNode: (path: NodePath, node: Node | null, propertyName: string | null | undefined, navigationObject: Node | null, navigationObjectType: string | null) => void;

    /**
     * Clear the current selection
     */
    clearSelection: () => void;

    /**
     * Toggle highlight on the selected node
     */
    setHighlight: (highlight: boolean) => void;

    /**
     * Reset the store to initial state
     */
    reset: () => void;
}

const initialState: SelectionState = {
    selectedPath: null,
    selectedNode: null,
    navigationObject: null,
    navigationObjectType: null,
    selectedPropertyName: null,
    highlightSelection: false,
};

export const useSelectionStore = create<SelectionStore>((set) => ({
    ...initialState,

    selectNode: (path: NodePath, node: Node | null, propertyName: string | null | undefined, navigationObject: Node | null, navigationObjectType: string | null) => {
        set({
            selectedPath: path,
            selectedNode: node,
            selectedPropertyName: propertyName ?? null,
            navigationObject: navigationObject,
            navigationObjectType: navigationObjectType,
            highlightSelection: false,
        });
    },

    clearSelection: () => {
        set({
            selectedPath: null,
            selectedNode: null,
            navigationObject: null,
            navigationObjectType: null,
            selectedPropertyName: null,
            highlightSelection: false,
        });
    },

    setHighlight: (highlight: boolean) => {
        set({ highlightSelection: highlight });
    },

    reset: () => {
        set(initialState);
    },
}));
