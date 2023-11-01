import { Message } from "discord.js";

interface Command {
    prefix: string;
    regex: RegExp;
    name: string;
    description: string;
    execute: (msg: Message, loc: Number) => void;
}
