const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cooldown } = require('../../data/config/config.json');
const Discord = require('discord.js');
const { getDatabase, getApi, getCapitalize } = require('../../funcs');
const { common, uncommon, rare, epic, mythic, legendary, chromatic } = require('../../data/bs/brawlers.json');
const options = require('../../data/config/options.json');
module.exports = {
    detailedDescription: "brawlers",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('brawlers')
        .setDescription('brawlers')
        .addStringOption((option) =>
            option
                .setName('tag')
                .setDescription('tag')
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('user')
        ),
    async execute(interaction) {
        let tag = interaction.options.getString('tag');
        let user = interaction.options.getUser('user') || interaction.user;

        let response;

        const userData = await getDatabase().users.findOne({ where: { name: user.id } });

        if (tag) {
            tag = tag.replace(/#/, "");
            response = await getApi('bs', `https://api.brawlstars.com/v1/players/%23${tag}`);
            let commonStr = "";
            let uncommonStr = "";
            let rareStr = "";
            let epicStr = "";
            let mythicStr = "";
            let legendaryStr = "";
            let chromaticStr = "";
            let elseStr = "";
            response.brawlers.map(brawler => {
                if (common.includes(brawler.name)) {
                    commonStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else if (uncommon.includes(brawler.name)) {
                    uncommonStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else if (rare.includes(brawler.name)) {
                    rareStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else if (epic.includes(brawler.name)) {
                    epicStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else if (mythic.includes(brawler.name)) {
                    mythicStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else if (legendary.includes(brawler.name)) {
                    legendaryStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else if (chromatic.includes(brawler.name)) {
                    chromaticStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
                else {
                    elseStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : ":nine:"} ${getCapitalize(brawler.name)}, ${brawler.trophies}|${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                }
            })
            let newColor = response.nameColor.slice(4, 10);
            let embed = new Discord.MessageEmbed()
                .setAuthor({ name: `${response.name}'s brawlers`, iconURL: user.avatarURL({ dynamic: true }) })
                .setDescription(`${user} has ${response.brawlers.length} brawler(s) on their ${response.name} account.`)
                .setColor(newColor || color)
                .addField('Common', commonStr || "None")
                .addField('Rare', uncommonStr || "None")
                .addField('Super Rare', rareStr || "None")
                .addField('Epic', epicStr || "None")
                .addField('Mythic', mythicStr || "None")
                .addField('Legendary', legendaryStr || "None")
                .addField('Chromatic', chromaticStr || "None")
            if (elseStr.length > 0) embed.addField('New', elseStr || "None")
            interaction.reply({ embeds: [embed] })
        }
        else {
            if (!userData) {
                return interaction.user.id == user.id ? await interaction.reply('You do not have any saved accounts.') : await interaction.reply(`${user.username} has no saved accounts.`);
            }
            interaction.deferReply();
            let accounts = userData.bsAccounts.split(',');
            let embeds = [];
            let description = `${user} has ${accounts.length} account(s)\n\n`;
            let row = new Discord.MessageActionRow();
            let comp = new Discord.MessageSelectMenu()
                .setCustomId(`${interaction.id}-menu`)
                .setPlaceholder('Choose an account')
                .setMaxValues(1)
                .setMinValues(1)
            row.addComponents(comp.addOptions({ label: 'Accounts overview', description: 'Full accounts page', value: 'index' }))
            for (let i = 0; i < accounts.length; i++) {
                response = await getApi('bs', `https://api.brawlstars.com/v1/players/%23${accounts[i]}`)
                comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Brawlers: ${response.brawlers.length}`, value: options[i] })
                let newColor = response.nameColor.slice(4, 10);
                let commonStr = "";
                let uncommonStr = "";
                let rareStr = "";
                let epicStr = "";
                let mythicStr = "";
                let legendaryStr = "";
                let chromaticStr = "";
                let elseStr = "";
                response.brawlers.map(brawler => {
                    if (common.includes(brawler.name)) {
                        commonStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else if (uncommon.includes(brawler.name)) {
                        uncommonStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else if (rare.includes(brawler.name)) {
                        rareStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else if (epic.includes(brawler.name)) {
                        epicStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else if (mythic.includes(brawler.name)) {
                        mythicStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else if (legendary.includes(brawler.name)) {
                        legendaryStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else if (chromatic.includes(brawler.name)) {
                        chromaticStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                    else {
                        elseStr += `${brawler.power == 1 ? ":one:" : brawler.power == 2 ? ":two:" : brawler.power == 3 ? ":three:" : brawler.power == 4 ? ":four:" : brawler.power == 5 ? ":five:" : brawler.power == 6 ? ":six:" : brawler.power == 7 ? ":seven:" : brawler.power == 8 ? ":eight:" : brawler.power == 9 ? ":nine:" : brawler.power == 10 ? ":keycap_ten:" : "⬆️"} ${getCapitalize(brawler.name)}, ${brawler.trophies} | ${brawler.highestTrophies}🏆, Rank: ${brawler.rank}\n`;
                    }
                })
                let embed = new Discord.MessageEmbed()
                    .setAuthor({ name: `${response.name}'s brawlers`, iconURL: user.avatarURL({ dynamic: true }) })
                    .setDescription(`${user} has ${response.brawlers.length} brawler(s) on their ${response.name} account.`)
                    .setColor(newColor || color)
                    .addField('Common', commonStr || "None")
                    .addField('Rare', uncommonStr || "None")
                    .addField('Super Rare', rareStr || "None")
                    .addField('Epic', epicStr || "None")
                    .addField('Mythic', mythicStr || "None")
                    .addField('Legendary', legendaryStr || "None")
                    .addField('Chromatic', chromaticStr || "None")
                    .setColor(newColor)
                if (elseStr.length > 0) embed.addField('New', elseStr || "None")

                embeds.push(embed)
                description += `${response.name} | Level: ${response.expLevel} | Brawlers: ${response.brawlers.length}\n`
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
                    await newInteraction.update({ embeds: [changeEmbed], components: [row] })
                })

                .on('end', () => {
                    interaction.editReply({ embeds: [changeEmbed], components: [] });
                })
        }
    },
};