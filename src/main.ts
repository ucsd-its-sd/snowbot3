import { Client, GatewayIntentBits, Events } from "discord.js";
import { CommandHandler } from "./lib/command";
import { State, JSONStateContainer } from "./lib/state";
import {
  LessUsefulCommandModule,
  UsefulCommandModule,
  LeadCommandModule,
  BackupCommandModule,
} from "./commands";

async function begin() {
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
  const state = new JSONStateContainer<State>("./config/config.json");

  // Create this first to get the phonebook from it
  const lead = new LeadCommandModule();

  const handler = await CommandHandler.create(state, [
    new UsefulCommandModule(),
    new LessUsefulCommandModule(),
    lead,
    lead.phonebook,
    new BackupCommandModule(),
  ]);

  client.on(Events.ClientReady, () => {
    console.log(`Successfully logged in as ${client.user!.tag}`);
  });

  // We have to bind to handler, because otherwise it becomes bound to client :(
  client.on(Events.MessageCreate, handler.execute.bind(handler));

  // Login with the token from the state
  client.login((await state.read()).token);
}

begin();
