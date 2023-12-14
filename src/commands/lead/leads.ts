import { PermissionFlagsBits, type Message } from "discord.js";
import { Command, CommandMatch, rebuildEvent } from "../../lib/command";
import type { Lead, State, IStateContainer } from "../../lib/state";
import { Phonebook } from ".";

export class AddLeadCommand extends Command {
  regex = /^!lead add (?<ping><@\d+>) (?<name>\w+)$/;
  name = "!lead add <ping> <name>";
  description = "Adds a lead, and sets them up for !fired.";

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (!isAdmin(msg)) {
      return;
    }

    // Destructure to get all relevant groups.
    const { ping, name } = match.groups;

    const currState = state.read();

    // Don't add if they already exist.
    if (currState.leads.find((lead) => lead.ping == ping)) {
      msg.channel.send(`${ping} is already a lead.`);
      return;
    }

    // Use name punning to create the lead.
    const lead: Lead = { name, ping };

    // Push new lead
    currState.leads.push(lead);
    state.write(currState);

    msg.react("👍");
  }
}

export class EmoteLeadCommand extends Command {
  regex = /^!lead emote (?<ping><@\d+>) (?<emote><(?<emote_name>:\w+:)\d+>)?$/;
  name = "!lead emote <ping> <emote>";
  description = "Adds a lead, and sets them up with an emote and for !fired.";

  // Property parameter to declare phonebook
  constructor(private phonebook: Phonebook) {
    super();
  }

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    const { ping, emote, emote_name } = match.groups;

    if (!isAdmin(msg) && msg.author.toString() != ping) {
      return;
    }

    const currState = state.read();

    // Save some time by saving the index.
    const lead_ind = currState.leads.findIndex((lead) => lead.ping == ping);

    // If the index doesn't exist, can't edit.
    if (lead_ind == -1) {
      msg.channel.send(`${ping} is not a lead.`);
      return;
    }

    // If the emote is already taken, don't add it.
    if (currState.leads.find((lead) => lead.emote == emote)) {
      msg.channel.send(`${emote} is already in use.`);
      return;
    }

    // Push new lead
    currState.leads[lead_ind].emote = emote;
    currState.leads[lead_ind].emoteName = emote_name;
    state.write(currState);

    // Add to the dictionary.
    this.phonebook.emojiList[ping] = generateEmojiCommand(
      currState.leads[lead_ind],
    )!;
    this.phonebook.dispatchEvent(rebuildEvent);

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

    msg.react(emote ?? "👍");
  }
}

export class FireableLeadCommand extends Command {
  regex = /^!lead fireable (?<ping><@\d+>) (?<bool>true|false)$/;
  name = "!lead fireable <ping> <canFire>";
  description = "Sets whether a lead is fireable (true or false).";

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    const { ping } = match.groups;

    if (!isAdmin(msg) && msg.author.toString() != ping) {
      return;
    }

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

    msg.react(currState.leads[lead].emote ?? "👍");
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

function generateEmojiCommand(lead: Lead): Command | undefined {
  if (!lead.emote) {
    return undefined;
  }

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

function generateEmojis(leads: Lead[]): Record<string, Command> {
  return Object.fromEntries(
    leads
      .map((x) => [x.ping, generateEmojiCommand(x)])
      .filter((x) => x[1] != undefined),
  );
}
