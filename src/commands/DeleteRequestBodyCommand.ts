/**
 * Command to delete a request body from an operation
 */

import { Document, Library, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for operations that support request body
 */
interface RequestBodyParent {
    getRequestBody(): any;
    createRequestBody(): any;
    setRequestBody(value: any): void;
}

/**
 * Command to delete a request body from an operation, preserving state for undo
 */
export class DeleteRequestBodyCommand extends BaseCommand {
    private _operationPath: NodePath;
    private _oldRequestBody: any = null;
    private _existed: boolean = false;

    /**
     * Constructor
     * @param operation The operation node to remove the request body from
     */
    constructor(operation: Node) {
        super();
        this._operationPath = NodePathUtil.createNodePath(operation);
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteRequestBodyCommand';
    }

    /**
     * Execute the command - delete the request body
     */
    execute(document: Document): void {
        const operation = this.getOperation(document);
        if (!operation) {
            throw new Error(`Operation not found: ${this._operationPath.toString()}`);
        }

        const requestBody = operation.getRequestBody();
        if (!requestBody) {
            this._existed = false;
            return;
        }

        // Serialize the request body for undo
        this._oldRequestBody = Library.writeNode(requestBody);
        this._existed = true;

        // Remove the request body
        operation.setRequestBody(null);
    }

    /**
     * Undo the command - restore the request body
     */
    undo(document: Document): void {
        if (!this._existed || !this._oldRequestBody) {
            return;
        }

        const operation = this.getOperation(document);
        if (!operation) {
            return;
        }

        // Recreate the request body
        const newRequestBody = operation.createRequestBody();
        Library.readNode(this._oldRequestBody, newRequestBody);
        operation.setRequestBody(newRequestBody);
    }

    /**
     * Get the operation node from the document
     */
    private getOperation(document: Document): RequestBodyParent | null {
        return NodePathUtil.resolveNodePath(this._operationPath, document) as unknown as RequestBodyParent;
    }
}
