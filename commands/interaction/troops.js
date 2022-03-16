const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "troops",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('troops')
        .setDescription('troops'),
    async execute(interaction) {
        interaction.reply({ content: "soon:tm:" });
    },
};