/**
 * A visitor used to find the nearest Operation node when traversing a NodePath.
 * This is useful for determining which operation (GET, POST, etc.) is being selected.
 */

import { CombinedOpenApiVisitorAdapter, Node } from '@apitomy/data-models';

export class NearestOperationVisitor extends CombinedOpenApiVisitorAdapter {
    found: Node | null = null;

    visitOperation(node: Node): void {
        // Find the first Operation visited
        if (!this.found) {
            this.found = node;
        }
    }
}
