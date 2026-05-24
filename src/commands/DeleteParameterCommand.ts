/**
 * Command to delete a parameter from a path item or operation
 */

import {
    Document,
    Library,
    Node,
    NodePath,
    NodePathUtil,
    OpenApiParameter,
    OpenApiParametersParent
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a parameter from a path item or operation
 */
export class DeleteParameterCommand extends BaseCommand {
    private _parentPath: NodePath;
    private _parameterName: string;
    private _parameterLocation: string;
    private _oldParameter: any = null;
    private _parameterDeleted: boolean = false;

    /**
     * Constructor
     * @param parameterParent The path item or operation containing the parameter
     * @param parameterName The name of the parameter to delete
     * @param parameterLocation The location of the parameter (query, path, header, cookie)
     */
    constructor(
        parameterParent: OpenApiParametersParent,
        parameterName: string,
        parameterLocation: string
    ) {
        super();
        this._parentPath = NodePathUtil.createNodePath(parameterParent as unknown as Node);
        this._parameterName = parameterName;
        this._parameterLocation = parameterLocation;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteParameterCommand';
    }

    /**
     * Execute the command - delete the parameter
     */
    execute(document: Document): void {
        // Resolve the parent node from the path
        const parent = NodePathUtil.resolveNodePath(this._parentPath, document) as any as OpenApiParametersParent;

        if (!parent) {
            console.error('Cannot delete parameter: parent not found');
            this._parameterDeleted = false;
            return;
        }

        const parameters = parent.getParameters();

        if (!parameters) {
            console.error('Cannot delete parameter: no parameters found');
            this._parameterDeleted = false;
            return;
        }

        // Find the parameter to delete
        const parameter = parameters.find((param: any) => {
            const paramName = param.getName?.() || param.name;
            const paramIn = param.getIn?.() || param.in;
            return paramName === this._parameterName && paramIn === this._parameterLocation;
        });

        if (!parameter) {
            console.error('Cannot delete parameter: parameter not found');
            this._parameterDeleted = false;
            return;
        }

        // Save the parameter for undo
        this._oldParameter = Library.writeNode(parameter);
        this._parameterDeleted = true;

        // Delete the parameter
        parent.removeParameter(parameter);
    }

    /**
     * Undo the command - restore the deleted parameter
     */
    undo(document: Document): void {
        if (!this._parameterDeleted || !this._oldParameter) {
            return;
        }

        // Resolve the parent node from the path
        const parent = NodePathUtil.resolveNodePath(this._parentPath, document) as any as OpenApiParametersParent;

        if (!parent) {
            return;
        }

        // Recreate the parameter
        const newParameter = parent.createParameter() as OpenApiParameter;
        Library.readNode(this._oldParameter, newParameter);

        // Add the parameter back to the parent
        parent.addParameter(newParameter);
    }
}
