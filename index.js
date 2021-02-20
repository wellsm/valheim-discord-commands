const { default: axios } = require('axios');
const { Client } = require('discord.js');
const client = new Client();

const Compute = require('@google-cloud/compute');
const compute = new Compute();

require('dotenv/config');

const INSTANCE_ZONE   = process.env.INSTANCE_ZONE;
const INSTANCE_NAME   = process.env.INSTANCE_NAME;
const DISCORD_CHANNEL = process.env.DISCORD_CHANNEL;
const DISCORD_TOKEN   = process.env.DISCORD_TOKEN;
const DISCORD_URL     = process.env.DISCORD_URL;

const zone = compute.zone(INSTANCE_ZONE);
const vm = zone.vm(INSTANCE_NAME);

client.on('message', (message) => {
    if (message.channel.id == DISCORD_CHANNEL && message.content.startsWith('!')) {
        const content = message.content.substr(1);
        const splited = content.split(' ');
        const command = splited.shift();
        const action  = splited.shift();
        const method  = commands[command][action];

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
            vm.start().then(data => {
                setTimeout(() => {
                    vm.get().then(data => {
                        const IP = data[0].metadata.networkInterfaces[0].accessConfigs[0].natIP;

                        axios.post(DISCORD_URL, {
                            username: "Valheim",
                            content: `Ta aqui seu IP porra **${IP}:2456**, vai la jogar agora e me deixa em paz`
                        });
                    });
                }, 30 * 1000);
            });

            axios.post(DISCORD_URL, {
                username: "Valheim",
                content: "Ôooo viciado, ta iniciando, aguenta ae caraio"
            });
        },
        stop: () => {
            vm.stop().then(data => {
                setTimeout(() => {
                    axios.post(DISCORD_URL, {
                        username: "Valheim",
                        content: `Ta desligado quirido, dorme pensando em como construir aquele machado maneiro`
                    });
                }, 10 * 1000);
            });

            axios.post(DISCORD_URL, {
                username: "Valheim",
                content: "Porra.... Finalmente vai dormir ein. Lembrou que tem que trabalhar amanhã é?"
            });
        }
    },
};