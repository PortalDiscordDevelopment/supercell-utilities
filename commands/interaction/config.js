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
        .addSubcommand((sub) =>
            sub
                .setName('add-account')
                .setDescription('add-account')
                .addStringOption((option) =>
                    option
                        .setName('tag')
                        .setDescription('tag')
                        .setRequired(true))
        ),
    async execute(interaction) {
        let confirmRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId(interaction.id + '-yes')
                    .setLabel('Yes')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId(interaction.id + '-no')
                    .setLabel('No')
                    .setStyle('DANGER')
            )

        const user = await getDatabase().users.findOne({ where: { name: interaction.user.id } })
        if (!user) {
            interaction.reply('Creating a profile...')
            getDatabase().users.create({
                name: interaction.user.id,
                accounts: []
            })
            await getDelay(2000)
        }

        if (interaction.options.getSubcommand() == 'add-account') {
            const user = await getDatabase().users.findOne({ where: { name: interaction.user.id } })
            let accounts = user.accounts.split(',') || [];
            if (accounts[0] == '') accounts = accounts.slice(1)
            if (accounts.length >= 15) return await interaction.reply({ content: 'You can\'t add any more accounts.', ephemeral: true });
            let tag = interaction.options.getString('tag');
            if (user.accounts.includes(tag.replace('#', ""))) return interaction.update({ content: 'You have this account already registered!', components: [], embeds: [] })
            await interaction.replied ? interaction.editReply('Checking availability...') : interaction.reply('Checking availability...')
            getApi(`https://api.clashofclans.com/v1/players/%23${tag.replace('#', "")}`)
                .then(res => {
                    let embed = new Discord.MessageEmbed()
                        .setTitle('Is this you?')
                        .setDescription(`name: ${res.name}\ntown hall: ${res.townHallLevel}\nlevel: ${res.expLevel}`)
                        .setColor(color)
                        .setTimestamp()
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    interaction.editReply({ embeds: [embed], components: [confirmRow] })
                    let filter = i => {
                        if ((i.customId != interaction.id + "-yes" || i.customId != interaction.id + "-no") && i.user.id != interaction.user.id) return i.reply({ content: `You're not ${interaction.user.username}!`, ephemeral: true });
                        else return true
                    }
                    let collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 })
                    let str = 'Timed out...';
                    collector.on('collect', async (newInteraction) => {
                        if (newInteraction.customId == interaction.id + '-yes') {
                            str = 'Added this account to your accounts!';
                            accounts.push(tag.replace('#', ""))
                            getDatabase().users.update({ accounts: accounts }, { where: { name: interaction.user.id } })
                        }
                        else str = 'Did not add this account to your accounts!';
                        collector.stop()
                    })
                    collector.on('end', async () => {
                        interaction.editReply({ content: str, components: [], embeds: [] })
                    })
                })
                .catch(error => {
                    interaction.editReply(`\`${tag}\` is an invalid tag.`)
                })
        }
    },
};