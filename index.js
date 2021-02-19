const { default: axios } = require('axios');
const { Client } = require('discord.js');
const client = new Client();

require('dotenv/config');

const DISCORD_CHANNEL = process.env.DISCORD_CHANNEL;
const DISCORD_TOKEN   = process.env.DISCORD_TOKEN;
const START_INSTANCE  = process.env.START_INSTANCE;
const STOP_INSTANCE   = process.env.STOP_INSTANCE;

client.on('message', (message) => {
    if (message.channel.id == DISCORD_CHANNEL && message.content.startsWith('!')) {
        const content = message.content.substr(1);
        const splited = content.split(' ');
        const command = splited.shift();
        const action  = splited.shift();

        const method = commands[command][action];

        if (method === undefined) {
            return;
        }

        method();
    }
});

client.login(DISCORD_TOKEN); 

const commands = {
    instance: {
        start: () => {
            axios.get(START_INSTANCE).catch(e => console.error(e));
        },
        stop: () => {
            axios.get(STOP_INSTANCE).catch(e => console.error(e));;
        }
    },
};