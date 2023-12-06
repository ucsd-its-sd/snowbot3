import { Client, GatewayIntentBits, Events } from "discord.js";
import { CommandHandler } from "./lib/commandHandler";
import { LessUsefulCommandModule, UsefulCommandModule } from "./lib/commands";
import { JSONStateContainer } from "./lib/stateContainer";
import { type State } from "./lib/state";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Security-wise, we really shouldn't be keeping the token with the state
// since it is read by every command, and it is possible we could leak it
// if we were to accidentally create a command that can access arbitrary state.
// I've decided that since this is an internal tool and its very easy to reset
// the token, this is acceptable, but there are many better ways to do this.
const state = new JSONStateContainer<State>("./config.json");

// Create this first to get the phonebook from it
const lessUseful = new LessUsefulCommandModule();

const handler = new CommandHandler(state, [
  new UsefulCommandModule(),
  lessUseful,
  lessUseful.phonebook,
]);

client.on(Events.ClientReady, () => {
  console.log(`Successfully logged in as ${client.user!.tag}`);
});

// We have to bind to handler, because otherwise it becomes bound to client :(
client.on(Events.MessageCreate, handler.execute.bind(handler));

// Login with the token from the state
client.login(state.read().token);
