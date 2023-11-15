import { Message } from "discord.js";
import { Command, CommandMatch } from "../../command";

/**
 * A command that responds to a message with a string.
 */
class CallResponseCommand implements Command {
    name: string;
    response: string;

    description = null;

    constructor(name: string, response: string) {
        this.name = name;
        this.response = response;
    }

    get regex(): RegExp {
        return new RegExp(this.name);
    }

    execute(msg: Message, match: CommandMatch): void {
        msg.channel.send(this.response);
    }
}

export const aloha = new CallResponseCommand("!aloha", "World class customer service!");

export const ping = new CallResponseCommand("!ping", "pong");

export const sleep = new CallResponseCommand("!sleep", "go to bed");