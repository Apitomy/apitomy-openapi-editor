/**
 * Command to delete a security requirement from the document
 */

import {
    Document,
    OpenApi20Document,
    OpenApi30Document,
    OpenApi31Document,
    SecurityRequirement
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a security requirement by index
 */
export class DeleteSecurityRequirementCommand extends BaseCommand {
    private _index: number;
    private _oldRequirement: SecurityRequirement | null = null;

    /**
     * Constructor
     * @param index Index of the security requirement to delete
     */
    constructor(index: number) {
        super();
        this._index = index;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteSecurityRequirementCommand';
    }

    /**
     * Execute the command - delete the security requirement
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApi20Document | OpenApi30Document | OpenApi31Document;
        const security = oaiDoc.getSecurity();

        if (!security || this._index < 0 || this._index >= security.length) {
            return;
        }

        // Save the requirement for undo
        this._oldRequirement = security[this._index];

        // Remove the requirement
        oaiDoc.removeSecurity(this._oldRequirement);
    }

    /**
     * Undo the command - restore the security requirement
     */
    undo(document: Document): void {
        if (!this._oldRequirement) {
            return;
        }

        const oaiDoc = document as OpenApi20Document | OpenApi30Document | OpenApi31Document;

        // Re-insert at the original index
        oaiDoc.insertSecurity(this._oldRequirement, this._index);
    }
}
