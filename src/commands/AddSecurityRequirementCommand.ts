/**
 * Command to add a new security requirement to the document
 */

import {
    Document,
    OpenApi20Document,
    OpenApi30Document,
    OpenApi31Document
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';
import { SecurityRequirementData } from '@components/modals/SecurityRequirementModal';

/**
 * Command to add a new security requirement to the document
 */
export class AddSecurityRequirementCommand extends BaseCommand {
    private _data: SecurityRequirementData;
    private _index?: number;
    private _requirementAdded: boolean = false;

    /**
     * Constructor
     * @param data Security requirement data
     * @param index Optional index to insert the requirement at (for maintaining order during edits)
     */
    constructor(data: SecurityRequirementData, index?: number) {
        super();
        this._data = data;
        this._index = index;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddSecurityRequirementCommand';
    }

    /**
     * Execute the command - add a new security requirement
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApi20Document | OpenApi30Document | OpenApi31Document;

        // Create new security requirement
        const newRequirement = oaiDoc.createSecurityRequirement();

        // Add scheme references and scopes
        Object.keys(this._data.schemes).forEach(schemeName => {
            const scopes = this._data.schemes[schemeName];
            // Clone the scopes array to avoid mutations to the original data
            newRequirement.addItem(schemeName, [...scopes]);
        });

        // Handle index-based insertion for maintaining order
        if (this._index !== undefined) {
            oaiDoc.insertSecurity(newRequirement, this._index);
        } else {
            oaiDoc.addSecurity(newRequirement);
        }

        this._requirementAdded = true;
    }

    /**
     * Undo the command - remove the security requirement
     */
    undo(document: Document): void {
        if (!this._requirementAdded) {
            return;
        }

        const oaiDoc = document as OpenApi20Document | OpenApi30Document | OpenApi31Document;
        const security = oaiDoc.getSecurity();

        if (security) {
            const index = this._index !== undefined && this._index < security.length
                ? this._index
                : security.length - 1;

            if (index >= 0 && index < security.length) {
                const requirement = security[index];
                oaiDoc.removeSecurity(requirement);
            }
        }
    }
}
