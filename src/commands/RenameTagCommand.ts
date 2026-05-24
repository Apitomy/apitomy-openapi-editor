/**
 * Command to rename a tag
 */

import { Document, OpenApiDocument, Tag } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to rename a tag definition
 */
export class RenameTagCommand extends BaseCommand {
    private _oldName: string;
    private _newName: string;
    private _tagRenamed: boolean = false;

    /**
     * Constructor
     * @param oldName The current name of the tag
     * @param newName The new name for the tag
     */
    constructor(oldName: string, newName: string) {
        super();
        this._oldName = oldName;
        this._newName = newName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'RenameTagCommand';
    }

    /**
     * Execute the command - rename the tag
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;
        const tags = oaiDoc.getTags();

        if (!tags) {
            this._tagRenamed = false;
            return;
        }

        // Find the tag to rename
        const tag = tags.find((t: Tag) => t.getName() === this._oldName);

        if (!tag) {
            this._tagRenamed = false;
            return;
        }

        // Check if new name already exists
        const existingTag = tags.find((t: Tag) => t.getName() === this._newName);
        if (existingTag && existingTag !== tag) {
            this._tagRenamed = false;
            return;
        }

        // Rename the tag
        tag.setName(this._newName);
        this._tagRenamed = true;
    }

    /**
     * Undo the command - restore the original name
     */
    undo(document: Document): void {
        if (!this._tagRenamed) {
            return;
        }

        const oaiDoc = document as OpenApiDocument;
        const tags = oaiDoc.getTags();

        if (!tags) {
            return;
        }

        // Find the tag with the new name
        const tag = tags.find((t: Tag) => t.getName() === this._newName);

        if (!tag) {
            return;
        }

        // Restore the old name
        tag.setName(this._oldName);
    }
}
