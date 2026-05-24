/**
 * Custom hook for managing node selection
 */

import { useSelectionStore } from '@stores/selectionStore';
import { useEditorServices } from '@services/EditorContext';
import { Node, NodePath } from '@apitomy/data-models';
import { SelectionChangeEvent } from '@models/SelectionTypes';

// Re-export SelectionChangeEvent for convenience
export type { SelectionChangeEvent };

/**
 * Hook for working with node selection
 */
export const useSelection = () => {
    const { selectionService } = useEditorServices();

    // Subscribe to selection store state
    const selectedPath = useSelectionStore((state) => state.selectedPath);
    const selectedNode = useSelectionStore((state) => state.selectedNode);
    const selectedPropertyName = useSelectionStore((state) => state.selectedPropertyName);
    const navigationObject = useSelectionStore((state) => state.navigationObject);
    const navigationObjectType = useSelectionStore((state) => state.navigationObjectType);
    const highlightSelection = useSelectionStore((state) => state.highlightSelection);

    return {
        // State
        selectedPath,
        selectedNode,
        selectedPropertyName,
        navigationObject,
        navigationObjectType,
        highlightSelection,

        // Actions
        select: (target: Node | NodePath, propertyName?: string | null, highlight?: boolean) =>
            selectionService.select(target, propertyName, highlight),
        selectFromEvent: (event: SelectionChangeEvent, highlight?: boolean) =>
            selectionService.selectFromEvent(event, highlight),
        createSelectionChangeEvent: () => selectionService.createSelectionChangeEvent(),
        clearSelection: () => selectionService.clearSelection(),
        selectRoot: () => selectionService.selectRoot(),
        highlightCurrent: () => selectionService.highlightSelection(),
        reset: () => selectionService.reset(),
    };
};
