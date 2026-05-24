/**
 * Service for managing node selection in the editor
 */

import {
    Node,
    NodePath,
    NodePathUtil,
    TraverserDirection,
    VisitorUtil
} from '@apitomy/data-models';
import {useSelectionStore} from '@stores/selectionStore';
import {useDocumentStore} from '@stores/documentStore';
import {NavigationObjectResolverVisitor} from '@visitors/NavigationObjectResolverVisitor';
import {resolveNearestNode} from '@utils/nodeUtils';
import {SelectionChangeEvent} from '@models/SelectionTypes';

/**
 * SelectionService handles node selection and navigation
 */
export class SelectionService {
    /**
     * Unified select method - accepts either a Node or a NodePath
     */
    select(target: Node | NodePath, propertyName?: string | null, highlight: boolean = false): void {
        const doc = useDocumentStore.getState().document;
        if (!doc) {
            console.warn('Cannot select: no document loaded');
            return;
        }

        if (target instanceof NodePath) {
            const resolvedNode = resolveNearestNode(target, doc);
            this.selectIt(target, resolvedNode, propertyName, highlight);
        } else {
            const nodePath: NodePath = NodePathUtil.createNodePath(target);
            this.selectIt(nodePath, target, propertyName, highlight);
        }
    }

    /**
     * Select using a SelectionChangeEvent
     */
    selectFromEvent(event: SelectionChangeEvent, highlight: boolean = false): void {
        this.select(event.path, event.propertyName, highlight);
    }

    /**
     * Create a SelectionChangeEvent from the current selection
     */
    createSelectionChangeEvent(): SelectionChangeEvent | null {
        const path = this.getSelectedPath();
        const propertyName = this.getSelectedPropertyName();

        if (!path) {
            return null;
        }

        return {
            path,
            propertyName
        };
    }

    /**
     * Select a node by NodePath
     */
    private selectIt(nodePath: NodePath, resolvedNode: Node | null, propertyName?: string | null, highlight: boolean = false): void {
        console.debug("[SelectionService] Selection changed: ", nodePath.toString(), propertyName);

        const doc = useDocumentStore.getState().document;
        try {
            // Handle case where node doesn't exist yet (e.g., selecting a non-existent operation)
            if (!resolvedNode) {
                console.warn(`No Node found for selection: ${nodePath.toString()}`);
                resolvedNode = doc;
            }

            // For root selection, use the document itself
            if (resolvedNode === doc) {
                useSelectionStore.getState().selectNode(nodePath, doc, propertyName, doc, 'info');
                if (highlight) {
                    useSelectionStore.getState().setHighlight(true);
                }
                return;
            }

            // Determine navigation object by visiting the data model in reverse to determine the
            // top level model from the node path.
            const resolver = new NavigationObjectResolverVisitor();
            VisitorUtil.visitTree(resolvedNode as Node, resolver, TraverserDirection.up);

            // Get the navigation object (PathItem, Schema, etc.) and node type
            const navigationObjectType: string = resolver.isFound() ? resolver.nodeType as string : 'info';
            const navigationObject: Node = resolver.isFound() ? resolver.node as Node : doc as Node;

            // Store the path with determined type and navigation object
            useSelectionStore.getState().selectNode(nodePath, resolvedNode, propertyName, navigationObject, navigationObjectType);
            if (highlight) {
                useSelectionStore.getState().setHighlight(true);
            }
        } catch (error) {
            console.error('Error selecting node:', error);
        }
    }

    /**
     * Clear the current selection
     */
    clearSelection(): void {
        useSelectionStore.getState().clearSelection();
    }

    /**
     * Select the root (main info object)
     */
    selectRoot(): void {
        const doc = useDocumentStore.getState().document;
        if (doc) {
            this.select(doc as any);
        }
    }

    /**
     * Get the currently selected node
     */
    getSelectedNode(): Node | null {
        return useSelectionStore.getState().selectedNode;
    }

    /**
     * Get the currently selected path
     */
    getSelectedPath(): NodePath | null {
        return useSelectionStore.getState().selectedPath;
    }

    /**
     * Get the current navigation object
     */
    getNavigationObject(): Node | null {
        return useSelectionStore.getState().navigationObject;
    }

    /**
     * Get the type of the currently selected navigation object
     */
    getNavigationObjectType(): string | null {
        return useSelectionStore.getState().navigationObjectType;
    }

    /**
     * Get the currently selected property name
     */
    getSelectedPropertyName(): string | null {
        return useSelectionStore.getState().selectedPropertyName;
    }

    /**
     * Highlight the current selection (scroll into view, etc.)
     */
    highlightSelection(): void {
        useSelectionStore.getState().setHighlight(true);
    }

    /**
     * Reset the selection state
     */
    reset(): void {
        useSelectionStore.getState().reset();
    }
}
