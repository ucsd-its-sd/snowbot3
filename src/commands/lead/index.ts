import { Command, CommandModule } from "../../lib/command";
import * as lead from "./leads";

export class Phonebook extends CommandModule {
  emojiList: Record<string, Command> = {};

  get commands() {
    return Object.values(this.emojiList);
  }

  helpCommand = "☎️";
  helpTitle = "Phonebook";
}

export class LeadModule extends CommandModule {
  private _phonebook: Phonebook = new Phonebook();
  phonebook: CommandModule = this._phonebook;

  commands = [
    new lead.AddLeadCommand(this._phonebook),
    new lead.RemoveLeadCommand(this._phonebook),
    new lead.FireableLeadCommand(),
    new lead.RebuildLeadCommand(this._phonebook),
  ];

  helpCommand = "!lead help";
  helpTitle = "Lead Help (administrator only)";
}
