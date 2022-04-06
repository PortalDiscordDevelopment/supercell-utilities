const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');
const { getApi, getDatabase, getDelay } = require('../../funcs');

module.exports = {
    detailedDescription: "members",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('members')
        .setDescription('members')
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
        ),
    async execute(interaction) {
        let game = interaction.options.getString('game');
        let data = await getDatabase().guilds.findOne({ where: { name: interaction.guild.id } });
        if (!data) return await interaction.reply(`This server has no clan linked, use \`/config game: ${game == 'coc' ? "Clash of Clans" : game == "cr" ? "Clash Royale" : "Brawl Stars"} set-clan: <clan tag>\` to setup your clan.`);
        let response;
        let channel;
        if (!data.cocClan || !data.cocMembers) return await interaction.reply(`You need to setup both the main clan and the members channel to use this command.`)
        if (game == 'coc') {
            response = await getApi(game, `https://api.clashofclans.com/v1/clans/%23${data.cocClan}`)
            channel = data.cocMembers
            interaction.reply({ content: `Refreshing memberlist in <#${channel}>.` })
            channel = await interaction.client.channels.fetch(channel);
            try {
                channel.bulkDelete(100)
            }
            catch (error) {
                interaction.channel.send(`Previous messages in ${channel} could not be deleted.`)
            }
            finally {
                response.memberList.map(async member => {
                    let ratio = Math.round(member.donations / member.donationsReceived * 100) / 100;
                    let embed = new Discord.MessageEmbed()
                        .setAuthor({ name: member.name })
                        .setTitle(member.tag)
                        .addField('Level', String(member.expLevel), true)
                        .addField('Role', member.role == 'leader' ? 'Leader' : member.role == 'coLeader' ? 'Co-Leader' : member.role == 'admin' ? 'Elder' : "Member", true)
                        .addField('Trophies', `Home Village: ${member.trophies}\nBuilder Base: ${member.versusTrophies}`, true)
                        .addField('Rank', `${member.clanRank} ${member.clanRank < member.previousClanRank ? '⬆️' : member.clanRank == member.previousClanRank ? '✅' : '⬇️'} from ${member.previousClanRank}`, true)
                        .addField('Donations', `Donations Given: ${member.donations}\nDonations received: ${member.donationsReceived}\nRatio: ${(isNaN(ratio) || ratio == 'Infinity') ? 0 : ratio}`, true)
                        .setThumbnail(member.league.iconUrls.medium)
                        .setColor(color)
                    await getDelay(1000)
                    await channel.send({ embeds: [embed] })
                })
            }
        }
    },
};