import { CommandModule } from "../../lib/command";
import {
  ListWhenIWorkCommand,
  RegisterWhenIWorkCommand,
  RemoveWhenIWorkCommand,
} from "./wiw";

export class WhenIWorkCommandModule extends CommandModule {
  commands = [
    new RegisterWhenIWorkCommand(),
    new RemoveWhenIWorkCommand(),
    new ListWhenIWorkCommand(),
  ];

  helpCommand = "!wiw help";
  helpTitle = "When I Work Help";
}
