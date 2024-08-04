import { CommandModule } from "../../lib/command";
import { RegisterWhenIWorkCommand } from "./wiw";

export class WhenIWorkCommandModule extends CommandModule {
  commands = [new RegisterWhenIWorkCommand()];
  
  helpCommand = "!wiw help";
  helpTitle = "When I Work Help";
}
