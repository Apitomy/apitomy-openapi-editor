/**
 * Command to delete a server from any node that supports servers
 */

import { Document, Node, NodePath, NodePathUtil, OpenApi30Server, OpenApiServer, Library } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for nodes that support server operations
 */
interface ServerParent {
    getServers(): OpenApiServer[];
    createServer(): OpenApi30Server;
    removeServer(server: OpenApiServer): void;
    insertServer(server: OpenApi30Server, index: number): void;
}

/**
 * Command to delete a server definition from any node that supports servers
 */
export class DeleteServerCommand extends BaseCommand {
    private parentPath: NodePath;
    private _serverUrl: string;
    private _oldServer: any = null;
    private _serverExisted: boolean = false;
    private _serverIndex: number = -1;

    /**
     * Constructor
     * @param parent The parent node (Document or PathItem) that supports servers
     * @param serverUrl The server URL to delete
     */
    constructor(parent: Node, serverUrl: string) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent);
        this._serverUrl = serverUrl;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeleteServerCommand';
    }

    /**
     * Execute the command - delete the server
     */
    execute(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            throw new Error(`Parent node not found: ${this.parentPath.toString()}`);
        }

        const servers = parent.getServers();
        if (!servers) {
            this._serverExisted = false;
            return;
        }

        // Find the server to delete
        const serverIndex = servers.findIndex((s: OpenApiServer) => s.getUrl() === this._serverUrl);

        if (serverIndex < 0) {
            this._serverExisted = false;
            return;
        }

        const server = servers[serverIndex];

        // Save the server and its index for undo
        this._oldServer = Library.writeNode(server);
        this._serverIndex = serverIndex;
        this._serverExisted = true;

        // Remove the server
        parent.removeServer(server);
    }

    /**
     * Undo the command - restore the server
     */
    undo(document: Document): void {
        if (!this._serverExisted || !this._oldServer) {
            return;
        }

        const parent = this.getParentNode(document);
        if (!parent) {
            return;
        }

        // Recreate the server
        const newServer = parent.createServer();
        Library.readNode(this._oldServer, newServer);

        // Add it back at the same position
        parent.insertServer(newServer, this._serverIndex);
    }

    /**
     * Get the parent node from the document using the stored NodePath
     */
    private getParentNode(document: Document): ServerParent | null {
        return NodePathUtil.resolveNodePath(this.parentPath, document) as unknown as ServerParent;
    }
}
