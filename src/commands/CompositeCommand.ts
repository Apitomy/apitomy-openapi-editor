/**
 * Command that executes multiple commands as a single unit
 * Useful for batch operations that should be undone/redone together
 */

import { Document } from '@apitomy/data-models';
import { BaseCommand } from './BaseCommand';
import { ICommand } from './ICommand';

/**
 * Composite command that wraps multiple commands and executes them as one
 */
export class CompositeCommand extends BaseCommand {
    private _commands: ICommand[];
    private _description: string;

    /**
     * Constructor
     * @param commands Array of commands to execute as a single unit
     * @param description Optional description for the composite command
     */
    constructor(commands: ICommand[], description?: string) {
        super();
        this._commands = commands;
        this._description = description || 'CompositeCommand';
    }

    /**
     * Returns the type of the command
     */
    type(): string {
        return this._description;
    }

    /**
     * Execute all commands in order
     */
    execute(document: Document): void {
        for (const command of this._commands) {
            command.execute(document);
        }
    }

    /**
     * Undo all commands in reverse order
     */
    undo(document: Document): void {
        // Undo in reverse order to properly restore state
        for (let i = this._commands.length - 1; i >= 0; i--) {
            this._commands[i].undo(document);
        }
    }

    /**
     * Get the number of commands in this composite
     */
    getCommandCount(): number {
        return this._commands.length;
    }
}
