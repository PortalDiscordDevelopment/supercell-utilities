const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "brawlers",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('brawlers')
        .setDescription('brawlers'),
    async execute(interaction) {
        interaction.reply({ content: "soon:tm:" });
    },
};