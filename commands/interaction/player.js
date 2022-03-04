const { SlashCommandBuilder, strikethrough } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const { getApi, getDatabase } = require('../../funcs.js');
const options = require('../../data/config/options.json');
const Discord = require('discord.js');
const got = require('got');

module.exports = {
    detailedDescription: "player",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('player')
        .setDescription('player')
        .addStringOption((option) =>
            option
                .setName('game')
                .setDescription('game')
                .setRequired(true)
                .setChoices([
                    [
                        'Clash of Clans',
                        'coc'
                    ],
                    [
                        'Clash Royale',
                        'cr'
                    ],
                    [
                        'Brawl Stars',
                        'bs'
                    ]
                ])
        )
        .addStringOption((option) =>
            option
                .setName('tag')
                .setDescription('give the user\'s tag')
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('user')
        ),

    async execute(interaction) {
        let game = interaction.options.getString('game');
        let tag = interaction.options.getString('tag');
        let user = interaction.options.getUser('user');
        tag = tag?.replace('#', "");
        if (tag == null || tag == undefined) return interaction.reply('Please specify a tag.')
        if (game == 'coc') getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`).then(res => interaction.reply(res.name)).catch(error => { if (String(error).includes('404')) return interaction.reply('Couldn\'t find that player!') })
        if (game == 'cr') getApi(game, `https://api.clashroyale.com/v1/players/%23${tag}`).then(res => interaction.reply(res.name)).catch(error => { if (String(error).includes('404')) return interaction.reply('Couldn\'t find that player!') })
        if (game == 'bs') getApi(game, `https://api.brawlstars.com/v1/players/%23${tag}`).then(res => interaction.reply(res.name)).catch(error => { if (String(error).includes('404')) return interaction.reply('Couldn\'t find that player!') })
    },
};