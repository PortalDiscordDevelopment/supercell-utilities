const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');
const { getDatabase, getApi } = require('../../funcs');

module.exports = {
    detailedDescription: "profile",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile'),
    async execute(interaction) {
        interaction.deferReply();
        let user = await getDatabase().users.findOne({ where: { name: interaction.user.id } });

        let cocField = "";
        let crField = "";
        let bsField = "";

        let cocAccounts = user.cocAccounts.split(',')
        if (cocAccounts[0] == '') cocAccounts = cocAccounts.slice(1)
        for (let i = 0; i < cocAccounts.length; i++) {
            response = await getApi('coc', `https://api.clashofclans.com/v1/players/%23${cocAccounts[i]}`)
            cocField += `${response.name} | Town Hall: ${response.townHallLevel}\n`;
        }
        let crAccounts = user.crAccounts.split(',')
        if (crAccounts[0] == '') crAccounts = crAccounts.slice(1)
        for (let i = 0; i < crAccounts.length; i++) {
            response = await getApi('cr', `https://api.clashroyale.com/v1/players/%23${crAccounts[i]}`)
            crField += `${response.name} | Level: ${response.expLevel}\n`;
        }
        let bsAccounts = user.bsAccounts.split(',')
        if (bsAccounts[0] == '') bsAccounts = bsAccounts.slice(1)
        for (let i = 0; i < bsAccounts.length; i++) {
            response = await getApi('bs', `https://api.brawlstars.com/v1/players/%23${bsAccounts[i]}`)
            bsField += `${response.name} | ${response.expLevel}\n`;
        }
        let embed = new Discord.MessageEmbed()
            .setAuthor({ name: `${interaction.user.username}'s profile`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
            .addField('Clash of Clans', cocField || "None", true)
            .addField('Clash Royale', crField || "None", true)
            .addField('Brawl Stars', bsField || "None", true)
            .setColor(color)

        interaction.editReply({ embeds: [embed] })
    },
};