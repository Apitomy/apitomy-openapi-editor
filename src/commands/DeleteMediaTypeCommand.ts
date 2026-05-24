/**
 * Command to delete a media type entry from a request body's content map
 */

import { Document, Library, Node, NodePath, NodePathUtil } from '@apitomy/data-models';
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
 * Command to delete a media type from a request body
 */
export class DeleteMediaTypeCommand extends BaseCommand {
    private _parentPath: NodePath;
    private _mediaTypeName: string;
    private _oldMediaType: any = null;
    private _existed: boolean = false;

    /**
     * Constructor
     * @param requestBody The request body node to remove a media type from
     * @param mediaTypeName The MIME type name to remove (e.g., "application/json")
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
        return 'DeleteMediaTypeCommand';
    }

    /**
     * Execute the command - delete the media type
     */
    execute(document: Document): void {
        const parent = this.getParent(document);
        if (!parent) {
            throw new Error(`Request body not found: ${this._parentPath.toString()}`);
        }

        const content = parent.getContent();
        if (!content || !content[this._mediaTypeName]) {
            this._existed = false;
            return;
        }

        // Serialize for undo
        this._oldMediaType = Library.writeNode(content[this._mediaTypeName]);
        this._existed = true;

        // Remove the media type
        parent.removeContent(this._mediaTypeName);
    }

    /**
     * Undo the command - restore the media type
     */
    undo(document: Document): void {
        if (!this._existed || !this._oldMediaType) {
            return;
        }

        const parent = this.getParent(document);
        if (!parent) {
            return;
        }

        // Recreate the media type
        const newMediaType = parent.createMediaType();
        Library.readNode(this._oldMediaType, newMediaType);
        parent.addContent(this._mediaTypeName, newMediaType);
    }

    /**
     * Get the parent node from the document
     */
    private getParent(document: Document): ContentParent | null {
        return NodePathUtil.resolveNodePath(this._parentPath, document) as unknown as ContentParent;
    }
}
