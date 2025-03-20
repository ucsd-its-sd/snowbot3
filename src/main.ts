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

/**
 * The main entry point for the bot (required to get an async context).
 */
async function begin() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds, // To get the ITS Service (for WhenIWork)
      GatewayIntentBits.GuildMessages, // To see all messages
      GatewayIntentBits.GuildMembers, // To get member information (for WhenIWork)
      GatewayIntentBits.MessageContent, // To read message content
    ],
  });

  // Security-wise, we really shouldn't be keeping the token with the state
  // since it is read by every command, and it is possible we could leak it
  // if we were to accidentally create a command that can access arbitrary state.
  // I've decided that since this is an internal tool and its very easy to reset
  // the token, this is acceptable, but there are many better ways to do this.
  const state = new JSONStateContainer<State>("./config/config.json");

  // We create this before the handler since we need to get the phonebook module from it
  const lead = new LeadCommandModule();

  // Create the command handler, responsible for parsing each message for commands
  // It takes in an array of modules, listed in order of priority
  const handler = await CommandHandler.create(state, [
    new UsefulCommandModule(),
    new LessUsefulCommandModule(),
    lead,
    lead.phonebook,
    new WhenIWorkCommandModule(),
    new BackupCommandModule(), // Catches malformed commands
  ]);

  // Report when the client is ready
  client.on(Events.ClientReady, () => {
    console.info(
      `[INFO] [Discord] Successfully logged in as ${client.user!.tag}`,
    );
  });

  // Read each message to see if it is a command
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

  // Create the When I Work Manager, which assigns roles based on the schedule
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

// Start the bot
begin();
