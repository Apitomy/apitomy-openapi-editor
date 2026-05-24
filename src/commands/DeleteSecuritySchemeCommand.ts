/**
 * Command to delete a security scheme from the document
 */

import {
    Document,
    ModelTypeUtil,
    OpenApi20Document,
    OpenApi30Document,
    OpenApi31Document
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a security scheme
 */
export class DeleteSecuritySchemeCommand extends BaseCommand {
    private _schemeName: string;
    private _oldScheme: any = null;

    /**
     * Constructor
     * @param schemeName The name of the security scheme to delete
     */
    constructor(schemeName: string) {
        super();
        this._schemeName = schemeName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteSecuritySchemeCommand';
    }

    /**
     * Execute the command - delete the security scheme
     */
    execute(document: Document): void {
        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const oaiDoc = document as OpenApi20Document;
            const definitions = oaiDoc.getSecurityDefinitions();
            if (definitions) {
                this._oldScheme = definitions.getItem(this._schemeName);
                if (this._oldScheme) {
                    definitions.removeItem(this._schemeName);
                }
            }
        } else {
            const oaiDoc = document as OpenApi30Document | OpenApi31Document;
            const components = oaiDoc.getComponents();
            if (components) {
                const schemes = components.getSecuritySchemes();
                if (schemes) {
                    this._oldScheme = schemes[this._schemeName];
                    if (this._oldScheme) {
                        components.removeSecurityScheme(this._schemeName);
                    }
                }
            }
        }
    }

    /**
     * Undo the command - restore the security scheme
     */
    undo(document: Document): void {
        if (!this._oldScheme) {
            return;
        }

        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const oaiDoc = document as OpenApi20Document;
            const definitions = oaiDoc.getSecurityDefinitions();
            if (definitions) {
                definitions.addItem(this._schemeName, this._oldScheme);
            }
        } else {
            const oaiDoc = document as OpenApi30Document | OpenApi31Document;
            const components = oaiDoc.getComponents();
            if (components) {
                components.addSecurityScheme(this._schemeName, this._oldScheme);
            }
        }
    }
}
