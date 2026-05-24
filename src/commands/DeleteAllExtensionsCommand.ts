/**
 * Command to delete all vendor extensions from any extensible node
 */

import {Document, Extensible, Node, NodePath, NodePathUtil} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete all vendor extensions from an extensible node
 */
export class DeleteAllExtensionsCommand extends BaseCommand {
    private parentPath: NodePath;
    private oldExtensions: any;

    /**
     * Constructor
     * @param parent The parent node that implements Extensible
     */
    constructor(parent: Extensible) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent as unknown as Node);
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteAllExtensionsCommand';
    }

    /**
     * Execute the command
     */
    execute(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            throw new Error(`Parent node not found: ${this.parentPath.toString()}`);
        }

        const extensions = (parent as unknown as Extensible).getExtensions();
        if (extensions) {
            // Store a copy of all extensions
            this.oldExtensions = { ...extensions };
        }
        (parent as unknown as Extensible).clearExtensions();
    }

    /**
     * Undo the command
     */
    undo(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            return;
        }

        if (this.oldExtensions) {
            // Restore all extensions
            Object.keys(this.oldExtensions).forEach(name => {
                (parent as unknown as Extensible).addExtension(name, this.oldExtensions[name]);
            });
        }
    }

    /**
     * Get the parent node from the document using the stored NodePath
     */
    private getParentNode(document: Document): Node | null {
        return NodePathUtil.resolveNodePath(this.parentPath, document) as Node;
    }
}
