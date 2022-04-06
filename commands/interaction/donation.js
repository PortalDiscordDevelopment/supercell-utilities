const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');
const donation = require('../../data/coc/donation.json');

module.exports = {
    detailedDescription: "donation",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('donation')
        .setDescription('donation')
        .addStringOption((option) =>
            option
                .setName('clan-level')
                .setDescription('What is your clan level')
                .setRequired(true)
                .addChoices([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10 or 10+", "10"]])
        )
        .addStringOption((option) =>
            option
                .setName('clan-castle-level')
                .setDescription('What is the person you\'re donating\'s clan castle level')
                .setRequired(true)
                .addChoices([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]])
        )
        .addStringOption((option) =>
            option
                .setName('troop')
                .setDescription('What troop are you donating')
                .setRequired(true)
                .addChoices([["Barbarian", "Barbarian"], ["Archer", "Archer"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]])
        ),
    async execute(interaction) {
        let             clanLevel = interaction.options.getString('clan-level'),
            clanCastleLevel = interaction.options.getString('clan-castle-level'),
            troop = interaction.options.getString('troop');
        let troopLevel
            troopLevel = donation[troop][clanCastleLevel];
            if (clanLevel > 5) {
                troopLevel++
                if (clanLevel > 10) {
                    troopLevel++
                }
            }
            if (troopLevel > donation[troop][10]) troopLevel = donation[troop][10]
        interaction.reply({ content: `Your donated ${troop} would be level ${troopLevel}. ()` });
    },
};