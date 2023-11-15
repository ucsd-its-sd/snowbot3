import { Command } from "./command";

export interface CommandModule {
    commands: Command[];
    helpCommand: string | null;
}