import { Message } from "discord.js";
import { Command, CommandMatch } from "../../lib/command";
import { Lead, State, IStateContainer } from "../../lib/state";

export class FiredHiredCommand extends Command {
  regex = /!((?<fired>fired)|(?<hired>hired))/;
  name = "!fired and !hired";
  description = "Fires or re-hires a random lead.";

  firedStack: Lead[] = [];
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

  execute(msg: Message, match: CommandMatch, state: IStateContainer<State>) {
    if (match.groups.fired) {
      // Reset every 24 hours
      let today = new Date();
      if (today.valueOf() - this.lastReset.valueOf() > 1000 * 60 * 60 * 24) {
        this.firedStack = [];
        this.lastReset = today;
      }

      let leads = state.read().leads;
      let firedSet = new Set(this.firedStack);

      let fireable = leads.filter((l) => !firedSet.has(l) && !l.dontFire);

      if (fireable.length == 0) {
        msg.channel.send(
          "https://tenor.com/view/no-i-dont-think-i-will-gif-23864982",
        );
        return;
      }

      let fired = fireable[Math.floor(Math.random() * fireable.length)];

      this.firedStack.push(fired);

      msg.channel.send(`${fired.ping} Fired`);
    } else {
      if (this.firedStack.length == 0) {
        msg.channel.send(
          "https://tenor.com/view/no-i-dont-think-i-will-gif-23864982",
        );
        return;
      }

      let hired = this.firedStack.pop()!;

      let joke =
        this.hireJokes[Math.floor(Math.random() * this.hireJokes.length)];

      msg.channel.send(hired.ping + joke);
    }
  }
}
