/**
 * Command to delete an operation from a path item
 */

import {
    Document,
    OpenApi30PathItem,
    OpenApi30Operation,
    Library,
    NodePath,
    NodePathUtil,
    OpenApi31PathItem, OpenApi20PathItem
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete an operation (GET, POST, PUT, DELETE, etc.) from a path item
 */
export class DeleteOperationCommand extends BaseCommand {
    private _pathItemPath: NodePath;
    private _method: string;
    private _oldOperation: any = null;
    private _operationExisted: boolean = false;

    /**
     * Constructor
     * @param pathItem The path item to delete the operation from
     * @param method The HTTP method (get, post, put, delete, options, head, patch, trace)
     */
    constructor(pathItem: OpenApi20PathItem | OpenApi30PathItem | OpenApi31PathItem, method: string) {
        super();
        this._pathItemPath = NodePathUtil.createNodePath(pathItem);
        this._method = method.toLowerCase();
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteOperationCommand';
    }

    /**
     * Execute the command - delete the operation
     */
    execute(document: Document): void {
        const pathItem = this.getPathItem(document);
        if (!pathItem) {
            throw new Error(`Path item not found: ${this._pathItemPath.toString()}`);
        }

        // Get the operation to delete
        const getter = this.getGetterMethod();
        const operation = (pathItem as any)[getter]?.() as OpenApi30Operation | undefined;

        if (!operation) {
            // Operation doesn't exist, nothing to delete
            this._operationExisted = false;
            return;
        }

        // Save the operation for undo
        this._oldOperation = Library.writeNode(operation);
        this._operationExisted = true;

        // Remove the operation by setting it to null
        const setter = this.getSetterMethod();
        (pathItem as any)[setter]?.(null);
    }

    /**
     * Undo the command - restore the operation
     */
    undo(document: Document): void {
        if (!this._operationExisted || !this._oldOperation) {
            return;
        }

        const pathItem = this.getPathItem(document);
        if (!pathItem) {
            return;
        }

        // Recreate the operation
        const newOperation = pathItem.createOperation() as OpenApi30Operation;
        Library.readNode(this._oldOperation, newOperation);

        // Set it on the path item
        const setter = this.getSetterMethod();
        (pathItem as any)[setter]?.(newOperation);
    }

    /**
     * Get the path item from the document using the stored NodePath
     */
    private getPathItem(document: Document): OpenApi30PathItem | null {
        const resolved = NodePathUtil.resolveNodePath(this._pathItemPath, document);
        return resolved as OpenApi30PathItem;
    }

    /**
     * Get the getter method name for this HTTP method
     */
    private getGetterMethod(): string {
        return `get${this._method.charAt(0).toUpperCase()}${this._method.slice(1)}`;
    }

    /**
     * Get the setter method name for this HTTP method
     */
    private getSetterMethod(): string {
        return `set${this._method.charAt(0).toUpperCase()}${this._method.slice(1)}`;
    }
}
