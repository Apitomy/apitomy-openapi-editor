/**
 * Command to change a vendor extension value on any extensible node
 */

import {Document, Extensible, Node, NodePath, NodePathUtil} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to change a vendor extension value on an extensible node
 */
export class ChangeExtensionCommand extends BaseCommand {
    private parentPath: NodePath;
    private name: string;
    private newValue: any;
    private oldValue: any;

    /**
     * Constructor
     * @param parent The parent node that implements Extensible
     * @param name The extension name
     * @param newValue The new extension value
     */
    constructor(parent: Extensible, name: string, newValue: any) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent as unknown as Node);
        this.name = name;
        this.newValue = newValue;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'ChangeExtensionCommand';
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
        if (extensions && extensions.hasOwnProperty(this.name)) {
            this.oldValue = extensions[this.name];
        }
        (parent as unknown as Extensible).addExtension(this.name, this.newValue);
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
