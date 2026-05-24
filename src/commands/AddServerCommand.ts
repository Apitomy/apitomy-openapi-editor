/**
 * Command to add a new server to any node that supports servers
 */

import {Document, Node, NodePath, NodePathUtil, OpenApi30Server, OpenApiServer} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Interface for nodes that support server operations
 */
interface ServerParent {
    getServers(): OpenApiServer[];
    createServer(): OpenApi30Server;
    addServer(server: OpenApi30Server): void;
    removeServer(server: OpenApiServer): void;
}

/**
 * Command to add a new server definition to any node that supports servers
 */
export class AddServerCommand extends BaseCommand {
    private parentPath: NodePath;
    private _serverUrl: string;
    private _serverDescription: string;
    private _serverCreated: boolean = false;

    /**
     * Constructor
     * @param parent The parent node (Document or PathItem) that supports servers
     * @param serverUrl The URL of the server to create
     * @param serverDescription Optional description for the server
     */
    constructor(parent: Node, serverUrl: string, serverDescription?: string) {
        super();
        this.parentPath = NodePathUtil.createNodePath(parent);
        this._serverUrl = serverUrl;
        this._serverDescription = serverDescription || '';
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'AddServerCommand';
    }

    /**
     * Extract variable names from a server URL
     * Example: "http://{domain}.example.com:{port}/api" returns ["domain", "port"]
     */
    private extractVariables(url: string): string[] {
        const variables: string[] = [];
        const regex = /\{([^}]+)\}/g;
        let match;

        while ((match = regex.exec(url)) !== null) {
            variables.push(match[1]);
        }

        return variables;
    }

    /**
     * Execute the command - add a new server
     */
    execute(document: Document): void {
        const parent = this.getParentNode(document);
        if (!parent) {
            throw new Error(`Parent node not found: ${this.parentPath.toString()}`);
        }

        // Check if server already exists
        const existingServers = parent.getServers();
        if (existingServers) {
            const existingServer = existingServers.find((server: OpenApiServer) => server.getUrl() === this._serverUrl);
            if (existingServer) {
                this._serverCreated = false;
                return;
            }
        }

        // Create new server
        const newServer = parent.createServer() as OpenApi30Server;
        newServer.setUrl(this._serverUrl);
        if (this._serverDescription) {
            newServer.setDescription(this._serverDescription);
        }

        // Extract and create server variables
        const variableNames = this.extractVariables(this._serverUrl);
        for (const variableName of variableNames) {
            const serverVariable = newServer.createServerVariable();
            newServer.addVariable(variableName, serverVariable);
        }

        // Add the server to the parent
        parent.addServer(newServer);
        this._serverCreated = true;
    }

    /**
     * Undo the command - remove the server
     */
    undo(document: Document): void {
        if (!this._serverCreated) {
            // Server wasn't created, nothing to undo
            return;
        }

        const parent = this.getParentNode(document);
        if (!parent) {
            return;
        }

        const servers = parent.getServers();
        if (!servers) {
            return;
        }

        // Find and remove the server
        const server = servers.find((s: OpenApiServer) => s.getUrl() === this._serverUrl);
        if (server) {
            parent.removeServer(server);
        }
    }

    /**
     * Get the parent node from the document using the stored NodePath
     */
    private getParentNode(document: Document): ServerParent | null {
        return NodePathUtil.resolveNodePath(this.parentPath, document) as unknown as ServerParent;
    }

}
