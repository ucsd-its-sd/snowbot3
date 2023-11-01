import * as process from "process";
import { Client, GatewayIntentBits, Events } from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.login(process.env["DISCORD_TOKEN"]);

client.on(Events.ClientReady, () => {
    console.log(`Successfully logged in as ${client.user!.tag}`);
});

client.on(Events.MessageCreate, (msg) => {});
