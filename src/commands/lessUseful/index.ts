import { CommandModule } from "../../lib/command";
import { CallResponseCommand } from "../callResponse";
import { FiredHiredCommand } from "./fired";

export class LessUsefulCommandModule extends CommandModule {
  commands = [
    new FiredHiredCommand(),
    new CallResponseCommand("!ping", "pong"),
    new CallResponseCommand("!sleep", "go to bed"),
    new CallResponseCommand("!aloha", "World class customer service!"),
    new CallResponseCommand("fuck|shit|\bass\b|bitch", "LANGUAGE"),
  ];
}
