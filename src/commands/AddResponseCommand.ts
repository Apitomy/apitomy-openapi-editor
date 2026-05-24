/**
 * Command to add a response entry to an operation's responses container
 */

import { Document, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for operations that support responses
 */
interface ResponsesParent {
    getResponses(): any;
    createResponses(): any;
    setResponses(value: any): void;
}

/**
 * Interface for a responses container
 */
interface ResponsesContainer {
    getItem(name: string): any;
    getItemNames(): string[];
    createResponse(): any;
    addItem(name: string, value: any): void;
    removeItem(name: string): void;
}

/**
 * Command to add a response to an operation
 */
export class AddResponseCommand extends BaseCommand {
    private _operationPath: NodePath;
    private _statusCode: string;
    private _description: string;
    private _created: boolean = false;
    private _createdResponses: boolean = false;

    /**
     * Constructor
     * @param operation The operation node to add a response to
     * @param statusCode The HTTP status code (e.g., "200", "404", "default")
     * @param description The response description
     */
    constructor(operation: Node, statusCode: string, description: string) {
        super();
        this._operationPath = NodePathUtil.createNodePath(operation);
        this._statusCode = statusCode;
        this._description = description;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddResponseCommand';
    }

    /**
     * Execute the command - add the response
     */
    execute(document: Document): void {
        const operation = this.getOperation(document);
        if (!operation) {
            throw new Error(`Operation not found: ${this._operationPath.toString()}`);
        }

        // Get or create the responses container
        let responses = operation.getResponses() as ResponsesContainer;
        if (!responses) {
            const newResponses = operation.createResponses();
            operation.setResponses(newResponses);
            responses = newResponses as ResponsesContainer;
            this._createdResponses = true;
        }

        // Check if response already exists
        if (responses.getItem(this._statusCode)) {
            this._created = false;
            return;
        }

        // Create and add the response
        const response = responses.createResponse();
        if (response.setDescription) {
            response.setDescription(this._description);
        } else {
            response.description = this._description;
        }
        responses.addItem(this._statusCode, response);
        this._created = true;
    }

    /**
     * Undo the command - remove the response
     */
    undo(document: Document): void {
        if (!this._created) {
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

        responses.removeItem(this._statusCode);

        // If we created the responses container and it's now empty, remove it
        if (this._createdResponses) {
            const remaining = responses.getItemNames();
            if (!remaining || remaining.length === 0) {
                operation.setResponses(null);
            }
        }
    }

    /**
     * Get the operation node from the document
     */
    private getOperation(document: Document): ResponsesParent | null {
        return NodePathUtil.resolveNodePath(this._operationPath, document) as unknown as ResponsesParent;
    }
}
