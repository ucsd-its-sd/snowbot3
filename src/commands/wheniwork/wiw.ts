import {
  PermissionFlagsBits,
  Message,
  UserMention,
  MessagePayload,
} from "discord.js";
import { Command, CommandMatch } from "../../lib/command";
import { State, IStateContainer } from "../../lib/state";
import { User } from "../../lib/wheniwork/shifts";

export class RegisterWhenIWorkCommand extends Command {
  regex = /^!wiw register (?<email>\w+@ucsd\.edu) ?(?<ping><@\d+>)?$/;
  name = "!wiw register <email> [ping]";
  description =
    "Registers yourself for WhenIWork notifications. If you specify a ping, that user will be registered instead.";

  async execute(
    msg: Message,
    match: CommandMatch,
    state: IStateContainer<State>,
  ): Promise<void> {
    // Destructure to get all relevant groups.
    const { email, ping } = match.groups;
    if (ping && !isAdmin(msg)) {
      return;
    }

    const currState = await state.read();

    let req: RequestInit = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currState.whenIWork.token}`,
      },
    };
    let res = await fetch(
      `https://api.wheniwork.com/2/users?search=${email}`,
      req,
    );

    if (!res.ok) {
      await msg.channel.send("Could not reach the WhenIWork API.");
      return;
    }

    let data: { users: User[] } = await res.json();

    if (data.users.length == 0) {
      await msg.channel.send("No user found with that email.");
      return;
    } else if (data.users.length > 1) {
      await msg.channel.send("Multiple users found with that email.");
      return;
    }

    let user = data.users[0];

    currState.whenIWork.userDict[user.id] = {
      ping: (ping ?? msg.author.toString()) as UserMention,
      email: email,
      scheduled: false,
      punched: false,
    };

    await state.write(currState);

    await msg.react("👍");
  }
}

export class RemoveWhenIWorkCommand extends Command {
  regex = /^!wiw remove (?<email>\w+@ucsd\.edu)$/;
  name = "!wiw remove <email>";
  description = "Removes a user from WhenIWork notifications.";

  async execute(
    msg: Message,
    match: CommandMatch,
    state: IStateContainer<State>,
  ): Promise<void> {
    if (!isAdmin(msg)) {
      return;
    }

    const { email } = match.groups;

    const currState = await state.read();

    let entry = Object.entries(currState.whenIWork.userDict).find(
      ([id, user]) => user.email == email,
    );

    if (!entry) {
      await msg.channel.send("No user found with that email.");
      return;
    }

    let [id, user] = entry;

    delete currState.whenIWork.userDict[id];

    await state.write(currState);

    await msg.react("👍");
  }
}

export class ListWhenIWorkCommand extends Command {
  regex = /^!wiw list$/;
  name = "!wiw list";
  description = "Lists all registered WhenIWork users.";

  async execute(
    msg: Message,
    match: CommandMatch,
    state: IStateContainer<State>,
  ): Promise<void> {
    if (!isAdmin(msg)) {
      return;
    }

    const currState = await state.read();

    let users = Object.entries(currState.whenIWork.userDict).map(
      ([id, user]) => {
        return `${user.ping}: ${user.email}`;
      },
    );

    let chunks = users.join("\n").match(/(.|[\r\n]){1,2000}/g)!;

    for (let chunk of chunks) {
      await msg.channel.send({
        content: chunk,
        allowedMentions: { parse: [] },
      });
    }
  }
}

// Helper Functions

function isAdmin(msg: Message): boolean {
  return (
    msg.member?.permissions.has(PermissionFlagsBits.Administrator) ?? false
  );
}
