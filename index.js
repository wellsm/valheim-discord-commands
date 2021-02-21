const { default: axios } = require('axios');
const { Client } = require('discord.js');
const client = new Client();

const Compute = require('@google-cloud/compute');
const compute = new Compute();

require('dotenv/config');

const INSTANCE_ZONE = process.env.INSTANCE_ZONE;
const INSTANCE_NAME = process.env.INSTANCE_NAME;
const TIME_INTERVAL = process.env.INSTANCE_INTERVAL;
const TIME_TO_STOP  = process.env.INSTANCE_TIME_STOP;

const DISCORD_CHANNEL = process.env.DISCORD_CHANNEL;
const DISCORD_TOKEN   = process.env.DISCORD_TOKEN;
const DISCORD_URL     = process.env.DISCORD_URL;

const STATUSES = {
    'TERMINATED': '```diff\n- desligado\n```',
    'RUNNING': '```diff\n+ ligado\n```'
};

const MESSAGE = {
    "content": null,
    "username": "Valheim Server",
    "embeds": []
};

const COMMANDS = [
    { command: 'start', description: 'esse é brabo. inicia o server do valheim e retorna o IP' },
    { command: 'stop', description: 'minhas condolências, esse aqui desliga o server do valheim' },
    { command: 'status', description: 'básicão. exibe o status do server do valheim' },
    { command: 'continue', description: 'tu é o viciadão memo hein, esse te deixa jogar mais um pouco' }
];

const COLOR = 15088719;
const NO_IP = '```-```';

const IP      = (ip) => ip != '' ? ('```:ip:2456```').replace(':ip', ip) : NO_IP;
const STOP_IN = () => TIME_TO_STOP < 1 ? `${TIME_TO_STOP * 60} segundos` : `${TIME_TO_STOP} minutos`;

let INSTANCE_INTERVAL = null;
let INSTANCE_TIMEOUT = null;

const SET_INSTANCE_INTERVAL = () => setInterval(() => {
    axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
        {
            "color": COLOR,
            "title": "hey arrombado/senhorita",
            "description": `ainda ta aí?\no server irá desligar em ${STOP_IN()}\ndigite o comando abaixo e continue playando`,
            "fields": [
                { "name": "comando", "value": "```!instance continue```", "inline": true}
            ]
        }
    ]});

    clearTimeout(INSTANCE_TIMEOUT);

    INSTANCE_TIMEOUT = SET_INSTANCE_TIMEOUT();
}, TIME_INTERVAL * 60 * 1000);

const SET_INSTANCE_TIMEOUT = () => setTimeout(() => commands.instance.stop(true), TIME_TO_STOP * 60 * 1000);

const zone = compute.zone(INSTANCE_ZONE);
const vm = zone.vm(INSTANCE_NAME);

client.on('message', (message) => {
    if (message.channel.id == DISCORD_CHANNEL && message.content.startsWith('!')) {
        const content = message.content.substr(1);
        const splited = content.split(' ');
        const command = splited.shift();
        const action  = splited.shift() || 'help';
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
        help: async () => {
            const description = COMMANDS.map(command => `**${command.command}:** ${command.description}`).join('\n');

            return axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "color": COLOR,
                    "title": 'comandos',
                    "description": description
                }
            ]});
        },
        start: async () => {
            await vm.start();

            setTimeout(async () => {
                const instance = (await vm.get()).shift();
                const status = STATUSES[instance.metadata.status];
                const ip = instance.metadata.networkInterfaces.shift().accessConfigs.shift().natIP || '';

                axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                    {
                        "description": "ta aqui seu **ip** porra\nvai la jogar agora e me deixa em paz",
                        "color": COLOR,
                        "fields": [
                            { "name": "status", "value": status, "inline": true },
                            { "name": "ip", "value": IP(ip), "inline": true }
                        ]
                    }
                ]});

                INSTANCE_INTERVAL = SET_INSTANCE_INTERVAL();
            }, 30 * 1000);

            return axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "description": "ôooo viciado, ta iniciando, aguenta ae caraio",
                    "color": COLOR
                }
            ]});
        },
        stop: async (force = false) => {
            await vm.stop();

            setTimeout(() => {
                axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                    {
                        "description": "ta desligado quirido, dorme pensando em como construir aquele machado maneiro",
                        "color": COLOR,
                        "fields": [
                            { "name": "status", "value": status, "inline": true },
                            { "name": "ip", "value": '-', "inline": true }
                        ]
                    }
                ]});
            }, 10 * 1000);

            let description = "porra.... finalmente vai dormir ein. lembrou que tem que trabalhar amanhã é?";

            if (!force) {
                description = "porra.... não fode, ve se lembra de desligar da próxima vez!";
            }

            return axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "description": description,
                    "color": COLOR
                }
            ]});
        },
        status: async () => {
            const instance = (await vm.get()).shift();
            const status = STATUSES[instance.metadata.status];
            const ip = instance.metadata.networkInterfaces.shift().accessConfigs.shift().natIP || '';

            axios.post(DISCORD_URL, { ...MESSAGE, embeds: [
                {
                    "color": COLOR,
                    "fields": [
                        { "name": "status", "value": status, "inline": true },
                        { "name": "ip", "value": IP(ip), "inline": true }
                    ]
                }
            ]});
        },
        continue: () => {
            clearInterval(INSTANCE_INTERVAL);
            clearTimeout(INSTANCE_TIMEOUT);

            INSTANCE_INTERVAL = SET_INSTANCE_INTERVAL();
        },
    },
};