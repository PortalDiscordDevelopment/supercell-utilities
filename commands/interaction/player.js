const { SlashCommandBuilder } = require('@discordjs/builders');
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
        let user = interaction.options.getUser('user');
        let userData;
        if (user) {
            userData = await getDatabase().users.findOne({ where: { name: user.id } })
            if (!userData) return interaction.reply('This user has no accounts linked to their account.')

            let accounts = userData.accounts.split(','),
                accountRow = new Discord.MessageActionRow(),
                comp = new Discord.MessageSelectMenu()
                    .setCustomId(interaction.id + '-menu')
                    .setPlaceholder('Click here for your accounts')

            accountRow.addComponents(comp);

            if (accounts.length > 1) {
                for (let i = 0; i < accounts.length; i++) {
                    let res = await getApi(`https://api.clashofclans.com/v1/players/%23${accounts[i]}`);
                    comp.addOptions({ label: `${res.name} || Townhall: ${res.townHallLevel}`, value: options[i] })
                }
                let accountEmbed = new Discord.MessageEmbed()
                    .setTitle('Multiple accounts found')
                    .setColor(color)
                interaction.reply({ embeds: [accountEmbed], components: [accountRow] })

                let filter = i => {
                    if (i.user.id != interaction.user.id) return i.reply({ content: `You're not ${interaction.user.username}!`, ephemeral: true });
                    else return true
                }

                let collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 })

                collector.on('collect', async (newInteraction) => {
                    let chosen = newInteraction.values[0]
                    tag = accounts[options.indexOf(chosen)]
                    player(tag)
                    collector.stop()
                })

            }
            else player(accounts[0])
        }
        else player(tag)
        function player(tag) {
            getApi(`https://api.clashofclans.com/v1/players/%23${tag.replace('#', "")}`)
                .then(res => {

                    let embed = new Discord.MessageEmbed()
                        .setTitle(res.tag)
                        .setColor(color)
                        .setTimestamp()
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                    if (res.name && res.expLevel) embed.addField('General Info', `Clasher: ${res.name}\nLevel: ${res.expLevel}`)
                    if (res.townHallLevel && res.trophies && res.bestTrophies) embed.addField('Home Village', `Town Hall: ${res.townHallLevel}\nTrophies: ${res.trophies} \nHighest Trophies: ${res.bestTrophies}`, true)
                    if (res.builderHallLevel && res.versusTrophies && res.bestVersusTrophies) embed.addField('Builder Base', `Builder Hall: ${res.builderHallLevel}\nTrophies: ${res.versusTrophies} \nHighest Trophies: ${res.bestVersusTrophies}`, true)
                    if (res.attackWins && res.defenseWins && res.donations && res.donationsReceived) embed.addField('Current Season', `Attack wins: ${res.attackWins}\nDefense Wins: ${res.defenseWins}\nDonations: ${res.donations}\nDonations Received: ${res.donationsReceived}\nLeague: ${res.league.name}`)
                    if (res.clan && res.tag && res.role && res.warStars) embed.addField('Clan', `Clan name: ${res.clan.name} (${res.clan.tag})\nRole: ${res.role == 'leader' ? 'Leader' : res.role == 'coLeader' ? 'Co-Leader' : res.role == 'elder' ? 'Elder' : 'Member'}\nWar Stars: ${res.warStars}`)

                    let row = new Discord.MessageActionRow()

                    let comp = new Discord.MessageSelectMenu()
                        .setCustomId(`${interaction.id}-dropdownmenu`)
                        .setPlaceholder('Select category')
                        .setMaxValues(1)
                        .setMinValues(1)
                    row.addComponents(comp.addOptions({ label: "General Info", value: "index" }))

                    let categories = [];
                    let embeds = [];

                    let troopBBStr = "",
                        troopStr = "",
                        troopSuperString = "",
                        spellStr = "",
                        achievement = "",
                        bbAchievement = ""

                    if (res.heroes) {
                        let heroesEmbed = new Discord.MessageEmbed()
                            .setTitle('Heroes')
                            .setColor(color)
                        for (let i = 0; i < res.heroes.length; i++) {
                            if (res.heroes[i].village == 'home') {
                                heroesEmbed.addField(res.heroes[i].name, `${res.heroes[i].level}/${res.heroes[i].maxLevel}\n`, true)
                            }
                            else {
                                heroesEmbed.addField(res.heroes[i].name, `${res.heroes[i].level}/${res.heroes[i].maxLevel}\n`, true)
                            }
                        }

                        categories.push('Heroes')
                        embeds.push(heroesEmbed)
                    }

                    if (res.troops) {
                        for (let i = 0; i < res.troops.length; i++) {
                            if (res.troops[i].village == 'home') {
                                if (res.troops[i].name.toLowerCase().includes('super')) {
                                    troopSuperString += `${res.troops[i].name}: ${res.troops[i].level}/${res.troops[i].maxLevel}\n`
                                }
                                else troopStr += `${res.troops[i].name}: ${res.troops[i].level}/${res.troops[i].maxLevel}\n`
                            }
                            else {
                                troopBBStr += `${res.troops[i].name}: ${res.troops[i].level}/${res.troops[i].maxLevel}\n`
                            }
                        }

                        let troopEmbed = new Discord.MessageEmbed()
                            .setTitle('Troops')
                            .setColor(color)
                            .addField('Home Troops', troopStr, true)
                            .addField('Super Troops', troopSuperString, true)
                            .addField('Builder Troops', troopBBStr, true)

                        categories.push('Troops')
                        embeds.push(troopEmbed)
                    }

                    if (res.spells) {
                        for (let i = 0; i < res.spells.length; i++) {
                            spellStr += `${res.spells[i].name}: ${res.spells[i].level}/${res.spells[i].maxLevel}\n`
                        }
                        let spellEmbed = new Discord.MessageEmbed()
                            .setTitle('Spells')
                            .setColor(color)
                            .addField('Spells', spellStr)

                        categories.push('Spells')
                        embeds.push(spellEmbed)
                    }

                    if (res.achievements) {
                        for (let i = 0; i < res.achievements.length; i++) {
                            if (res.achievements[i].village == 'home') {
                                achievement += `**${res.achievements[i].name}: ${res.achievements[i].value}/${res.achievements[i].target}**\n${res.achievements[i].info}\n`
                            }
                            else {
                                bbAchievement += `**${res.achievements[i].name}: ${res.achievements[i].value}/${res.achievements[i].target}**\n${res.achievements[i].info}\n`
                            }
                        }

                        let achievementEmbed = new Discord.MessageEmbed()
                            .setTitle('Achievements')
                            .setColor(color)
                            .setDescription('**Achievements**\n' + achievement)
                            .addField('Builder Base Achievements', bbAchievement, true)

                        categories.push('Achievements')
                        embeds.push(achievementEmbed)
                    }

                    for (let i = 0; i < categories.length; i++) {
                        comp.addOptions({ label: (categories[i] || "Error title not provided: " + options[i]), value: options[i] })
                    }

                    let changeEmbed;

                    changeEmbed = embed;
                    if (comp.options.length <= 1) return interaction.replied ? interaction.editReply({ embeds: [changeEmbed] }) : interaction.reply({ embeds: [changeEmbed] })
                    else interaction.replied ? interaction.editReply({ embeds: [changeEmbed], components: [row] }) : interaction.reply({ embeds: [changeEmbed], components: [row] })
                    let filter = (inter) => inter.isSelectMenu();
                    let collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

                    collector.on("collect", async (newInteraction) => {
                        if (newInteraction.customId != `${interaction.id}-dropdownmenu`) return;
                        let chosen = newInteraction.values[0]
                        changeEmbed = embeds[options.indexOf(chosen)]
                        if (chosen == 'index') {
                            changeEmbed = embed;
                        }
                        await newInteraction.update({ embeds: [changeEmbed], components: [row] })
                    })

                    collector.on('end', () => {
                        interaction.editReply({ embeds: [changeEmbed], components: [] });
                    })
                })
                .catch(error => {
                    if (String(error).includes('404')) return interaction.reply('Could not find player!')
                    else interaction.replied ? interaction.editReply(String(error)) : interaction.reply(String(error))
                })
        }
    },
};