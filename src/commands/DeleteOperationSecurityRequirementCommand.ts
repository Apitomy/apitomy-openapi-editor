/**
 * Command to delete a security requirement from an operation
 */

import {
    Document,
    Node,
    NodePath,
    NodePathUtil,
    OpenApi30Operation,
    SecurityRequirement
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a security requirement from an operation by index
 */
export class DeleteOperationSecurityRequirementCommand extends BaseCommand {
    private _operationPath: NodePath;
    private _index: number;
    private _oldRequirement: SecurityRequirement | null = null;

    /**
     * Constructor
     * @param operation The operation node to delete the security requirement from
     * @param index Index of the security requirement to delete
     */
    constructor(operation: Node, index: number) {
        super();
        this._operationPath = NodePathUtil.createNodePath(operation);
        this._index = index;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteOperationSecurityRequirementCommand';
    }

    /**
     * Execute the command - delete the security requirement from the operation
     */
    execute(document: Document): void {
        const operation = NodePathUtil.resolveNodePath(this._operationPath, document) as OpenApi30Operation;

        if (!operation) {
            console.error('Cannot delete security requirement: operation not found');
            return;
        }

        const security = operation.getSecurity();

        if (!security || this._index < 0 || this._index >= security.length) {
            return;
        }

        // Save the requirement for undo
        this._oldRequirement = security[this._index];

        // Remove the requirement
        operation.removeSecurity(this._oldRequirement);
    }

    /**
     * Undo the command - restore the security requirement to the operation
     */
    undo(document: Document): void {
        if (!this._oldRequirement) {
            return;
        }

        const operation = NodePathUtil.resolveNodePath(this._operationPath, document) as OpenApi30Operation;

        if (!operation) {
            return;
        }

        // Re-insert at the original index
        operation.insertSecurity(this._oldRequirement, this._index);
    }
}
