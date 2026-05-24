/**
 * Command to create a new operation on a path item
 */

import {
    Document,
    OpenApi30PathItem,
    OpenApi30Operation,
    NodePath,
    NodePathUtil,
    OpenApi31PathItem, OpenApi20PathItem
} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to create a new operation (GET, POST, PUT, DELETE, etc.) on a path item
 */
export class CreateOperationCommand extends BaseCommand {
    private _pathItemPath: NodePath;
    private _method: string;
    private _operationCreated: boolean = false;

    /**
     * Constructor
     * @param pathItem The path item to create the operation on
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
        return 'CreateOperationCommand';
    }

    /**
     * Execute the command - create the operation
     */
    execute(document: Document): void {
        const pathItem = this.getPathItem(document);
        if (!pathItem) {
            throw new Error(`Path item not found: ${this._pathItemPath.toString()}`);
        }

        // Check if operation already exists
        const getter = this.getGetterMethod();
        if ((pathItem as any)[getter]?.()) {
            // Operation already exists, don't create it again
            this._operationCreated = false;
            return;
        }

        // Create the operation
        const newOperation = pathItem.createOperation() as OpenApi30Operation;

        // Set it on the path item
        const setter = this.getSetterMethod();
        (pathItem as any)[setter]?.(newOperation);

        this._operationCreated = true;
    }

    /**
     * Undo the command - remove the operation
     */
    undo(document: Document): void {
        if (!this._operationCreated) {
            return;
        }

        const pathItem = this.getPathItem(document);
        if (!pathItem) {
            return;
        }

        // Remove the operation by setting it to null
        const setter = this.getSetterMethod();
        (pathItem as any)[setter]?.(null);
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
