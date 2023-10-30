import { readFile } from 'fs/promises'
import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

readFile('/run/secrets/config', 'utf-8')
    .then(JSON.parse)
    .then(data => client.login(data.token));

client.on('ready', () => {
    console.log(`Successfully logged in as ${client.user!.tag}`)
});

client.on('messageCreate', msg => {
    console.log(msg);
});