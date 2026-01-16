const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.queue = new Map();

const Nodes = [{
    name: 'Docker-Node',
    url: 'localhost:2333',
    auth: 'youshallnotpass'
}];

// Lavalink (Shoukaku) connection
client.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
client.shoukaku.on('error', (_, error) => console.error('Lavalink error:', error));
client.shoukaku.on('ready', (name) => console.log(`✅ Lavalink ${name} ready!`));

// comand and event handlers
client.commands = new Collection();
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

client.login(process.env.DISCORD_TOKEN);