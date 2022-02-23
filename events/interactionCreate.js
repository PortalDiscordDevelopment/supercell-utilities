const { getCommandError, getDelay, getCapitalize } = require('../funcs.js');
const fs = require('fs');
const { devs, invite } = require('../data/config/config.json');
const Discord = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            if (command.owner) {
                if (!devs.includes(interaction.user.id)) return interaction.reply({ content: 'This is a developer command!', ephemeral: true });
            }

            try {
                await command.execute(interaction);
            }
            catch (error) {
                getCommandError(interaction, error);
            }
        }
    },
};
