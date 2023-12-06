import { PermissionFlagsBits, type Message } from "discord.js";
import { Command, CommandMatch, rebuildEvent } from "../../lib/command";
import type { Lead, State, IStateContainer } from "../../lib/state";
import { Phonebook } from ".";

export class AddLeadCommand extends Command {
  regex =
    /^!lead add (?<ping><@\d+>) (?<name>\w+) (?<emote><(?<emote_name>:\w+:)\d+>)$/;
  name = "!lead add <ping> <name> <emote>";
  description = "Adds a lead, and sets them up with an emote and for !fired.";

  // Property parameter to declare phonebook
  constructor(private phonebook: Phonebook) {
    super();
  }

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (!isAdmin(msg)) {
      return;
    }

    // Destructure to get all relevant groups.
    const { ping, name, emote, emote_name } = match.groups;

    const currState = state.read();

    // Don't add if they already exist.
    const leadConflict = currState.leads.find(
      (lead) => lead.ping == ping || lead.emote == emote,
    );
    if (leadConflict) {
      msg.channel.send(
        leadConflict.ping == ping
          ? `${emote} is in use by ${leadConflict.name}`
          : `${name} is already a lead.`,
      );
      return;
    }

    // Use name punning to create the lead.
    const lead: Lead = { name, ping, emote, emoteName: emote_name };

    // Add to the dictionary.
    this.phonebook.emojiList[ping] = generateEmojiCommand(lead);
    this.phonebook.dispatchEvent(rebuildEvent);

    // Push new lead
    currState.leads.push(lead);
    state.write(currState);

    msg.react(emote);
  }
}

export class RemoveLeadCommand extends Command {
  regex = /^!lead remove (?<ping><@\d+>)$/;
  name = "!lead remove <ping>";
  description = "Removes a lead.";

  // Property parameter to declare phonebook
  constructor(private phonebook: Phonebook) {
    super();
  }

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (!isAdmin(msg)) {
      return;
    }

    const ping = match.groups.ping;

    const currState = state.read();

    // Remove the old emoji from the dictionary.
    delete this.phonebook.emojiList[ping];
    this.phonebook.dispatchEvent(rebuildEvent);

    // Save some time by saving the index.
    const lead = currState.leads.findIndex((lead) => lead.ping == ping);

    // If the index doesn't exist, can't edit.
    if (lead == -1) {
      msg.channel.send(`${ping} is not a lead.`);
      return;
    }

    // Save the emote, since we're deleting them.
    const { emote } = currState.leads[lead];

    // Remove the lead at this index.
    currState.leads.splice(lead, 1);
    state.write(currState);

    msg.react(emote);
  }
}

export class FireableLeadCommand extends Command {
  regex = /^!lead fireable (?<ping><@\d+>) (?<bool>true|false)$/;
  name = "!lead fireable <ping> <canFire>";
  description = "Sets whether a lead is fireable (true or false).";

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (!isAdmin(msg)) {
      return;
    }

    const ping = match.groups.ping;

    // If they are not fireable, dontFire is true.
    const dontFire = match.groups.bool == "false";

    const currState = state.read();

    // Save some time by saving the index.
    const lead = currState.leads.findIndex((lead) => lead.ping == ping);

    // If the index doesn't exist, can't edit.
    if (lead == -1) {
      msg.channel.send(`${match.groups.ping} is not a lead.`);
      return;
    }

    // Set their fireability explicitly.
    currState.leads[lead].dontFire = dontFire;
    state.write(currState);

    msg.react(currState.leads[lead].emote);
  }
}

export class RebuildLeadCommand extends Command {
  regex = /^!lead rebuild$/;
  name = "!lead rebuild";
  description =
    "Rebuilds the phonebook. Use if you've modified the config file.";

  // Property parameter to declare phonebook
  constructor(private phonebook: Phonebook) {
    super();
  }

  initialize(state: IStateContainer<State>): void {
    this.phonebook.emojiList = generateEmojis(state.read().leads);
  }

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (!isAdmin(msg)) {
      return;
    }

    this.phonebook.emojiList = generateEmojis(state.read().leads);
    this.phonebook.dispatchEvent(rebuildEvent);

    msg.channel.send("Rebuilt");
  }
}

// Helper Functions

function isAdmin(msg: Message): boolean {
  return (
    msg.member?.permissions.has(PermissionFlagsBits.Administrator) ?? false
  );
}

function generateEmojiCommand(lead: Lead): Command {
  // Create the emoji command.
  return {
    regex: new RegExp(lead.emote),
    name: lead.emote,
    description: `${lead.emoteName} dials ${lead.name}`,
    execute(msg: Message) {
      if (msg.author.toString() == lead.ping) {
        return;
      }

      msg.channel.send(lead.ping);
    },
    initialize() {},
  };
}

function generateEmojis(leads: Lead[]): Record<string, Command> {
  return Object.fromEntries(
    leads.map((x) => [x.ping, generateEmojiCommand(x)]),
  );
}
