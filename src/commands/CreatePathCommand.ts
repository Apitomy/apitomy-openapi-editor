/**
 * Command to create a new path item in the document
 */

import {Document, OpenApi30PathItem, OpenApiDocument} from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to create a new path item (e.g., /pets, /users/{id})
 */
export class CreatePathCommand extends BaseCommand {
    private _pathName: string;
    private _pathCreated: boolean = false;

    /**
     * Constructor
     * @param pathName The path to create (e.g., "/pets", "/users/{id}")
     */
    constructor(pathName: string) {
        super();
        // Ensure path starts with /
        this._pathName = pathName.startsWith('/') ? pathName : `/${pathName}`;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'CreatePathCommand';
    }

    /**
     * Execute the command - create the path item
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApiDocument;
        let paths = oaiDoc.getPaths();

        // Create paths object if it doesn't exist
        if (!paths) {
            paths = oaiDoc.createPaths();
            oaiDoc.setPaths(paths);
        }

        // Check if path already exists
        const existingPath = paths.getItem(this._pathName);
        if (existingPath) {
            // Path already exists, don't create it again
            this._pathCreated = false;
            return;
        }

        // Create the new path item
        const newPathItem = paths.createPathItem() as OpenApi30PathItem;
        paths.addItem(this._pathName, newPathItem);

        this._pathCreated = true;
    }

    /**
     * Undo the command - remove the path item
     */
    undo(document: Document): void {
        if (!this._pathCreated) {
            return;
        }

        const oaiDoc = document as OpenApiDocument;
        const paths = oaiDoc.getPaths();

        if (!paths) {
            return;
        }

        // Remove the path item
        paths.removeItem(this._pathName);
    }

    /**
     * Get the path name that was created
     */
    getPathName(): string {
        return this._pathName;
    }
}
