import { Message } from "discord.js";

export interface CommandMatch {
    content: string;
    range: [number, number];
    groups: Record<string, string>;
}

export interface Command {
    regex: RegExp;
    name: string;
    description: string;
    execute(msg: Message, match: CommandMatch): void;
}
