/**
 * Command to add a header to a response
 */

import { Document, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
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
 * Command to add a header to a response
 */
export class AddResponseHeaderCommand extends BaseCommand {
    private _responsePath: NodePath;
    private _headerName: string;
    private _description: string;
    private _schemaType: string | null;
    private _schemaRef: string | null;
    private _created: boolean = false;

    /**
     * Constructor
     * @param response The response node to add a header to
     * @param headerName The header name
     * @param description The header description
     * @param schemaType The schema type (e.g., "string", "integer") or null
     * @param schemaRef The schema $ref or null
     */
    constructor(
        response: Node,
        headerName: string,
        description: string,
        schemaType: string | null,
        schemaRef: string | null
    ) {
        super();
        this._responsePath = NodePathUtil.createNodePath(response);
        this._headerName = headerName;
        this._description = description;
        this._schemaType = schemaType;
        this._schemaRef = schemaRef;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddResponseHeaderCommand';
    }

    /**
     * Execute the command - add the header
     */
    execute(document: Document): void {
        const response = this.getResponse(document);
        if (!response) {
            throw new Error(`Response not found: ${this._responsePath.toString()}`);
        }

        // Check if header already exists
        const headers = response.getHeaders();
        if (headers && headers[this._headerName]) {
            this._created = false;
            return;
        }

        // Create the header
        const header = response.createHeader();

        // Set description
        if (header.setDescription) {
            header.setDescription(this._description);
        } else {
            header.description = this._description;
        }

        // Set schema if provided
        if (this._schemaType || this._schemaRef) {
            const schema = header.createSchema ? header.createSchema() : null;
            if (schema) {
                if (this._schemaRef) {
                    if (schema.set$ref) {
                        schema.set$ref(this._schemaRef);
                    } else {
                        schema.$ref = this._schemaRef;
                    }
                } else if (this._schemaType) {
                    if (schema.setType) {
                        schema.setType(this._schemaType);
                    } else {
                        schema.type = this._schemaType;
                    }
                }
                if (header.setSchema) {
                    header.setSchema(schema);
                } else {
                    header.schema = schema;
                }
            }
        }

        // Add the header to the response
        response.addHeader(this._headerName, header);
        this._created = true;
    }

    /**
     * Undo the command - remove the header
     */
    undo(document: Document): void {
        if (!this._created) {
            return;
        }

        const response = this.getResponse(document);
        if (!response) {
            return;
        }

        response.removeHeader(this._headerName);
    }

    /**
     * Get the response node from the document
     */
    private getResponse(document: Document): HeaderParent | null {
        return NodePathUtil.resolveNodePath(this._responsePath, document) as unknown as HeaderParent;
    }
}
