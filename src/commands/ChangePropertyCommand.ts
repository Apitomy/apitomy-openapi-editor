/**
 * Command to change a property on a node
 */

import {Document, Node, NodePath, NodePathUtil} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';
import { getGetter, getSetter } from '@utils/nodeUtils';

/**
 * Command to change a property value on a node
 */
export class ChangePropertyCommand extends BaseCommand {
    private _nodePath: NodePath;
    private _property: string;
    private _newValue: any;
    private _oldValue: any;

    /**
     * Constructor
     * @param nodeOrPath The node, node path, or node path string
     * @param property The property name
     * @param newValue The new value for the property
     */
    constructor(nodeOrPath: Node | NodePath | string, property: string, newValue: any) {
        super();

        // Convert to NodePath based on input type
        if (typeof nodeOrPath === 'string') {
            // String path - parse it
            this._nodePath = NodePathUtil.parseNodePath(nodeOrPath);
        } else if ((nodeOrPath as any).segments !== undefined) {
            // Already a NodePath
            this._nodePath = nodeOrPath as NodePath;
        } else {
            // Node - create path from it
            this._nodePath = NodePathUtil.createNodePath(nodeOrPath as Node);
        }

        this._property = property;
        this._newValue = newValue;
        this._oldValue = undefined;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'ChangePropertyCommand';
    }

    /**
     * Get the value of a property using getter method if available, otherwise direct access
     */
    private getPropertyValue(node: any, property: string): any {
        const getter = getGetter(node, property);

        if (getter) {
            return getter();
        }

        return node[property];
    }

    /**
     * Set the value of a property using setter method if available, otherwise direct access
     */
    private setPropertyValue(node: any, property: string, value: any): void {
        const setter = getSetter(node, property);

        if (setter) {
            setter(value);
        } else {
            node[property] = value;
        }
    }

    /**
     * Execute the command - change the property
     */
    execute(document: Document): void {
        // Resolve the node from the path
        const node = NodePathUtil.resolveNodePath(this._nodePath, document);

        if (!node) {
            throw new Error(`Cannot resolve node path: ${this._nodePath.toString()}`);
        }

        // Save the old value using getter if available
        this._oldValue = this.getPropertyValue(node, this._property);

        // Set the new value using setter if available
        this.setPropertyValue(node, this._property, this._newValue);
    }

    /**
     * Undo the command - restore the old value
     */
    undo(document: Document): void {
        // Resolve the node from the path
        const node = NodePathUtil.resolveNodePath(this._nodePath, document);

        if (!node) {
            throw new Error(`Cannot resolve node path: ${this._nodePath.toString()}`);
        }

        // Restore the old value using setter if available
        this.setPropertyValue(node, this._property, this._oldValue);
    }
}
