/**
 * Command to delete all security requirements from the document
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
 * Command to delete all security requirements
 */
export class DeleteAllSecurityRequirementsCommand extends BaseCommand {
    private _oldRequirements: SecurityRequirement[] = [];

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteAllSecurityRequirementsCommand';
    }

    /**
     * Execute the command - delete all security requirements
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApi20Document | OpenApi30Document | OpenApi31Document;
        const security = oaiDoc.getSecurity();

        if (!security || security.length === 0) {
            return;
        }

        // Save all requirements for undo
        this._oldRequirements = [...security];

        // Clear all requirements
        oaiDoc.clearSecurity();
    }

    /**
     * Undo the command - restore all security requirements
     */
    undo(document: Document): void {
        if (this._oldRequirements.length === 0) {
            return;
        }

        const oaiDoc = document as OpenApi20Document | OpenApi30Document | OpenApi31Document;
        this._oldRequirements.forEach(requirement => {
            oaiDoc.addSecurity(requirement);
        });
    }
}
