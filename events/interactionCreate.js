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
        if (interaction.isButton()) {
            let name = interaction.message.embeds[0].author.name
            if (interaction.customId == 'up') {
                interaction.client.channels.fetch('903716195633598484')
                    .then(channel => {
                        channel.send('@everyone' + name + ' has been suggested to be promoted!')
                    })
            }
            if (interaction.customId == 'down') {
                interaction.client.channels.fetch('903716195633598484')
                    .then(channel => {
                        channel.send('@everyone' + name + ' has been suggested to be demoted!')
                    })
            }

            interaction.reply({ content: `You have voted ${interaction.customId} for ${name}!`, ephemeral: true })
        }
    },
};
