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
        let data = await getDatabase().users.findOne({ where: { name: user.id } });
        if (!data) return await interaction.user.id == user.id ? interaction.reply({ content: 'You have not saved any accounts yet, please register an account with `/config` or specify a tag.' }) : interaction.reply({ content: 'This user has no accounts linked to their account.' })
        let embeds = [];
        let embed;
        let title = "";
        let description = "";
        if (tag) {
            embed = new Discord.MessageEmbed()
                .setColor(color)
                .setTimestamp()

            if (game == 'coc') response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`);
            if (game == 'cr') response = await getApi(game, `https://api.clashroyale.com/v1/players/%23${tag}`);
            if (game == 'bs') response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${tag}`);

            if (response.tag) {
                // Combined
                title += response.tag
            }

            if (response.name && response.expLevel) {
                // Combined
                description += `**General Info**\nname: ${response.name}\nLevel: ${response.expLevel}`
            }

            if (response.trophies && response.bestTrophies && response.townHallLevel && response.townHallWeaponLevel && response.warStars) {
                // Clash of Clans
                embed.addField('Home Village', `Town Hall: ${response.townHallWeaponLevel ? response.townHallLevel + " | " + response.townHallWeaponLevel : response.townHallLevel}\nTrophies: ${response.trophies} | ${response.bestTrophies}\nWar Stars: ${response.warStars}`, true)
            }

            if (response.builderHallLevel && response.versusTrophies && response.bestVersusTrophies) {
                // Clash of Clans
                embed.addField('Builder Base', `Builder Hall: ${response.builderHallLevel}\nTrophies: ${response.versusTrophies} | ${response.bestVersusTrophies}`, true)
            }

            if (response.trophies && response.bestTrophies && response.wins && response.losses) {
                // Clash Royale
                description += `\nTrophies: ${response.trophies} | ${response.bestTrophies}\nWins: ${response.wins} | Losses ${response.losses} (W/L: ${Math.round(response.wins / response.losses * 100) / 100})`
            }

            if (response && response.trophies && response.highestTrophies && response.highestPowerPlayPoints && response['3vs3Victories'] && response.soloVictories && response.duoVictories && response.bestRoboRumbleTime) {
                description += `\nTrophies: ${response.trophies} | ${response.highestTrophies}\nBest Power Play Points: ${response.highestPowerPlayPoints}\n3vs3 Wins: ${response['3vs3Victories']}\nSolo Wins: ${response.soloVictories}\nDuo Wins: ${response.duoVictories}\nBest Robo Rumble Time: ${response?.bestRoboRumbleTime}\nBest Time As Big Brawler: ${response?.bestTimeAsBigBrawler}`
            }

            if (response.currentFavouriteCard) {
                // Clash Royale
                embed.setThumbnail(response?.currentFavouriteCard?.iconUrls?.medium)
            }

            if (game == "coc" && (response.clan || response.league)) {
                // Clash of Clans
                if (response?.league?.iconUrls?.medium) embed.setThumbnail(response.league.iconUrls.medium);
                if (response?.clan?.badgeUrls?.medium) embed.setThumbnail(response.clan.badgeUrls.medium);
            }

            if (response.attackWins && response.defenseWins && response.donations && response.donationsReceived) {
                embed.addField('Current Season', `Successful attacks: ${response.attackWins}\nSuccessful Defenses: ${response.defenseWins}\nDonations Given: ${response.donations}\nDonations Received: ${response.donationsReceived}\nDonate ratio: ${Math.round(response.donations / response.donationsReceived * 100) / 100}`)
            }

            if (response.clan && response.role) {
                embed.addField('Clan', `Tag: ${response.clan.tag}\nName: ${response.clan.name}${response.clan?.clanLevel ? `\nLevel: ${response.clan.clanLevel}` : ""}\nYour rank: ${response.role}`)
            }

            if (response.club) {
                embed.addField('Club', `Tag: ${response.club.tag}\nName: ${response.club.name}`)
            }

            embed
                .setTitle(title)
                .setDescription(description)

            return await interaction.editReply({ embeds: [embed] });
        }

        if (game == 'coc') {
            let accounts = data.cocAccounts.split(',');
            description = `${user.username} has ${accounts.length} account(s).\n\n`
            for (let i = 0; i < accounts.length; i++) {
                response = await getApi(game, `https://api.clashofclans.com/v1/players/%23${accounts[i]}`)
                comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Town Hall: ${response.townHallLevel}`, value: options[i] })
                embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(response.tag)
                    .setDescription(`Name: ${response.name}\nLevel: ${response.expLevel}`)
                    .addField('Home Village', `Town Hall: ${response.townHallWeaponLevel ? response.townHallLevel + " | " + response.townHallWeaponLevel : response.townHallLevel}\nTrophies: ${response.trophies} | ${response.bestTrophies}\nWar Stars: ${response.warStars}`, true)
                    .addField('Builder Base', response.builderHallLevel ? `Builder Hall: ${response.builderHallLevel}\nTrophies: ${response.versusTrophies} | ${response.bestVersusTrophies}` : "Builder hall not build yet.", true)
                if (response.attackWins && response.defenseWins && response.donations && response.donationsReceived) {
                    embed.addField('Current Season', `Successful attacks: ${response.attackWins}\nSuccessful Defenses: ${response.defenseWins}\nDonations Given: ${response.donations}\nDonations Received: ${response.donationsReceived}\nDonate ratio: ${Math.round(response.donations / response.donationsReceived * 100) / 100}`)
                }
                if (response.clan && response.role) {
                    embed.addField('Clan', `Tag: ${response.clan.tag}\nName: ${response.clan.name}\nLevel: ${response.clan.clanLevel}\nYour rank: ${response.role == "leader" ? "Leader" : response.role == "coLeader" ? "Co-Leader" : response.role == "admin" ? "Elder" : "Member"}`)
                }
                if (response?.league?.iconUrls?.medium) embed.setThumbnail(response.league.iconUrls.medium);
                if (response?.clan?.badgeUrls?.medium) embed.setThumbnail(response.clan.badgeUrls.medium);
                embeds.push(embed)
                description += `${i + 1}. ${response.name} | Town Hall: ${response.townHallLevel}\n`;
            }
        }

        if (game == 'cr') {
            let accounts = data.crAccounts.split(',');
            description = `${user.username} has ${accounts.length} account(s).\n\n`
            for (let i = 0; i < accounts.length; i++) {
                response = await getApi(game, `https://api.clashroyale.com/v1/players/%23${accounts[i]}`)
                comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Cards: ${response.cards.length}`, value: options[i] })
                embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(response.tag)
                    .setDescription(`Name: ${response.name}\nLevel: ${response.expLevel}\nTrophies: ${response.trophies} | ${response.bestTrophies}\nWins: ${response.wins} | Losses ${response.losses} (W/L: ${Math.round(response.wins / response.losses * 100) / 100})`)

                if (response.currentFavouriteCard) embed.setThumbnail(response?.currentFavouriteCard?.iconUrls?.medium)
                embeds.push(embed)
                description += `${i + 1}. ${response.name} | Level: ${response.expLevel}\n`;
            }
        }

        if (game == 'bs') {
            let accounts = data.bsAccounts.split(',');
            description = `${user.username} has ${accounts.length} account(s).\n\n`
            for (let i = 0; i < accounts.length; i++) {
                response = await getApi(game, `https://api.brawlstars.com/v1/players/%23${accounts[i]}`)
                comp.addOptions({ label: response.name, description: `Level: ${response.expLevel} | Brawlers: ${response.brawlers.length}`, value: options[i] })
                embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(response.tag)
                    .setDescription(`Name: ${response.name}\nLevel: ${response.expLevel}\nTrophies: ${response.trophies} | ${response.highestTrophies}\nBest Power Play Points: ${response.highestPowerPlayPoints}\n3vs3 Wins: ${response['3vs3Victories']}\nSolo Wins: ${response.soloVictories}\nDuo Wins: ${response.duoVictories}\nBest Robo Rumble Time: ${response?.bestRoboRumbleTime}\nBest Time As Big Brawler: ${response?.bestTimeAsBigBrawler}`)

                if (response.club) {
                    embed.addField('Club', `Tag: ${response.club.tag}\nName: ${response.club.name}`)
                }
                embeds.push(embed)
                description += `${i + 1}. ${response.name} | Level: ${response.expLevel}\n`;
            }
        }
        let indexEmbed = new Discord.MessageEmbed()
            .setAuthor({ name: `${user.username}'s accounts`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .setColor(color)
            .setTimestamp()
            .setDescription(description)

        let changeEmbed = indexEmbed;
        interaction.editReply({ embeds: [changeEmbed], components: [row] })

        interaction.channel.createMessageComponentCollector({ time: 60000 })

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
    },
};