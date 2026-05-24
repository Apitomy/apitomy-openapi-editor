/**
 * Command to set or change the schema on a media type
 */

import { Document, Library, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for media type nodes that support schema
 */
interface MediaTypeNode {
    getSchema(): any;
    setSchema(value: any): void;
    createSchema(): any;
}

/**
 * Command to change the schema on a media type entry.
 * Supports setting a $ref to a schema definition or an inline type.
 */
export class ChangeMediaTypeSchemaCommand extends BaseCommand {
    private _mediaTypePath: NodePath;
    private _schemaRef: string | null;
    private _schemaType: string | null;
    private _oldSchema: any = null;
    private _hadSchema: boolean = false;

    /**
     * Constructor
     * @param mediaType The media type node to change the schema on
     * @param schemaRef The $ref value (e.g., "#/components/schemas/Pet"), or null
     * @param schemaType The inline type (e.g., "object", "string"), or null
     */
    constructor(mediaType: Node, schemaRef: string | null, schemaType: string | null) {
        super();
        this._mediaTypePath = NodePathUtil.createNodePath(mediaType);
        this._schemaRef = schemaRef;
        this._schemaType = schemaType;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'ChangeMediaTypeSchemaCommand';
    }

    /**
     * Execute the command - set or change the schema
     */
    execute(document: Document): void {
        const mediaType = this.getMediaType(document);
        if (!mediaType) {
            throw new Error(`Media type not found: ${this._mediaTypePath.toString()}`);
        }

        // Save old schema for undo
        const oldSchema = mediaType.getSchema();
        if (oldSchema) {
            this._oldSchema = Library.writeNode(oldSchema);
            this._hadSchema = true;
        } else {
            this._oldSchema = null;
            this._hadSchema = false;
        }

        // Create new schema and set properties
        if (this._schemaRef || this._schemaType) {
            const newSchema = mediaType.createSchema();
            if (this._schemaRef) {
                (newSchema as any).set$ref(this._schemaRef);
            } else if (this._schemaType) {
                (newSchema as any).setType(this._schemaType);
            }
            mediaType.setSchema(newSchema);
        } else {
            // Clear schema
            mediaType.setSchema(null);
        }
    }

    /**
     * Undo the command - restore the old schema
     */
    undo(document: Document): void {
        const mediaType = this.getMediaType(document);
        if (!mediaType) {
            return;
        }

        if (this._hadSchema && this._oldSchema) {
            // Restore the old schema
            const restoredSchema = mediaType.createSchema();
            Library.readNode(this._oldSchema, restoredSchema);
            mediaType.setSchema(restoredSchema);
        } else {
            // There was no schema before, remove it
            mediaType.setSchema(null);
        }
    }

    /**
     * Get the media type node from the document
     */
    private getMediaType(document: Document): MediaTypeNode | null {
        return NodePathUtil.resolveNodePath(this._mediaTypePath, document) as unknown as MediaTypeNode;
    }
}
