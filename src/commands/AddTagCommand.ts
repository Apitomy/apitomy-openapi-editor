/**
 * Command to add a new tag to the document
 */

import { Document, OpenApiDocument, Tag } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to add a new tag definition to the document
 */
export class AddTagCommand extends BaseCommand {
    private _tagName: string;
    private _tagDescription: string;
    private _tagCreated: boolean = false;

    /**
     * Constructor
     * @param tagName The name of the tag to create
     * @param tagDescription Optional description for the tag
     */
    constructor(tagName: string, tagDescription?: string) {
        super();
        this._tagName = tagName;
        this._tagDescription = tagDescription || '';
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddTagCommand';
    }

    /**
     * Execute the command - add a new tag
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;

        // Check if tag already exists
        const existingTags = oaiDoc.getTags();
        if (existingTags) {
            const existingTag = existingTags.find((tag: Tag) => tag.getName() === this._tagName);
            if (existingTag) {
                this._tagCreated = false;
                return;
            }
        }

        // Create new tag
        const newTag = oaiDoc.createTag();
        newTag.setName(this._tagName);
        if (this._tagDescription) {
            newTag.setDescription(this._tagDescription);
        }

        // Add the tag to the document
        oaiDoc.addTag(newTag);
        this._tagCreated = true;
    }

    /**
     * Undo the command - remove the tag
     */
    undo(document: Document): void {
        if (!this._tagCreated) {
            // Tag wasn't created, nothing to undo
            return;
        }

        const oaiDoc = document as OpenApiDocument;
        const tags = oaiDoc.getTags();

        if (!tags) {
            return;
        }

        // Find and remove the tag
        const tagIndex = tags.findIndex((tag: Tag) => tag.getName() === this._tagName);
        if (tagIndex >= 0) {
            oaiDoc.removeTag(tags[tagIndex]);
        }
    }

}
