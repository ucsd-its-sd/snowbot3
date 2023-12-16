import { Message } from "discord.js";
import { Command } from "../lib/command";

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

  async execute(msg: Message): Promise<void> {
    await msg.channel.send(this.response);
  }
}
