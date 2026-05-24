/**
 * Command to create a new schema in the components section (or definitions for OpenAPI 2.0)
 */

import {
    Document,
    OpenApi30Document,
    OpenApi30Schema,
    ModelTypeUtil,
    OpenApiDocument,
    OpenApi20Document, OpenApi31Document, OpenApiComponents
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to create a new schema definition
 */
export class CreateSchemaCommand extends BaseCommand {
    private _schemaName: string;
    private _schemaExisted: boolean = false;

    /**
     * Constructor
     * @param schemaName The name of the schema to create
     */
    constructor(schemaName: string) {
        super();
        this._schemaName = schemaName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'CreateSchemaCommand';
    }

    /**
     * Execute the command - create a new schema
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;

        // For OpenAPI 2.0, create schema in 'definitions'
        if (ModelTypeUtil.isOpenApi2Model(document)) {
            // Ensure definitions section exists
            let definitions = (oaiDoc as any).getDefinitions?.();
            if (!definitions) {
                definitions = (oaiDoc as any).createDefinitions();
                (oaiDoc as any).setDefinitions?.(definitions);
            }

            // Check if schema already exists
            if (definitions && definitions[this._schemaName]) {
                this._schemaExisted = true;
                return;
            }

            // Create new schema with default object type
            const newSchema = (oaiDoc as any).createDefinition?.() as OpenApi30Schema;
            (newSchema as any).type = 'object';

            // Add the schema to definitions
            (oaiDoc as any).addDefinition?.(this._schemaName, newSchema);
            this._schemaExisted = false;
            return;
        }

        // For OpenAPI 3.0 and 3.1, create schema in 'components.schemas'
        // Ensure components section exists
        let components = (oaiDoc as OpenApi30Document | OpenApi31Document).getComponents() as OpenApiComponents;
        if (!components) {
            components = (oaiDoc as OpenApi30Document | OpenApi31Document).createComponents() as OpenApiComponents;
            (oaiDoc as OpenApi30Document | OpenApi31Document).setComponents(components as any);
        }

        // Check if schema already exists
        const schemas = components.getSchemas();
        if (schemas && schemas[this._schemaName]) {
            this._schemaExisted = true;
            return;
        }

        // Create new schema with default object type
        const newSchema = components.createSchema() as OpenApi30Schema;
        (newSchema as any).type = 'object';

        // Add the schema to components
        components.addSchema(this._schemaName, newSchema);
        this._schemaExisted = false;
    }

    /**
     * Undo the command - remove the schema
     */
    undo(document: Document): void {
        if (this._schemaExisted) {
            // Schema already existed, don't remove it
            return;
        }

        const oaiDoc = document as OpenApiDocument;

        // For OpenAPI 2.0, remove schema from 'definitions'
        if (ModelTypeUtil.isOpenApi2Model(document)) {
            const definitions = (oaiDoc as OpenApi20Document).getDefinitions?.();
            if (!definitions) {
                return;
            }
            // Remove the schema
            (oaiDoc as any).removeDefinition?.(this._schemaName);
            return;
        }

        // For OpenAPI 3.0 and 3.1, remove schema from 'components.schemas'
        const components = (oaiDoc as OpenApi30Document | OpenApi31Document).getComponents();
        if (!components) {
            return;
        }

        // Remove the schema
        components.removeSchema(this._schemaName);
    }

    /**
     * Get the schema name that was created
     */
    getSchemaName(): string {
        return this._schemaName;
    }
}
