/**
 * Node utility functions for working with @apitomy/data-models Node objects
 */

import { Document, Node, NodePath, VisitorUtil } from '@apitomy/data-models';
import { capitalize } from './stringUtils';
import { NearestNodeVisitor } from '@visitors/NearestNodeVisitor';
import { NearestOperationVisitor } from '@visitors/NearestOperationVisitor';

/**
 * Finds the getter method for a given property name on a Node
 * @param node The node to search for the getter method
 * @param propertyName The property name (e.g., "summary")
 * @returns The getter function if it exists, otherwise undefined
 */
export function getGetter(node: Node, propertyName: string): ((...args: any[]) => any) | undefined {
    const getterName = 'get' + capitalize(propertyName);

    if (typeof (node as any)[getterName] === 'function') {
        return (node as any)[getterName].bind(node);
    }

    return undefined;
}

/**
 * Finds the setter method for a given property name on a Node
 * @param node The node to search for the setter method
 * @param propertyName The property name (e.g., "summary")
 * @returns The setter function if it exists, otherwise undefined
 */
export function getSetter(node: Node, propertyName: string): ((...args: any[]) => any) | undefined {
    const setterName = 'set' + capitalize(propertyName);

    if (typeof (node as any)[setterName] === 'function') {
        return (node as any)[setterName].bind(node);
    }

    return undefined;
}

/**
 * Finds the creator method for a given property name on a Node
 * @param node The node to search for the creator method
 * @param propertyName The property name (e.g., "info")
 * @returns The creator function if it exists, otherwise undefined
 */
export function getCreator(node: Node, propertyName: string): ((...args: any[]) => any) | undefined {
    const creatorName = 'create' + capitalize(propertyName);

    if (typeof (node as any)[creatorName] === 'function') {
        return (node as any)[creatorName].bind(node);
    }

    return undefined;
}

/**
 * Resolves a NodePath to the nearest existing Node in the document tree
 * @param target The NodePath to resolve
 * @param doc The document to search within
 * @returns The nearest Node found, or null if none exists
 */
export function resolveNearestNode(target: NodePath, doc: Document): Node | null {
    const visitor = new NearestNodeVisitor();
    VisitorUtil.visitPath(doc, target, visitor);
    return visitor.found;
}

/**
 * Resolves a NodePath to the nearest Operation node in the document tree
 * @param target The NodePath to resolve
 * @param doc The document to search within
 * @returns The nearest Operation node found, or null if none exists
 */
export function resolveNearestOperation(target: NodePath, doc: Document): Node | null {
    const visitor = new NearestOperationVisitor();
    VisitorUtil.visitPath(doc, target, visitor);
    return visitor.found;
}
