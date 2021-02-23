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

const STATUSES = {
    'TERMINATED': 'Desligado',
    'RUNNING': 'Ligado'
};

const MESSAGE = {
    "content": null,
    "username": "Valheim Server",
    "embeds": []
};

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
        status: async () => {
            const instance = (await vm.get()).shift();
            const status = STATUSES[instance.metadata.status];
            const ip = instance.metadata.networkInterfaces.shift().accessConfigs.shift().natIP || '';

            axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "color": 15088719,
                    "fields": [
                        { "name": "Status", "value": status, "inline": true },
                        { "name": "IP", "value": ip != '' ? `${ip}:2456` : '-', "inline": true }
                    ]
                }
            ]});
        },
        start: () => {
            vm.start().then(data => {
                setTimeout(() => {
                    vm.get().then(data => {
                        const instance = data.shift();
                        const ip = instance.metadata.networkInterfaces.shift().accessConfigs.shift().natIP || '';

                        axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                            {
                                "description": "Ta aqui seu IP porra\nVai la jogar agora e me deixa em paz",
                                "color": 15088719,
                                "fields": [
                                    { "name": "Status", "value": status, "inline": true },
                                    { "name": "IP", "value": ip != '' ? `${ip}:2456` : '-', "inline": true }
                                ]
                            }
                        ]});
                    });
                }, 30 * 1000);
            });

            axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "description": "Ôooo viciado, ta iniciando, aguenta ae caraio",
                    "color": 15088719
                }
            ]});
        },
        stop: () => {
            vm.stop().then(data => {
                setTimeout(() => {
                    vm.get().then(data => {
                        axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                            {
                                "description": "Ta desligado quirido, dorme pensando em como construir aquele machado maneiro",
                                "color": 15088719,
                                "fields": [
                                    { "name": "Status", "value": status, "inline": true },
                                    { "name": "IP", "value": '-', "inline": true }
                                ]
                            }
                        ]});
                    });
                }, 10 * 1000);
            });

            axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "description": "Porra.... Finalmente vai dormir ein. Lembrou que tem que trabalhar amanhã é?",
                    "color": 15088719
                }
            ]});
        }
    },
};

//commands.instance.status();