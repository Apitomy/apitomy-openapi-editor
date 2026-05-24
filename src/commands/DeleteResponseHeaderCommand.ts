/**
 * Command to delete a header from a response
 */

import { Document, Library, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for response nodes that support headers
 */
interface HeaderParent {
    getHeaders(): any;
    createHeader(): any;
    addHeader(name: string, value: any): void;
    removeHeader(name: string): void;
}

/**
 * Command to delete a header from a response
 */
export class DeleteResponseHeaderCommand extends BaseCommand {
    private _responsePath: NodePath;
    private _headerName: string;
    private _oldHeader: any = null;
    private _existed: boolean = false;

    /**
     * Constructor
     * @param response The response node to remove a header from
     * @param headerName The header name to remove
     */
    constructor(response: Node, headerName: string) {
        super();
        this._responsePath = NodePathUtil.createNodePath(response);
        this._headerName = headerName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteResponseHeaderCommand';
    }

    /**
     * Execute the command - delete the header
     */
    execute(document: Document): void {
        const response = this.getResponse(document);
        if (!response) {
            throw new Error(`Response not found: ${this._responsePath.toString()}`);
        }

        const headers = response.getHeaders();
        if (!headers || !headers[this._headerName]) {
            this._existed = false;
            return;
        }

        // Serialize for undo
        this._oldHeader = Library.writeNode(headers[this._headerName]);
        this._existed = true;

        // Remove the header
        response.removeHeader(this._headerName);
    }

    /**
     * Undo the command - restore the header
     */
    undo(document: Document): void {
        if (!this._existed || !this._oldHeader) {
            return;
        }

        const response = this.getResponse(document);
        if (!response) {
            return;
        }

        // Recreate the header
        const newHeader = response.createHeader();
        Library.readNode(this._oldHeader, newHeader);
        response.addHeader(this._headerName, newHeader);
    }

    /**
     * Get the response node from the document
     */
    private getResponse(document: Document): HeaderParent | null {
        return NodePathUtil.resolveNodePath(this._responsePath, document) as unknown as HeaderParent;
    }
}
