const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cooldown } = require('../../data/config/config.json');
const Discord = require('discord.js');
const options = require('../../data/config/options.json');
const { getApi, getDatabase } = require('../../funcs');

module.exports = {
    detailedDescription: "heroes",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('heroes')
        .setDescription('heroes')
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
        let tag = interaction.options.getString('tag');
        let user = interaction.options.getUser('user') || interaction.user;
        tag = tag?.replace('#', "");
        let response;

        if (tag) {
            response = await getApi('coc', `https://api.clashofclans.com/v1/players/%23${tag}`)
            let embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor({ name: response.tag, iconURL: user.avatarURL({ dynamic: true }) })
                .setDescription(`Name: ${response.name} \nTown Hall: ${response.townHallLevel} `)
            response.heroes.map(hero => {
                embed.addField(hero.name, `${hero.level} | ${hero.maxLevel} ${hero.level == hero.maxLevel ? `✅` : ""}`)
            })
            if (response?.league?.iconUrls?.medium) embed.setThumbnail(response.league.iconUrls.medium);
            if (response?.clan?.badgeUrls?.medium) embed.setThumbnail(response.clan.badgeUrls.medium);
            return await interaction.reply({ embeds: [embed] })
        }
        else {
            interaction.deferReply();
            let row = new Discord.MessageActionRow();
            let comp = new Discord.MessageSelectMenu()
                .setCustomId(`${interaction.id}-menu`)
                .setPlaceholder('Choose an account')
                .setMaxValues(1)
                .setMinValues(1)
            row.addComponents(comp.addOptions({ label: 'Accounts overview', description: 'Full accounts page', value: 'index' }))
            let data = await getDatabase().users.findOne({ where: { name: user.id } });

            if (!data) return await interaction.user.id == user.id ? interaction.reply({ content: 'You have not saved any accounts yet, please register an account with `/ config` or specify a tag.' }) : interaction.reply({ content: 'This user has no accounts linked to their account.' })
            let embeds = [];
            let description = "";
            let accounts = data.cocAccounts.split(',');
            description += `${user.username} has ${accounts.length} account(s).\n\n`
            for (let i = 0; i < accounts.length; i++) {
                response = await getApi('coc', `https://api.clashofclans.com/v1/players/%23${accounts[i]}`)
                comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Town Hall: ${response.townHallLevel}`, value: options[i] })

                let embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor({ name: response.tag, iconURL: user.avatarURL({ dynamic: true }) })
                    .setDescription(`Name: ${response.name} \nTown Hall: ${response.townHallLevel} `)
                response.heroes.map(hero => {
                    embed.addField(hero.name, `${hero.level} | ${hero.maxLevel} ${hero.level == hero.maxLevel ? `✅` : ""}`)
                })
                if (embed.fields.length <= 0) embed.addField('No heroes', 'This account has no heroes yet.');
                if (response?.league?.iconUrls?.medium) embed.setThumbnail(response.league.iconUrls.medium);
                if (response?.clan?.badgeUrls?.medium) embed.setThumbnail(response.clan.badgeUrls.medium);
                embeds.push(embed)
                description += `${i + 1}. ${response.name} | Town Hall: ${response.townHallLevel}\n`;
            }
            let indexEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `${user.username}'s accounts`, iconURL: user.avatarURL({ dynamic: true }) })
                .setColor(color)
                .setTimestamp()
                .setDescription(description)

            let changeEmbed = indexEmbed;
            interaction.editReply({ embeds: [changeEmbed], components: [row] })

            interaction.channel.createMessageComponentCollector({ time: cooldown })

                .on('collect', async (newInteraction) => {
                    if (newInteraction.customId != `${interaction.id}-menu`) return;
                    let chosen = newInteraction.values[0]
                    changeEmbed = embeds[options.indexOf(chosen)]
                    if (chosen == 'index') {
                        changeEmbed = indexEmbed;
                    }
                    changeEmbed
                        .setColor(color)
                    await newInteraction.update({ embeds: [changeEmbed], components: [row] })
                })

                .on('end', () => {
                    interaction.editReply({ embeds: [changeEmbed], components: [] });
                })
        }
    },
};