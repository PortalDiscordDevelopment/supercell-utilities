const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "achievements",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('achievements'),
    async execute(interaction) {
        interaction.reply({ content: "soon:tm:" });
    },
};