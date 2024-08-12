import { PermissionFlagsBits, Message, UserMention } from "discord.js";
import { Command, CommandMatch } from "../../lib/command";
import { State, IStateContainer } from "../../lib/state";
import { User } from "../../lib/wheniwork/shifts";

export class RegisterWhenIWorkCommand extends Command {
  regex = /^!wiw register (?<email>\w+@ucsd\.edu) ?(?<ping><@\d+>)?$/;
  name = "!wiw register <email> [ping]";
  description =
    "Registers yourself for WhenIWork notifications. If you specify a ping, that user will be used instead.";

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
      msg.channel.send("Could not reach the WhenIWork API.");
      return;
    }

    let data: { users: User[] } = await res.json();

    if (data.users.length == 0) {
      msg.channel.send("No user found with that email.");
      return;
    } else if (data.users.length > 1) {
      msg.channel.send("Multiple users found with that email.");
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

    msg.react("👍");
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
        return `${id}: ${user.email} -> ${user.ping}`;
      },
    );

    msg.channel.send(users.join("\n"));
  }
}

// Helper Functions

function isAdmin(msg: Message): boolean {
  return (
    msg.member?.permissions.has(PermissionFlagsBits.Administrator) ?? false
  );
}
