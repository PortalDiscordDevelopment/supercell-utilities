const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cooldown } = require('../../data/config/config.json');
const { troops, siege, builderTroops, superTroops, darkTroops, pets } = require('../../data/coc/troops.json');
const Discord = require('discord.js');
const options = require('../../data/config/options.json');
const { getApi, getDatabase } = require('../../funcs');

module.exports = {
    detailedDescription: "troops",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('troops')
        .setDescription('troops')
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
            let troopStr = "";
            let darkTroopStr = "";
            let superTroopStr = "";
            let siegeTroopStr = "";
            let builderTroopStr = "";
            let petsStr = "";
            let elseStr = "These troops are either new or temporary.\n\n";
            let embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor({ name: response.tag, iconURL: user.avatarURL({ dynamic: true }) })
                .setDescription(`Name: ${response.name} \nTown Hall: ${response.townHallLevel} `)
                .setFooter({ text: "Super troops are not given as unlocked, but those you can receive in a clan castle." })
            response.troops.map(troop => {
                if (troops.includes(troop.name) && troop.maxLevel !== 18) {
                    troopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
                else if (darkTroops.includes(troop.name)) {
                    darkTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
                else if (superTroops.includes(troop.name)) {
                    superTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
                else if (siege.includes(troop.name)) {
                    siegeTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
                else if (builderTroops.includes(troop.name) && troop.maxLevel === 18) {
                    builderTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
                else if (pets.includes(troop.name)) {
                    petsStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
                else {
                    elseStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                }
            })
            embed.addFields(
                {
                    name: "Troops", value: troopStr || 'None', inline: true
                },
                {
                    name: "Dark Troops", value: darkTroopStr || 'None', inline: true
                },
                { name: '\u200b', value: '\u200b' },
                {
                    name: "Super Troops", value: superTroopStr || 'None', inline: true
                },
                {
                    name: "Siege Machines", value: siegeTroopStr || 'None', inline: true
                },
                { name: '\u200b', value: '\u200b' },
                {
                    name: "Builder troops", value: builderTroopStr || 'None', inline: true
                },
                {
                    name: "Pets", value: petsStr || 'None', inline: true
                })
            if (elseStr.length > 45) {
                embed.addField("New or Temporary Troops", elseStr)
            }
            if (response?.league?.iconUrls?.medium) embed.setThumbnail(response.league.iconUrls.medium);
            if (response?.clan?.badgeUrls?.medium) embed.setThumbnail(response.clan.badgeUrls.medium);
            return await interaction.reply({ embeds: [embed] })
        }
        else {
            let row = new Discord.MessageActionRow();
            let comp = new Discord.MessageSelectMenu()
                .setCustomId(`${interaction.id}-menu`)
                .setPlaceholder('Choose an account')
                .setMaxValues(1)
                .setMinValues(1)
            row.addComponents(comp.addOptions({ label: 'Accounts overview', description: 'Full accounts page', value: 'index' }))
            let data = await getDatabase().users.findOne({ where: { name: user.id } });

            if (!data) return await interaction.user.id == user.id ? interaction.reply({ content: 'You have not saved any accounts yet, please register an account with `/config` or specify a tag.' }) : interaction.reply({ content: 'This user has no accounts linked to their account.' })
            let embeds = [];
            let description = "";
            let accounts = data.cocAccounts.split(',');
            description += `${user.username} has ${accounts.length} account(s).\n\n`
            for (let i = 0; i < accounts.length; i++) {
                response = await getApi('coc', `https://api.clashofclans.com/v1/players/%23${accounts[i]}`)
                comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Town Hall: ${response.townHallLevel}`, value: options[i] })

                let troopStr = "";
                let darkTroopStr = "";
                let superTroopStr = "";
                let siegeTroopStr = "";
                let builderTroopStr = "";
                let elseStr = "These troops are either new or temporary.\n\n";
                let petsStr = "";
                let embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor({ name: response.tag, iconURL: user.avatarURL({ dynamic: true }) })
                    .setDescription(`Name: ${response.name} \nTown Hall: ${response.townHallLevel} `)
                    .setFooter({ text: "Super troops are not given as unlocked, but those you can receive in a clan castle." })
                response.troops.map(troop => {
                    if (troops.includes(troop.name) && troop.maxLevel !== 18) {
                        troopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                    else if (darkTroops.includes(troop.name)) {
                        darkTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                    else if (superTroops.includes(troop.name)) {
                        superTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                    else if (siege.includes(troop.name)) {
                        siegeTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                    else if (builderTroops.includes(troop.name) && troop.maxLevel === 18) {
                        builderTroopStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                    else if (pets.includes(troop.name)) {
                        petsStr += `${(troop.level == troop.maxLevel ? "✅" : "")} ${troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                    else {
                        elseStr += `${(troop.level == troop.maxLevel ? "✅" : "")} {troop.name}: ${troop.level} | ${troop.maxLevel}\n`;
                    }
                })
                embed.addFields({
                    name: "Troops", value: troopStr || 'None', inline: true
                },
                    {
                        name: "Dark Troops", value: darkTroopStr || 'None', inline: true
                    },
                    { name: '\u200b', value: '\u200b' },
                    {
                        name: "Super Troops", value: superTroopStr || 'None', inline: true
                    },
                    {
                        name: "Siege Machines", value: siegeTroopStr || 'None', inline: true
                    },
                    { name: '\u200b', value: '\u200b' },
                    {
                        name: "Builder troops", value: builderTroopStr || 'None', inline: true
                    },
                    {
                        name: "Pets", value: petsStr || 'None', inline: true
                    })
                if (elseStr.length > 45) {
                    embed.addField("New or Temporary Troops", elseStr)
                }
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
            interaction.reply({ embeds: [changeEmbed], components: [row] })

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