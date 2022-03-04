const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cocToken } = require('../../data/config/config.json');
const options = require('../../data/config/options.json');
const Discord = require('discord.js');
const got = require('got');
const { getDelay, getApi } = require('../../funcs');

module.exports = {
    detailedDescription: "players",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('players')
        .setDescription('players'),
    async execute(interaction) {
        let res = await getApi('coc', `https://api.clashofclans.com/v1/clans/%232Y8U8GR02`)
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
        interaction.reply('Performing checks')
            .then(async () => {
                for (let i = 0; i < res.members; i++) {
                    let embed = new Discord.MessageEmbed()
                        .setAuthor({ name: res.memberList[i].name, iconURL: res.memberList[i].league.iconUrls.medium })
                        .setDescription(`Role: ${res.memberList[i].role == "leader" ? "Leader" : res.memberList[i].role == "coLeader" ? "Co-Leader" : res.memberList[i].role == "admin" ? "Elder" : "Member"}\nTrophies: ${res.memberList[i].trophies}`)
                        .setColor(color)
                    channel.send({ embeds: [embed], components: [row] })
                    await getDelay(1000)
                }
            })
            .catch(error => {
                console.log("error ", error)
            })
    },
};