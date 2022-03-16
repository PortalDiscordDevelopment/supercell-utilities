const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "cards",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('cards')
        .setDescription('cards'),
    async execute(interaction) {
        interaction.reply({ content: "soon:tm:" });
    },
};