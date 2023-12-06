import type { Message } from "discord.js";
import {
  Command,
  CommandMatch,
  CommandModule,
  rebuildEvent,
} from "../../lib/command";
import type { Lead, State, IStateContainer } from "../../lib/state";

class Phonebook extends CommandModule {
  leadCommand: LeadCommand;

  constructor(leadCommand: LeadCommand) {
    super();

    this.leadCommand = leadCommand;
  }

  get commands() {
    return Object.values(this.leadCommand.emojiList);
  }

  helpCommand = "☎️";
  helpTitle = "Phonebook";
}

export class LeadCommand extends Command {
  regex =
    /^!lead (refresh|(?<ping><@\d+>) (add (?<add_name>\w+) (?<add_emote><(?<add_emote_name>:\w+:)\d+>)|fireable (?<fired_bool>true|false)|remove))$/;
  name = "!lead";

  // Emoji commands keyed by ping.
  emojiList: Record<string, Command> = {};
  phonebook: CommandModule = new Phonebook(this);

  initialize(state: IStateContainer<State>): void {
    this.emojiList = this.generateEmojis(state.read().leads);
  }

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (!match.groups.ping) {
      // Refresh
      this.emojiList = this.generateEmojis(state.read().leads);
      this.phonebook.dispatchEvent(rebuildEvent);
      return;
    }

    const ping = match.groups.ping;

    const currState = state.read();

    if (match.groups.add_name) {
      const name = match.groups.add_name;
      const emote = match.groups.add_emote;
      const emoteName = match.groups.add_emote_name;

      // Don't add if they already exist.
      if (currState.leads.find((lead) => lead.ping == ping)) {
        msg.channel.send(`${name} is already a lead.`);
        return;
      }

      // Don't use emotes twice.
      if (currState.leads.find((lead) => lead.emote == emote)) {
        msg.channel.send(`${emote} is already in use.`);
        return;
      }

      const lead: Lead = { name, ping, emote, emoteName };

      // Add to the dictionary.
      this.emojiList[ping] = this.generateEmojiCommand(lead);
      this.phonebook.dispatchEvent(rebuildEvent);

      // Push new lead (using name punning)
      currState.leads.push(lead);
      state.write(currState);

      msg.channel.send(`Added ${name} as a lead.`);
    } else if (match.groups.fired_bool) {
      // If they are not fireable, dontFire is true.
      const dontFire = match.groups.fired_bool == "false";

      // Save some time by saving the index.
      const lead = currState.leads.findIndex((lead) => lead.ping == ping);

      // If the index doesn't exist, can't edit.
      if (lead == -1) {
        msg.channel.send(`${ping} is not a lead.`);
        return;
      }

      // Set their fireability explicitly.
      currState.leads[lead].dontFire = dontFire;
      state.write(currState);

      msg.channel.send(
        `${currState.leads[lead].name} will ${
          dontFire ? "not " : ""
        }be pinged by !fired.`,
      );
    } else {
      // Remove the old emoji from the dictionary.
      delete this.emojiList[ping];
      this.phonebook.dispatchEvent(rebuildEvent);

      // Save some time by saving the index.
      const lead = currState.leads.findIndex((lead) => lead.ping == ping);

      // If the index doesn't exist, can't edit.
      if (lead == -1) {
        msg.channel.send(`${ping} is not a lead.`);
        return;
      }

      // Save the name, since we're deleting them.
      const { name } = currState.leads[lead];

      // Remove the lead at this index.
      currState.leads.splice(lead, 1);
      state.write(currState);

      msg.channel.send(`Removed ${name} as a lead.`);
    }
  }

  private generateEmojis(leads: Lead[]): Record<string, Command> {
    return Object.fromEntries(
      leads.map((x) => [x.ping, this.generateEmojiCommand(x)]),
    );
  }

  private generateEmojiCommand(lead: Lead): Command {
    // Create the emoji command.
    return {
      regex: new RegExp(lead.emote),
      name: lead.emote,
      description: `${lead.emoteName} dials ${lead.name}`,
      execute(msg: Message) {
        msg.channel.send(lead.ping);
      },
      initialize() {},
    };
  }
}
