const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cocToken } = require('../../data/config/config.json');
const options = require('../../data/config/options.json');
const Discord = require('discord.js');
const got = require('got');

module.exports = {
    detailedDescription: "players",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('players')
        .setDescription('players'),
    async execute(interaction) {
        async function getApi(link) {
            let response = await got.get({
                url: link,
                headers: {
                    'Accept': "application/json",
                    'Authorization': "Bearer " + cocToken
                }
            });
            return JSON.parse(response.body);
        }

        let res = await getApi(`https://api.clashofclans.com/v1/clans/%232Y8U8GR02`)
        console.log(res)
        let channel, messages, messageArray = [];
        channel = await interaction.client.channels.fetch('942017668817510440')
        await channel.bulkDelete(50)
        let row = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton()
                .setCustomId('down')
                .setLabel('Demote')
                .setStyle('DANGER')
            )
            .addComponents(new Discord.MessageButton()
                .setCustomId('up')
                .setLabel('Promote')
                .setStyle('SUCCESS')
            )
        for (let i = 0; i < res.members; i++) {
            let embed = new Discord.MessageEmbed()
                .setAuthor({ name: res.memberList[i].name, iconURL: res.memberList[i].league.iconUrls.medium })
                .setDescription(`Role: ${res.memberList[i].role == "leader" ? "Leader" : res.memberList[i].role == "coLeader" ? "Co-Leader" : res.memberList[i].role == "admin" ? "Elder" : "Member"}\nTrophies: ${res.memberList[i].trophies}`)
                .setColor(color)
            channel.send({ embeds: [embed], components: [row] })

        }
        interaction.reply('Performing checks')
            .catch(error => {
                console.log(error)
            })

    },
};