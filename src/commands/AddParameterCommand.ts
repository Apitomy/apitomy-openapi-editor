/**
 * Command to add a new parameter to a path item or operation
 */

import {
    Document,
    Node,
    NodePath,
    NodePathUtil,
    OpenApi30Schema,
    OpenApiParameter,
    OpenApiParametersParent
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to add a new parameter to a path item or operation
 */
export class AddParameterCommand extends BaseCommand {
    private _parentPath: NodePath;
    private _parameterName: string;
    private _parameterLocation: string;
    private _parameterDescription: string | null;
    private _parameterRequired: boolean;
    private _parameterType: string;
    private _parameterCreated: boolean = false;

    /**
     * Constructor
     * @param parameterParent The path item or operation to add the parameter to
     * @param parameterName The name of the parameter
     * @param parameterLocation The location of the parameter (query, path, header, cookie)
     * @param parameterDescription Optional description for the parameter
     * @param parameterRequired Whether the parameter is required
     * @param parameterType The type of the parameter (string, integer, number, boolean)
     */
    constructor(
        parameterParent: OpenApiParametersParent,
        parameterName: string,
        parameterLocation: string,
        parameterDescription: string | null,
        parameterRequired: boolean,
        parameterType: string
    ) {
        super();
        this._parentPath = NodePathUtil.createNodePath(parameterParent as unknown as Node);
        this._parameterName = parameterName;
        this._parameterLocation = parameterLocation;
        this._parameterDescription = parameterDescription;
        this._parameterRequired = parameterRequired;
        this._parameterType = parameterType;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddParameterCommand';
    }

    /**
     * Execute the command - add a new parameter
     */
    execute(document: Document): void {
        // Resolve the parent node from the path
        const parent = NodePathUtil.resolveNodePath(this._parentPath, document) as any as OpenApiParametersParent;

        if (!parent) {
            console.error('Cannot add parameter: parent not found');
            this._parameterCreated = false;
            return;
        }

        // Check if parameter already exists
        const existingParameters = parent.getParameters();
        if (existingParameters) {
            const existingParam = existingParameters.find((param: any) => {
                const paramName = param.getName?.() || param.name;
                const paramIn = param.getIn?.() || param.in;
                return paramName === this._parameterName && paramIn === this._parameterLocation;
            });

            if (existingParam) {
                this._parameterCreated = false;
                return;
            }
        }

        // Create new parameter
        const newParameter = parent.createParameter() as OpenApiParameter;
        newParameter.setName(this._parameterName);
        newParameter.setIn(this._parameterLocation);

        if (this._parameterDescription) {
            newParameter.setDescription(this._parameterDescription);
        }

        newParameter.setRequired(this._parameterRequired);

        // Create and set schema with type
        const schema = newParameter.createSchema() as OpenApi30Schema;
        schema.setType(this._parameterType);
        newParameter.setSchema(schema);

        // Add the parameter to the parent
        parent.addParameter(newParameter);
        this._parameterCreated = true;
    }

    /**
     * Undo the command - remove the parameter
     */
    undo(document: Document): void {
        if (!this._parameterCreated) {
            // Parameter wasn't created, nothing to undo
            return;
        }

        // Resolve the parent node from the path
        const parent = NodePathUtil.resolveNodePath(this._parentPath, document) as any as OpenApiParametersParent;

        if (!parent) {
            return;
        }

        const parameters = parent.getParameters();

        if (!parameters) {
            return;
        }

        // Find and remove the parameter
        const parameter = parameters.find((param: any) => {
            const paramName = param.getName?.() || param.name;
            const paramIn = param.getIn?.() || param.in;
            return paramName === this._parameterName && paramIn === this._parameterLocation;
        });

        if (parameter) {
            parent.removeParameter(parameter);
        }
    }
}
