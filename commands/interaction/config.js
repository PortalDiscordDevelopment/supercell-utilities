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
        )
        .addStringOption((option) =>
            option
                .setName('set-clan')
                .setDescription('set clan')
        )
        .addStringOption((option) =>
            option
                .setName('add-sisterclan')
                .setDescription('add sister clan')
        )
        .addChannelOption((option) =>
            option
                .setName('set-members-channel')
                .setDescription('e')
        )
        .addChannelOption((option) =>
            option
                .setName('set-war-channel')
                .setDescription('e')
        )
        .addChannelOption((option) =>
            option
                .setName('set-events-channel')
                .setDescription('e')
        ),

    async execute(interaction) {
        let game = interaction.options.getString('game');
        let addAccount = interaction.options.getString('add-account');
        let clan = interaction.options.getString('set-clan');
        let sisterClan = interaction.options.getString('add-sister-clan');
        let members = interaction.options.getChannel('set-members-channel');
        let war = interaction.options.getChannel('set-war-channel');
        let events = interaction.options.getChannel('set-events-channel');
        if (!addAccount && !clan && !sisterClan && !members && !war && !events) return await interaction.reply('Please use one of the optional options to configurate.');
        let response;

        if (clan || sisterClan || members || war || events) {
            if (clan || sisterClan) {
                tag = clan?.replace(/#/, "") || sisterClan?.replace(/#/, "");
                if (game == 'coc') response = await getApi(game, `https://api.clashofclans.com/v1/clans/%23${tag}`)
                if (game == 'cr') response = await getApi(game, `https://api.clashroyale.com/v1/clans/%23${tag}`)
                if (game == 'bs') response = await getApi(game, `https://api.brawlstars.com/v1/clans/%23${tag}`)
            }
            interaction.deferReply();
            await getDelay(1000)
            const data = await getDatabase().guilds.findOne({ where: { name: interaction.guild.id } })
            if (!data) {
                interaction.editReply('Creating a server profile...')
                getDatabase().guilds.create({
                    name: interaction.guild.id,
                    cocClan: null,
                    cocClans: [],
                    cocMembers: null,
                    cocWar: null,
                    cocEvents: null,
                    crClan: null,
                    crClans: [],
                    crMembers: null,
                    crEvents: null,
                    bsClub: null,
                    bsClubs: [],
                    bsEvents: null,
                    language: "en-US"
                })
                await getDelay(4000)
            }

            const server = await getDatabase().guilds.findOne({ where: { name: interaction.guild.id } })
            if (game == 'coc') {
                if (clan) {
                    await getDatabase().guilds.update({ cocClan: clan }, { where: { name: interaction.guild.id } });
                    return await interaction.editReply({ content: `Set your **main** clan to be ${response.name}.` });
                }
                if (sisterClan) {
                    let clans = server.sisterClans.split(',');
                    if (clans[0] == '') clans = clans.slice(1);
                    clans.push(sisterClan);
                    await getDatabase().guilds.update({ cocClan: clans }, { where: { name: interaction.guild.id } });
                }
                if (members) {
                    await getDatabase().guilds.update({ cocMembers: members.id }, { where: { name: interaction.guild.id } });
                    return await interaction.editReply({ content: `Set your membrs channel to ${members}.` });
                }

            }
            else return interaction.editReply('this is still work in progress')
        }

        if (addAccount) {
            tag = addAccount.replace('#', "");
            if (game == 'coc') response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`)
            if (game == 'cr') response = await getApi(game, `https://api.clashroyale.com/v1/players/%23${tag}`)
            if (game == 'bs') response = await getApi(game, `https://api.brawlstars.com/v1/players/%23${tag}`)

            if (response) {
                const userData = await getDatabase().users.findOne({ where: { name: interaction.user.id } })
                if (!userData) {
                    interaction.reply('Creating a user profile...')
                    getDatabase().users.create({
                        name: interaction.user.id,
                        cocAccounts: [],
                        crAccounts: [],
                        bsAccounts: [],
                        language: "en-US"
                    })
                    await getDelay(5000)
                }
                const user = await getDatabase().users.findOne({ where: { name: interaction.user.id } })
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
                    .setDescription(`Name: ${response.name}\nLevel: ${response.expLevel}`)

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
                            newInteraction.update({ content: `Successfully added ${response.name} to your accounts!`, embeds: [], components: [] })
                            collector.stop()
                        }
                        if (game == 'cr') {
                            crAccounts.push(tag)
                            await getDatabase().users.update({ crAccounts: crAccounts }, { where: { name: interaction.user.id } })
                            newInteraction.update({ content: `Successfully added ${response.name} to your accounts!`, embeds: [], components: [] })
                            collector.stop()
                        }
                        if (game == 'bs') {
                            bsAccounts.push(tag)
                            await getDatabase().users.update({ bsAccounts: bsAccounts }, { where: { name: interaction.user.id } })
                            newInteraction.update({ content: `Successfully added ${response.name} to your accounts!`, embeds: [], components: [] })
                            collector.stop()
                        }
                    }
                })
            }
        }
    },
};