/**
 * Command to delete a schema from the document
 * - OpenAPI 2.0: deletes from definitions section
 * - OpenAPI 3.0/3.1: deletes from components.schemas section
 */

import {
    Document,
    ModelTypeUtil,
    OpenApi20Document,
    OpenApi20Schema,
    OpenApi30Document,
    OpenApi30Schema,
    OpenApi31Document,
    Library
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a schema definition (e.g., Pet, User)
 */
export class DeleteSchemaCommand extends BaseCommand {
    private _schemaName: string;
    private _oldSchema: any = null;
    private _schemaExisted: boolean = false;
    private _schemaIndex: number = -1;

    /**
     * Constructor
     * @param schemaName The schema name to delete (e.g., "Pet", "User")
     */
    constructor(schemaName: string) {
        super();
        this._schemaName = schemaName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteSchemaCommand';
    }

    /**
     * Execute the command - delete the schema
     */
    execute(document: Document): void {
        if (ModelTypeUtil.isOpenApi2Model(document)) {
            this.executeForOpenApi20(document as OpenApi20Document);
        } else {
            this.executeForOpenApi30(document as OpenApi30Document | OpenApi31Document);
        }
    }

    /**
     * Execute for OpenAPI 2.0
     */
    private executeForOpenApi20(oaiDoc: OpenApi20Document): void {
        const definitions = oaiDoc.getDefinitions();

        if (!definitions) {
            // No definitions section, nothing to delete
            this._schemaExisted = false;
            return;
        }

        // Get the schema to delete
        const schema = definitions.getItem(this._schemaName) as OpenApi20Schema;

        if (!schema) {
            // Schema doesn't exist, nothing to delete
            this._schemaExisted = false;
            return;
        }

        // Find and save the index of the schema for undo
        const schemaNames = definitions.getItemNames();
        this._schemaIndex = schemaNames.indexOf(this._schemaName);

        // Save the schema for undo
        this._oldSchema = Library.writeNode(schema);
        this._schemaExisted = true;

        // Remove the schema
        definitions.removeItem(this._schemaName);
    }

    /**
     * Execute for OpenAPI 3.0/3.1
     */
    private executeForOpenApi30(oaiDoc: OpenApi30Document | OpenApi31Document): void {
        const components = oaiDoc.getComponents();

        if (!components) {
            // No components section, nothing to delete
            this._schemaExisted = false;
            return;
        }

        const schemas = components.getSchemas();

        if (!schemas) {
            // No schemas object, nothing to delete
            this._schemaExisted = false;
            return;
        }

        // Get the schema to delete
        const schema = schemas[this._schemaName] as OpenApi30Schema;

        if (!schema) {
            // Schema doesn't exist, nothing to delete
            this._schemaExisted = false;
            return;
        }

        // Find and save the index of the schema for undo
        const schemaKeys = Object.keys(schemas);
        this._schemaIndex = schemaKeys.indexOf(this._schemaName);

        // Save the schema for undo
        this._oldSchema = Library.writeNode(schema);
        this._schemaExisted = true;

        // Remove the schema
        components.removeSchema(this._schemaName);
    }

    /**
     * Undo the command - restore the schema
     */
    undo(document: Document): void {
        if (!this._schemaExisted || !this._oldSchema) {
            return;
        }

        if (ModelTypeUtil.isOpenApi2Model(document)) {
            this.undoForOpenApi20(document as OpenApi20Document);
        } else {
            this.undoForOpenApi30(document as OpenApi30Document | OpenApi31Document);
        }
    }

    /**
     * Undo for OpenAPI 2.0
     */
    private undoForOpenApi20(oaiDoc: OpenApi20Document): void {
        let definitions = oaiDoc.getDefinitions();

        // Create definitions object if it doesn't exist
        if (!definitions) {
            definitions = oaiDoc.createDefinitions();
            oaiDoc.setDefinitions(definitions);
        }

        // Recreate the schema using document method
        const newSchema = definitions.createSchema() as OpenApi20Schema;
        Library.readNode(this._oldSchema, newSchema);

        definitions.insertItem(this._schemaName, newSchema, this._schemaIndex);
    }

    /**
     * Undo for OpenAPI 3.0/3.1
     */
    private undoForOpenApi30(oaiDoc: OpenApi30Document | OpenApi31Document): void {
        let components = oaiDoc.getComponents();

        // Create components object if it doesn't exist
        if (!components) {
            components = oaiDoc.createComponents();
            oaiDoc.setComponents(components as any);
        }

        // Recreate the schema
        const newSchema = (components as any).createSchema() as OpenApi30Schema;
        Library.readNode(this._oldSchema, newSchema);

        // Add it back
        components.insertSchema(this._schemaName, newSchema, this._schemaIndex);
    }
}
