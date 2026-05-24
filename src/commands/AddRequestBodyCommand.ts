/**
 * Command to add a request body to an operation
 */

import { Document, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
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
 * Command to add a request body to an operation
 */
export class AddRequestBodyCommand extends BaseCommand {
    private _operationPath: NodePath;
    private _created: boolean = false;

    /**
     * Constructor
     * @param operation The operation node to add a request body to
     */
    constructor(operation: Node) {
        super();
        this._operationPath = NodePathUtil.createNodePath(operation);
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddRequestBodyCommand';
    }

    /**
     * Execute the command - add a request body
     */
    execute(document: Document): void {
        const operation = this.getOperation(document);
        if (!operation) {
            throw new Error(`Operation not found: ${this._operationPath.toString()}`);
        }

        // Don't create if one already exists
        if (operation.getRequestBody()) {
            this._created = false;
            return;
        }

        const requestBody = operation.createRequestBody();
        operation.setRequestBody(requestBody);
        this._created = true;
    }

    /**
     * Undo the command - remove the request body
     */
    undo(document: Document): void {
        if (!this._created) {
            return;
        }

        const operation = this.getOperation(document);
        if (!operation) {
            return;
        }

        operation.setRequestBody(null);
    }

    /**
     * Get the operation node from the document
     */
    private getOperation(document: Document): RequestBodyParent | null {
        return NodePathUtil.resolveNodePath(this._operationPath, document) as unknown as RequestBodyParent;
    }
}
