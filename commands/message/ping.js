const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'e',
    type: 'message',
    detailedDescription: "ping",
    category: "Info",
    async execute(message) {
        let m = await message.channel.send('calculating...')
        let ping = String(message.client.ws.ping);
        let api = String(m.createdTimestamp - message.createdTimestamp)
        m.edit({ content: `**PONG**\nAPI: ${api}ms.\nBot: ${ping}ms.` });
    },
};