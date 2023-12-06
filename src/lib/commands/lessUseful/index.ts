import { CommandModule } from "../../commandModule";
import { CallResponseCommand } from "../callResponse";
import { FiredHiredCommand } from "./fired";
import { LeadCommand } from "./leads";

export class LessUsefulCommandModule extends CommandModule {
  private lead = new LeadCommand();

  get phonebook() {
    return this.lead.phonebook;
  }

  commands = [
    this.lead,
    new FiredHiredCommand(),
    new CallResponseCommand("!ping", "pong"),
    new CallResponseCommand("!sleep", "go to bed"),
    new CallResponseCommand("!aloha", "World class customer service!"),
  ];
}
