import { Client, GatewayIntentBits, Events } from "discord.js";
import { CommandHandler } from "./commandHandler";
import { LessUsefulCommandModule, UsefulCommandModule } from "./commands";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const handler = new CommandHandler([new UsefulCommandModule(), new LessUsefulCommandModule()]);

client.on(Events.ClientReady, () => {
    console.log(`Successfully logged in as ${client.user!.tag}`);
});

client.on(Events.MessageCreate, (msg) => {
    handler.execute(msg);
});
