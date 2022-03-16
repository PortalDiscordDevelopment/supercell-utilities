const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "heroes",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('heroes'),
    async execute(interaction) {
        interaction.reply({ content: "soon:tm:" });
    },
};