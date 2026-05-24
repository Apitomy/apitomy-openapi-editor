/**
 * Command to add a media type entry to a request body's content map
 */

import { Document, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for nodes that support content (media types)
 */
interface ContentParent {
    getContent(): any;
    createMediaType(): any;
    addContent(name: string, value: any): void;
    removeContent(name: string): void;
}

/**
 * Command to add a media type to a request body
 */
export class AddMediaTypeCommand extends BaseCommand {
    private _parentPath: NodePath;
    private _mediaTypeName: string;
    private _created: boolean = false;

    /**
     * Constructor
     * @param requestBody The request body node to add a media type to
     * @param mediaTypeName The MIME type name (e.g., "application/json")
     */
    constructor(requestBody: Node, mediaTypeName: string) {
        super();
        this._parentPath = NodePathUtil.createNodePath(requestBody);
        this._mediaTypeName = mediaTypeName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddMediaTypeCommand';
    }

    /**
     * Execute the command - add the media type
     */
    execute(document: Document): void {
        const parent = this.getParent(document);
        if (!parent) {
            throw new Error(`Request body not found: ${this._parentPath.toString()}`);
        }

        // Check if media type already exists
        const content = parent.getContent();
        if (content && content[this._mediaTypeName]) {
            this._created = false;
            return;
        }

        const mediaType = parent.createMediaType();
        parent.addContent(this._mediaTypeName, mediaType);
        this._created = true;
    }

    /**
     * Undo the command - remove the media type
     */
    undo(document: Document): void {
        if (!this._created) {
            return;
        }

        const parent = this.getParent(document);
        if (!parent) {
            return;
        }

        parent.removeContent(this._mediaTypeName);
    }

    /**
     * Get the parent node from the document
     */
    private getParent(document: Document): ContentParent | null {
        return NodePathUtil.resolveNodePath(this._parentPath, document) as unknown as ContentParent;
    }
}
