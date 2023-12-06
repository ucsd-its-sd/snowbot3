import { Message } from "discord.js";
import { Command, CommandMatch } from "../lib/command";

/**
 * A command that responds to a message with a string.
 */
export class CallResponseCommand extends Command {
  name: string;
  response: string;
  description?: string;

  constructor(name: string, response: string, description?: string) {
    super();

    this.name = name;
    this.response = response;
    this.description = description;
  }

  get regex(): RegExp {
    return new RegExp(this.name);
  }

  execute(msg: Message, match: CommandMatch): void {
    msg.channel.send(this.response);
  }
}
