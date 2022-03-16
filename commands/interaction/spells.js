const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "spells",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('spells')
        .setDescription('spells'),
    async execute(interaction) {
        interaction.reply({ content: "soon:tm:" });
    },
};