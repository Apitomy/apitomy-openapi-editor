import {Document, Node, NodePath, NodePathUtil, OpenApiDocument} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';
import {getCreator, getGetter, getSetter} from "@utils/nodeUtils.ts";

/**
 * Command to ensure that a child node exists.  The command creates the child node and adds
 * it if it does not already exist.
 */
export class EnsureChildNodeCommand extends BaseCommand {
    private _parentPath: NodePath;
    private _childPropertyName: string;
    private _parentExisted: boolean = false;
    private _childExisted: boolean = false;

    /**
     * Constructor
     */
    constructor(parentPath: NodePath, childPropertyName: string) {
        super();
        this._parentPath = parentPath;
        this._childPropertyName = childPropertyName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'EnsureChildNodeCommand';
    }

    /**
     * Execute the command - create child node if it doesn't exist
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;

        const parent: Node = NodePathUtil.resolveNodePath(this._parentPath, oaiDoc);
        if (parent === null) {
            this._parentExisted = false;
            return;
        }

        this._parentExisted = true;

        const getter = getGetter(parent, this._childPropertyName)
        const creator = getCreator(parent, this._childPropertyName);
        const setter = getSetter(parent, this._childPropertyName)

        if (!getter || !creator || !setter) {
            console.warn(`[EnsureChildNodeCommand] Failed to find getter, setter, or creator function for '${this._childPropertyName}' of ${this._parentPath.toString()}`);
            this._parentExisted = false;
            return;
        }

        const node: Node = getter();

        if (node) {
            // Child node already exists, nothing to do
            this._childExisted = true;
            return;
        }

        // Child node doesn't exist, create it
        this._childExisted = false;
        const newChildNode = creator();
        setter(newChildNode);
    }

    /**
     * Undo the command - remove child node if we created it
     */
    undo(document: Document): void {
        if (!this._parentExisted || this._childExisted) {
            return;
        }

        // We created the child node, so remove it
        const oaiDoc = document as OpenApiDocument;
        const parent: Node = NodePathUtil.resolveNodePath(this._parentPath, oaiDoc);

        const setter = getSetter(parent, this._childPropertyName)
        if (setter) {
            setter(null as any);
        }
    }
}
