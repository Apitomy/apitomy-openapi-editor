/**
 * Command to add a vendor extension to any extensible node
 */

import {Document, Extensible, Node, NodePath, NodePathUtil} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to add a vendor extension to an extensible node
 */
export class AddExtensionCommand extends BaseCommand {
    private parentPath: NodePath;
    private name: string;
    private value: any;
    private oldValue: any;
    private existed: boolean = false;

    /**
     * Constructor
     * @param parent The parent node that implements Extensible
     * @param name The extension name (e.g., "x-custom")
     * @param value The extension value
     */
    constructor(parent: Extensible, name: string, value: any) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent as unknown as Node);
        this.name = name;
        this.value = value;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddExtensionCommand';
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
        this.existed = extensions && extensions.hasOwnProperty(this.name);
        if (this.existed) {
            this.oldValue = extensions[this.name];
        }
        (parent as any).addExtension(this.name, this.value);
    }

    /**
     * Undo the command
     */
    undo(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            return;
        }

        if (this.existed) {
            (parent as unknown as Extensible).addExtension(this.name, this.oldValue);
        } else {
            (parent as unknown as Extensible).removeExtension(this.name);
        }
    }

    /**
     * Get the parent node from the document using the stored NodePath
     */
    private getParentNode(document: Document): Node | null {
        return NodePathUtil.resolveNodePath(this.parentPath, document) as Node;
    }
}
