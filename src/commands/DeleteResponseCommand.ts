/**
 * Command to delete a response entry from an operation's responses container
 */

import { Document, Library, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for operations that support responses
 */
interface ResponsesParent {
    getResponses(): any;
}

/**
 * Interface for a responses container
 */
interface ResponsesContainer {
    getItem(name: string): any;
    createResponse(): any;
    addItem(name: string, value: any): void;
    removeItem(name: string): void;
}

/**
 * Command to delete a response from an operation
 */
export class DeleteResponseCommand extends BaseCommand {
    private _operationPath: NodePath;
    private _statusCode: string;
    private _oldResponse: any = null;
    private _existed: boolean = false;

    /**
     * Constructor
     * @param operation The operation node to remove a response from
     * @param statusCode The HTTP status code to remove (e.g., "200", "404", "default")
     */
    constructor(operation: Node, statusCode: string) {
        super();
        this._operationPath = NodePathUtil.createNodePath(operation);
        this._statusCode = statusCode;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteResponseCommand';
    }

    /**
     * Execute the command - delete the response
     */
    execute(document: Document): void {
        const operation = this.getOperation(document);
        if (!operation) {
            throw new Error(`Operation not found: ${this._operationPath.toString()}`);
        }

        const responses = operation.getResponses() as ResponsesContainer;
        if (!responses) {
            this._existed = false;
            return;
        }

        const response = responses.getItem(this._statusCode);
        if (!response) {
            this._existed = false;
            return;
        }

        // Serialize for undo
        this._oldResponse = Library.writeNode(response);
        this._existed = true;

        // Remove the response
        responses.removeItem(this._statusCode);
    }

    /**
     * Undo the command - restore the response
     */
    undo(document: Document): void {
        if (!this._existed || !this._oldResponse) {
            return;
        }

        const operation = this.getOperation(document);
        if (!operation) {
            return;
        }

        const responses = operation.getResponses() as ResponsesContainer;
        if (!responses) {
            return;
        }

        // Recreate the response
        const newResponse = responses.createResponse();
        Library.readNode(this._oldResponse, newResponse);
        responses.addItem(this._statusCode, newResponse);
    }

    /**
     * Get the operation node from the document
     */
    private getOperation(document: Document): ResponsesParent | null {
        return NodePathUtil.resolveNodePath(this._operationPath, document) as unknown as ResponsesParent;
    }
}
