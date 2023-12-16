import { Message, MessageType } from "discord.js";
import { Command, CommandMatch } from "../../lib/command";
import { Lead, State, IStateContainer } from "../../lib/state";

export class FiredHiredCommand extends Command {
  regex = /!((?<fired>fired)|(?<hired>hired))/;
  name = "!fired and !hired";
  description = "Fires or re-hires a random lead.";

  firedStack: string[] = [];
  lastReset = new Date();

  readonly hireJokes = [
    " is still gonna be fired actually.",
    " has been rehired! All your shifts start at 6:45am.",
    " Welcome back! We have a thunderbird user on the line for you.",
    " nice to see you! Can you take a look at this ticket? It's been bouncing between us and health for weeks.",
    " You're back! There's someone asking for you specifically, they seem upset.",
    " Aloha! You have been selected to test our new 12am-6am graveyard shift",
    " has been moved to the People OU for transfer to Health IS",
    " has been sent to our new Texas office for the next three years",
    " is now head of FS North",
  ];

  async execute(
    msg: Message,
    match: CommandMatch,
    state: IStateContainer<State>,
  ): Promise<void> {
    if (match.groups.fired) {
      // Reset every 24 hours
      let today = new Date();
      if (today.valueOf() - this.lastReset.valueOf() > 1000 * 60 * 60 * 24) {
        this.firedStack = [];
        this.lastReset = today;
      }

      // Get leads
      let { leads } = await state.read();

      // If this is a reply, fire the person who was replied to
      if (msg.type == MessageType.Reply) {
        const m = await msg.fetchReference();
        const ping = m.author.toString();
        this.firedStack.push(ping);
        await msg.channel.send(`${ping} Fired`);
        return;
      }

      // Create a set from the current fired stack, for efficient existence check.
      let firedSet = new Set(this.firedStack);

      // Get all leads that are not already fired and are not opted-out.
      // Opt-out based so that if dontFire is missing, it is treated as fireable.
      let fireable = leads.filter((l) => !firedSet.has(l.ping) && !l.dontFire);

      // If there's no one to fire, cancel.
      if (fireable.length == 0) {
        await msg.channel.send(
          "https://tenor.com/view/no-i-dont-think-i-will-gif-23864982",
        );
        return;
      }

      // Choose a random person to fire.
      let fired = fireable[Math.floor(Math.random() * fireable.length)];
      this.firedStack.push(fired.ping);

      // "Fire" them.
      await msg.channel.send(`${fired.ping} Fired`);
    } else {
      // If there's no one to hire, don't hire anyone.
      if (this.firedStack.length == 0) {
        await msg.channel.send(
          "https://tenor.com/view/no-i-dont-think-i-will-gif-23864982",
        );
        return;
      }

      // Take the most recently fired person.
      let hired = this.firedStack.pop()!;

      // Choose a random joke.
      let joke =
        this.hireJokes[Math.floor(Math.random() * this.hireJokes.length)];

      // "Hire" them.
      await msg.channel.send(hired + joke);
    }
  }
}
