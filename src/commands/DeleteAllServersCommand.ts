/**
 * Command to delete all servers from any node that supports servers
 */

import { Document, Node, NodePath, NodePathUtil, OpenApi30Server, OpenApiServer, Library } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for nodes that support server operations
 */
interface ServerParent {
    getServers(): OpenApiServer[];
    createServer(): OpenApi30Server;
    clearServers(): void;
    addServer(server: OpenApi30Server): void;
}

/**
 * Command to delete all server definitions from any node that supports servers
 */
export class DeleteAllServersCommand extends BaseCommand {
    private parentPath: NodePath;
    private _oldServers: any[] = [];

    /**
     * Constructor
     * @param parent The parent node (Document or PathItem) that supports servers
     */
    constructor(parent: Node) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent);
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteAllServersCommand';
    }

    /**
     * Execute the command - delete all servers
     */
    execute(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            throw new Error(`Parent node not found: ${this.parentPath.toString()}`);
        }

        const servers = parent.getServers();
        if (!servers || servers.length === 0) {
            return;
        }

        // Save all servers for undo
        this._oldServers = servers.map((server: OpenApiServer) => Library.writeNode(server));

        // Clear all servers
        parent.clearServers();
    }

    /**
     * Undo the command - restore all servers
     */
    undo(document: Document): void {
        if (this._oldServers.length === 0) {
            return;
        }

        const parent = this.getParentNode(document);
        if (!parent) {
            return;
        }

        // Recreate all servers in original order
        this._oldServers.forEach((serverData: any) => {
            const newServer = parent.createServer();
            Library.readNode(serverData, newServer);
            parent.addServer(newServer);
        });
    }

    /**
     * Get the parent node from the document using the stored NodePath
     */
    private getParentNode(document: Document): ServerParent | null {
        return NodePathUtil.resolveNodePath(this.parentPath, document) as unknown as ServerParent;
    }
}
