/**
 * Command to update a node with new content from source editor
 */

import { Document, Node, NodePath, NodePathUtil, Library } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';
import { ClearNodeVisitor } from '@visitors/ClearNodeVisitor';

/**
 * Command to update a node with new content
 * Stores the old and new content as serialized JSON objects
 */
export class UpdateNodeCommand extends BaseCommand {
    private _nodePath: NodePath;
    private _oldContent: any;
    private _newContent: any;

    /**
     * Constructor
     * @param node The node to update
     * @param newContent The new content as a parsed object (not a string)
     */
    constructor(node: Node, newContent: any) {
        super();
        this._nodePath = NodePathUtil.createNodePath(node);

        // Store the new content
        this._newContent = newContent;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'UpdateNodeCommand';
    }

    /**
     * Execute the command - apply new content to the node
     */
    execute(document: Document): void {
        const node = this.getNode(document);
        if (!node) {
            throw new Error(`Node not found: ${this._nodePath.toString()}`);
        }

        this._oldContent = Library.writeNode(node);

        // Clear all properties from the node using the visitor
        const clearVisitor = new ClearNodeVisitor();
        node.accept(clearVisitor);

        // Apply the new content to the now-clean node
        Library.readNode(this._newContent, node);
    }

    /**
     * Undo the command - restore old content to the node
     */
    undo(document: Document): void {
        const node = this.getNode(document);
        if (!node) {
            return;
        }

        // Clear all properties from the node using the visitor
        const clearVisitor = new ClearNodeVisitor();
        node.accept(clearVisitor);

        // Restore the old content to the now-clean node
        Library.readNode(this._oldContent, node);
    }

    /**
     * Get the node from the document using the stored NodePath
     */
    private getNode(document: Document): Node | null {
        const resolved = NodePathUtil.resolveNodePath(this._nodePath, document);
        return resolved;
    }
}
