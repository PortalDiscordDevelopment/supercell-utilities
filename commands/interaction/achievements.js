const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cooldown } = require('../../data/config/config.json');
const Discord = require('discord.js');
const { getApi, getDatabase } = require('../../funcs');
const options = require('../../data/config/options.json');

module.exports = {
    detailedDescription: "achievements",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('achievements')
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
        interaction.deferReply();
        let game = interaction.options.getString('game');
        let tag = interaction.options.getString('tag');
        let user = interaction.options.getUser('user') || interaction.user;
        tag = tag?.replace('#', "");
        let response;
        let row = new Discord.MessageActionRow();
        let comp = new Discord.MessageSelectMenu()
            .setCustomId(`${interaction.id}-menu`)
            .setPlaceholder('Choose an account')
            .setMaxValues(1)
            .setMinValues(1)
        row.addComponents(comp.addOptions({ label: 'Accounts overview', description: 'Full accounts page', value: 'index' }))
        let embeds = [];
        let embed;
        if (tag) {
            embed = new Discord.MessageEmbed()
                .setColor(color)
                .setTimestamp()

            if (game == 'coc') response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`);
            if (game == 'cr') response = await getApi(game, `https://api.clashroyale.com/v1/players/%23${tag}`);
            if (game == 'bs') response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`);
        }
        else {
            let data = await getDatabase().users.findOne({ where: { name: user.id } });
            if (!data) return await interaction.user.id == user.id ? interaction.reply({ content: 'You have not saved any accounts yet, please register an account with `/config` or specify a tag.' }) : interaction.reply({ content: 'This user has no accounts linked to their account.' })
            let accounts;
            let homeStr = "**Home Village**\n\n",
                builderStr = "",
                description = "";
            if (game == 'coc') {
                accounts = data.cocAccounts.split(",");
                description += `${user.username} has ${accounts.length} account(s)\n\n`
                for (let i = 0; i < accounts.length; i++) {
                    homeStr = "**Home Village**\n\n";
                    builderStr = "";
                    response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${accounts[i]}`)
                    comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Town Hall: ${response.townHallLevel}`, value: options[i] })

                    response.achievements.map(achievement => {
                        if (achievement.name == "Keep Your Account Safe!") return;
                        if (achievement.village == 'home') {
                            homeStr += `${(achievement.stars == 3 || achievement.value >= achievement.target) ? `⭐⭐⭐` : achievement.stars == 2 ? `⭐⭐` : achievement.stars == 1 ? `⭐` : ""} **${achievement.name}**\n> ${achievement.info} ${(achievement.stars == 3 || achievement.value >= achievement.target) ? "" : (`\n> Progress: ` + achievement.value + ` | ` + achievement.target)}\n`
                        }
                        if (achievement.village == 'builderBase') {
                            builderStr += `${(achievement.stars == 3 || achievement.value >= achievement.target) ? `⭐⭐⭐` : achievement.stars == 2 ? `⭐⭐` : achievement.stars == 1 ? `⭐` : ""} **${achievement.name}**\n> ${achievement.info} ${(achievement.stars == 3 || achievement.value >= achievement.target) ? "" : (`\n> Progress: ` + achievement.value + ` | ` + achievement.target)}\n`
                        }
                    })
                    embed = new Discord.MessageEmbed()
                        .setDescription(homeStr)
                        .addField('Builder Base', builderStr)
                        .setColor(color)
                        .setTitle(`${response.tag} (${response.name})`)
                    embeds.push(embed)
                    description += `${i + 1}. ${response.name} | Level: ${response.expLevel} | ${(homeStr.match(/⭐/g)?.length || 0) + (builderStr.match(/⭐/g)?.length || 0)}⭐\n`;
                }
            }

            if (game == 'cr') {
                accounts = data.crAccounts.split(",");
                description += `${user.username} has ${accounts.length} account(s)\n\n`
                for (let i = 0; i < accounts.length; i++) {
                    homeStr = "";
                    response = await getApi(game, `https://api.clashroyale.com/v1/players/%23${accounts[i]}`)
                    comp.addOptions({ label: response.name, description: `Level: ${response.expLevel}`, value: options[i] })

                    response.achievements.map(achievement => {
                        homeStr += `${(achievement.stars == 3 || achievement.value >= achievement.target) ? `⭐⭐⭐` : achievement.stars == 2 ? `⭐⭐` : achievement.stars == 1 ? `⭐` : ""} **${achievement.name}**\n> ${achievement.info} ${(achievement.stars == 3 || achievement.value >= achievement.target) ? "" : (`\n> Progress: ` + achievement.value + ` | ` + achievement.target)}\n`
                    })

                    embed = new Discord.MessageEmbed()
                        .setDescription(homeStr)
                        .setColor(color)
                        .setTitle(`${response.tag} (${response.name})`)
                    embeds.push(embed)
                    description += `${i + 1}. ${response.name} | Level: ${response.expLevel} | ${homeStr.match(/⭐/g).length}⭐\n`;
                }
            }

            let indexEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `${user.username}'s accounts`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
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