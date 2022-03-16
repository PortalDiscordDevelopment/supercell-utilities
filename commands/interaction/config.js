const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const got = require('got');
const { getDatabase, getApi, getDelay } = require('../../funcs.js');
const Discord = require('discord.js');

module.exports = {
    detailedDescription: "config",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('config')
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
                .setName('add-account')
                .setDescription('add account')
        ),

    async execute(interaction) {
        let game = interaction.options.getString('game');
        let tag = interaction.options.getString('add-account');
        if (!tag) return await interaction.reply('Please use the add-account option to add an account.')
        tag = tag.replace('#', "");
        let response;
        if (game == 'coc') response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`)
        if (game == 'cr') response = await getApi(game, `https://api.clashroyale.com/v1/players/%23${tag}`)
        if (game == 'bs') response = await getApi(game, `https://api.brawlstars.com/v1/players/%23${tag}`)

        if (response) {
            const user = await getDatabase().users.findOne({ where: { name: interaction.user.id } })
            if (!user) {
                interaction.reply('Creating a profile...')
                getDatabase().users.create({
                    name: interaction.user.id,
                    cocAccounts: [],
                    crAccounts: [],
                    bsAccounts: []
                })
                await getDelay(2000)
            }
            let cocAccounts = user.cocAccounts.split(',');
            if (cocAccounts[0] == '') cocAccounts = cocAccounts.slice(1)
            if (cocAccounts.length > 25) return await interaction.reply({ content: "You've reached the max amount of accounts per user." })
            if (cocAccounts.includes(tag)) return await interaction.reply({ content: 'This tag has already been registered by you.' })

            let crAccounts = user.crAccounts.split(',');
            if (crAccounts[0] == '') crAccounts = crAccounts.slice(1)
            if (cocAccounts.length > 25) return await interaction.reply({ content: "You've reached the max amount of accounts per user." })
            if (crAccounts.includes(tag)) return await interaction.reply({ content: 'This tag has already been registered by you.' })

            let bsAccounts = user.bsAccounts.split(',');
            if (bsAccounts[0] == '') bsAccounts = bsAccounts.slice(1)
            if (cocAccounts.length > 25) return await interaction.reply({ content: "You've reached the max amount of accounts per user." })
            if (bsAccounts.includes(tag)) return await interaction.reply({ content: 'This tag has already been registered by you.' })

            let embed = new Discord.MessageEmbed()
                .setTitle('Is this you?')
                .setDescription(`name: ${response.name}\nLevel: ${response.expLevel}`)

            let confirmRow = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId(`${interaction.id}-yes`)
                        .setLabel('Yes')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId(`${interaction.id}-no`)
                        .setLabel('No')
                        .setStyle('DANGER')
                )

            interaction.replied ? interaction.editReply({ content: "Profile created succesfully!", embeds: [embed], components: [confirmRow] }) : interaction.reply({ embeds: [embed], components: [confirmRow] })

            let filter = i => {
                if ((i.customId != interaction.id + "-yes" || i.customId != interaction.id + "-no") && i.user.id != interaction.user.id) return i.reply({ content: `You're not ${interaction.user.username}!`, ephemeral: true });
                else return true
            }

            let collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 })

            collector.on('collect', async newInteraction => {
                if (newInteraction.customId == `${interaction.id}-yes`) {
                    if (game == 'coc') {
                        cocAccounts.push(tag)
                        await getDatabase().users.update({ cocAccounts: cocAccounts }, { where: { name: interaction.user.id } })
                        newInteraction.update({ content: 'Successfully added this account to your accounts!', embeds: [], components: [] })
                        collector.stop()
                    }
                    if (game == 'cr') {
                        crAccounts.push(tag)
                        await getDatabase().users.update({ crAccounts: crAccounts }, { where: { name: interaction.user.id } })
                        newInteraction.update({ content: 'Successfully added this account to your accounts!', embeds: [], components: [] })
                        collector.stop()
                    }
                    if (game == 'bs') {
                        bsAccounts.push(tag)
                        await getDatabase().users.update({ bsAccounts: bsAccounts }, { where: { name: interaction.user.id } })
                        newInteraction.update({ content: 'Successfully added this account to your accounts!', embeds: [], components: [] })
                        collector.stop()
                    }
                }
            })
        }
    },
};