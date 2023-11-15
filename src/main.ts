import * as process from "process";
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
console.log(handler.exec());

client.login(process.env["DISCORD_TOKEN"]);

client.on(Events.ClientReady, () => {
    console.log(`Successfully logged in as ${client.user!.tag}`);
});

client.on(Events.MessageCreate, (msg) => {

});
