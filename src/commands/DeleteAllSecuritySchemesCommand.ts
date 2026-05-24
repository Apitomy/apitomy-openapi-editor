/**
 * Command to delete all security schemes from the document
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
 * Command to delete all security schemes
 */
export class DeleteAllSecuritySchemesCommand extends BaseCommand {
    private _oldSchemes: Map<string, any> = new Map();

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
        return 'DeleteAllSecuritySchemesCommand';
    }

    /**
     * Execute the command - delete all security schemes
     */
    execute(document: Document): void {
        this._oldSchemes.clear();

        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const oaiDoc = document as OpenApi20Document;
            const definitions = oaiDoc.getSecurityDefinitions();
            if (definitions) {
                const names = definitions.getItemNames();
                names.forEach(name => {
                    const scheme = definitions.getItem(name);
                    if (scheme) {
                        this._oldSchemes.set(name, scheme);
                        definitions.removeItem(name);
                    }
                });
            }
        } else {
            const oaiDoc = document as OpenApi30Document | OpenApi31Document;
            const components = oaiDoc.getComponents();
            if (components) {
                const schemes = components.getSecuritySchemes();
                if (schemes) {
                    Object.keys(schemes).forEach(name => {
                        this._oldSchemes.set(name, schemes[name]);
                        components.removeSecurityScheme(name);
                    });
                }
            }
        }
    }

    /**
     * Undo the command - restore all security schemes
     */
    undo(document: Document): void {
        if (this._oldSchemes.size === 0) {
            return;
        }

        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const oaiDoc = document as OpenApi20Document;
            let definitions = oaiDoc.getSecurityDefinitions();
            if (!definitions) {
                definitions = oaiDoc.createSecurityDefinitions();
                oaiDoc.setSecurityDefinitions(definitions);
            }
            this._oldSchemes.forEach((scheme, name) => {
                definitions.addItem(name, scheme);
            });
        } else {
            const oaiDoc = document as OpenApi30Document | OpenApi31Document;
            let components = oaiDoc.getComponents();
            if (!components) {
                components = oaiDoc.createComponents();
                oaiDoc.setComponents(components as any);
            }
            this._oldSchemes.forEach((scheme, name) => {
                components.addSecurityScheme(name, scheme);
            });
        }
    }
}
