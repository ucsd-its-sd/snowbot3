import { Command } from "./command";

export interface ICommandModule extends EventTarget {
    commands: Command[];
    helpCommand: string | null;

    rebuild: Event = new Event('rebuild');
}