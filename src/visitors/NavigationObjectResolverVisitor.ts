/**
 * A visitor used to figure out the top level navigation node for any given selection,
 * no matter how granular in the data model, by traversing the data model in the
 * upward direction and remembering the topmost level path item, schema, etc.
 */

import {
    CombinedOpenApiVisitorAdapter,
    Node,
    OpenApi30Response,
    OpenApi30Schema,
    OpenApiPathItem
} from '@apitomy/data-models';

export class NavigationObjectResolverVisitor extends CombinedOpenApiVisitorAdapter {
    node: Node | undefined;
    nodeType: string | undefined;

    visitPathItem(node: OpenApiPathItem) {
        this.node = node;
        this.nodeType = "pathItem";
    }

    visitSchema(node: OpenApi30Schema) {
        this.node = node;
        this.nodeType = "schema";
    }

    visitResponse(node: OpenApi30Response) {
        this.node = node;
        this.nodeType = "response";
    }

    isFound(): boolean {
        return this.node !== undefined;
    }
}
