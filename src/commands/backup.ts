import { CommandModule } from "../lib/command";
import { CallResponseCommand } from "./callResponse";

/**
 * Module to respond with a message if a command fails.
 */
export class BackupCommandModule extends CommandModule {
  commands = [
    new CallResponseCommand(
      "!\\w+",
      "Sorry, I don't recognize that command. You might want to check your spelling and syntax.",
    ),
  ];
}
