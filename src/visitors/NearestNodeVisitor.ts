/**
 * A visitor used to find the nearest Node when traversing a NodePath.
 * This is useful for resolving a NodePath to its closest existing node in the document tree.
 */

import { AllNodeVisitor, Node } from '@apitomy/data-models';

export class NearestNodeVisitor extends AllNodeVisitor {
    found: Node | null = null;

    visitNode(node: Node): any {
        this.found = node;
    }
}
