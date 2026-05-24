/**
 * Command to delete a path item from the document
 */

import { Document, OpenApi30Document, OpenApi30PathItem, Library } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';

/**
 * Command to delete a path item (e.g., /pets, /users/{id})
 */
export class DeletePathCommand extends BaseCommand {
    private _pathName: string;
    private _oldPathItem: any = null;
    private _pathExisted: boolean = false;

    /**
     * Constructor
     * @param pathName The path to delete (e.g., "/pets", "/users/{id}")
     */
    constructor(pathName: string) {
        super();
        this._pathName = pathName;
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return 'DeletePathCommand';
    }

    /**
     * Execute the command - delete the path item
     */
    execute(document: Document): void {
        const oaiDoc = document as OpenApi30Document;
        const paths = oaiDoc.getPaths();

        if (!paths) {
            // No paths object, nothing to delete
            this._pathExisted = false;
            return;
        }

        // Get the path item to delete
        const pathItem = paths.getItem(this._pathName) as OpenApi30PathItem;

        if (!pathItem) {
            // Path doesn't exist, nothing to delete
            this._pathExisted = false;
            return;
        }

        // Save the path item for undo
        this._oldPathItem = Library.writeNode(pathItem);
        this._pathExisted = true;

        // Remove the path item
        paths.removeItem(this._pathName);
    }

    /**
     * Undo the command - restore the path item
     */
    undo(document: Document): void {
        if (!this._pathExisted || !this._oldPathItem) {
            return;
        }

        const oaiDoc = document as OpenApi30Document;
        let paths = oaiDoc.getPaths();

        // Create paths object if it doesn't exist
        if (!paths) {
            paths = oaiDoc.createPaths();
            oaiDoc.setPaths(paths);
        }

        // Recreate the path item
        const newPathItem = paths.createPathItem() as OpenApi30PathItem;
        Library.readNode(this._oldPathItem, newPathItem);

        // Add it back
        paths.addItem(this._pathName, newPathItem);
    }

    /**
     * Get the path name that was deleted
     */
    getPathName(): string {
        return this._pathName;
    }
}
