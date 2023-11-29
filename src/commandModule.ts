import { Command } from "./command";

/** Command modules can dispatch this to trigger a regex rebuild. */
export const rebuildEvent = new Event('rebuild');

export interface ICommandModule extends EventTarget {
    /** The commands in this module. */
    commands: Command[];

    /** 
     * If null, no help command will be generated.
     * Otherwise, generates a help command with the given name.
     */
    helpCommand: string | null;
}