/**
 * Command to delete all tags from the document
 */

import { Document, Library, OpenApiDocument, Tag } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete all tag definitions from the document
 */
export class DeleteAllTagsCommand extends BaseCommand {
    private _oldTags: any[] = [];
    private _tagsExisted: boolean = false;

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteAllTagsCommand';
    }

    /**
     * Execute the command - delete all tags
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;
        const tags = oaiDoc.getTags();

        if (!tags || tags.length === 0) {
            this._tagsExisted = false;
            return;
        }

        // Save all tags for undo
        this._oldTags = tags.map((tag: Tag) => Library.writeNode(tag));
        this._tagsExisted = true;

        // Clear all tags
        oaiDoc.clearTags();
    }

    /**
     * Undo the command - restore all tags
     */
    undo(document: Document): void {
        if (!this._tagsExisted || this._oldTags.length === 0) {
            return;
        }

        const oaiDoc = document as OpenApiDocument;

        // Recreate all tags
        this._oldTags.forEach((tagData: any) => {
            const newTag = oaiDoc.createTag();
            Library.readNode(tagData, newTag);
            oaiDoc.addTag(newTag);
        });
    }
}
