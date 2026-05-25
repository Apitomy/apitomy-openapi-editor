/**
 * Command to delete a vendor extension from any extensible node
 */

import {Document, Extensible, Node, NodePath, NodePathUtil} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a vendor extension from an extensible node
 */
export class DeleteExtensionCommand extends BaseCommand {
    private parentPath: NodePath;
    private name: string;
    private oldValue: any;

    /**
     * Constructor
     * @param parent The parent node that implements Extensible
     * @param name The extension name to delete
     */
    constructor(parent: Extensible, name: string) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent as unknown as Node);
        this.name = name;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteExtensionCommand';
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
        if (extensions && Object.prototype.hasOwnProperty.call(extensions, this.name)) {
            this.oldValue = extensions[this.name];
        }
        (parent as unknown as Extensible).removeExtension(this.name);
    }

    /**
     * Undo the command
     */
    undo(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            return;
        }

        (parent as unknown as Extensible).addExtension(this.name, this.oldValue);
    }

    /**
     * Get the parent node from the document using the stored NodePath
     */
    private getParentNode(document: Document): Node | null {
        return NodePathUtil.resolveNodePath(this.parentPath, document) as Node;
    }
}
