/**
 * Command to delete a specific tag from the document
 */

import { Document, Library, OpenApiDocument, Tag } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a specific tag definition from the document
 */
export class DeleteTagCommand extends BaseCommand {
    private _tagName: string;
    private _oldTag: any = null;
    private _tagIndex: number = -1;

    /**
     * Constructor
     * @param tagName The name of the tag to delete
     */
    constructor(tagName: string) {
        super();
        this._tagName = tagName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteTagCommand';
    }

    /**
     * Execute the command - delete the tag
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;
        const tags = oaiDoc.getTags();

        if (!tags) {
            return;
        }

        // Find the tag to delete
        this._tagIndex = tags.findIndex((tag: Tag) => tag.getName() === this._tagName);

        if (this._tagIndex < 0) {
            return;
        }

        // Save the tag for undo
        this._oldTag = Library.writeNode(tags[this._tagIndex]);

        // Remove the tag
        oaiDoc.removeTag(tags[this._tagIndex]);
    }

    /**
     * Undo the command - restore the tag
     */
    undo(document: Document): void {
        if (this._tagIndex < 0 || !this._oldTag) {
            return;
        }

        const oaiDoc = document as OpenApiDocument;

        // Recreate the tag
        const newTag = oaiDoc.createTag();
        Library.readNode(this._oldTag, newTag);

        // Insert at the original position
        oaiDoc.insertTag(newTag, this._tagIndex);
    }
}
