import { Client, GatewayIntentBits, Events } from "discord.js";
import { CommandHandler } from "./lib/command";
import { State, JSONStateContainer } from "./lib/state";
import {
  LessUsefulCommandModule,
  UsefulCommandModule,
  LeadCommandModule,
  BackupCommandModule,
  WhenIWorkCommandModule,
} from "./commands";
import { WhenIWorkManager } from "./lib/wheniwork/manager";

async function begin() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
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
    new WhenIWorkCommandModule(),
    new BackupCommandModule(),
  ]);

  client.on(Events.ClientReady, () => {
    console.info(
      `[INFO] [Discord] Successfully logged in as ${client.user!.tag}`,
    );
  });

  client.on(Events.MessageCreate, (msg) =>
    handler
      .execute(msg)
      .catch((err) =>
        console.error(
          `[ERROR] [Discord] In message "${msg.content}", encountered the following error: ${err}`,
        ),
      ),
  );

  // Login with the token from the state
  await client.login((await state.read()).token);

  // Create the When I Work Manager
  const serviceDeskGuild = await client.guilds.fetch("759484837366857748");
  const wiwManager = new WhenIWorkManager(serviceDeskGuild, state);
  wiwManager
    .begin()
    .catch((err) =>
      console.error(
        `[ERROR] [When I Work] Encountered the following error: ${err}`,
      ),
    );
}

begin();
