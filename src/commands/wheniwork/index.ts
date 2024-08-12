import { CommandModule } from "../../lib/command";
import { ListWhenIWorkCommand, RegisterWhenIWorkCommand } from "./wiw";

export class WhenIWorkCommandModule extends CommandModule {
  commands = [new RegisterWhenIWorkCommand(), new ListWhenIWorkCommand()];

  helpCommand = "!wiw help";
  helpTitle = "When I Work Help";
}
