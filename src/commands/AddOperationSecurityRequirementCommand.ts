/**
 * Command to add a new security requirement to an operation
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
import { SecurityRequirementData } from '@components/modals/SecurityRequirementModal';

/**
 * Command to add a new security requirement to an operation
 */
export class AddOperationSecurityRequirementCommand extends BaseCommand {
    private _operationPath: NodePath;
    private _data: SecurityRequirementData;
    private _index?: number;
    private _requirementAdded: boolean = false;

    /**
     * Constructor
     * @param operation The operation node to add the security requirement to
     * @param data Security requirement data
     * @param index Optional index to insert the requirement at (for maintaining order during edits)
     */
    constructor(operation: Node, data: SecurityRequirementData, index?: number) {
        super();
        this._operationPath = NodePathUtil.createNodePath(operation);
        this._data = data;
        this._index = index;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddOperationSecurityRequirementCommand';
    }

    /**
     * Execute the command - add a new security requirement to the operation
     */
    execute(document: Document): void {
        const operation = NodePathUtil.resolveNodePath(this._operationPath, document) as OpenApi30Operation;

        if (!operation) {
            console.error('Cannot add security requirement: operation not found');
            this._requirementAdded = false;
            return;
        }

        // Create new security requirement
        const newRequirement: SecurityRequirement = operation.createSecurityRequirement();

        // Add scheme references and scopes
        Object.keys(this._data.schemes).forEach(schemeName => {
            const scopes = this._data.schemes[schemeName];
            // Clone the scopes array to avoid mutations to the original data
            newRequirement.addItem(schemeName, [...scopes]);
        });

        // Handle index-based insertion for maintaining order
        if (this._index !== undefined) {
            operation.insertSecurity(newRequirement, this._index);
        } else {
            operation.addSecurity(newRequirement);
        }

        this._requirementAdded = true;
    }

    /**
     * Undo the command - remove the security requirement from the operation
     */
    undo(document: Document): void {
        if (!this._requirementAdded) {
            return;
        }

        const operation = NodePathUtil.resolveNodePath(this._operationPath, document) as OpenApi30Operation;

        if (!operation) {
            return;
        }

        const security = operation.getSecurity();

        if (security) {
            const index = this._index !== undefined && this._index < security.length
                ? this._index
                : security.length - 1;

            if (index >= 0 && index < security.length) {
                const requirement = security[index];
                operation.removeSecurity(requirement);
            }
        }
    }
}
