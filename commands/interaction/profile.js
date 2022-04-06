const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../data/config/config.json');
const Discord = require('discord.js');
const { getDatabase, getApi } = require('../../funcs');

module.exports = {
    detailedDescription: "profile",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('user')
        ),
    async execute(interaction) {
        let user = interaction.options.getUser('user') || interaction.user;
        let userData = await getDatabase().users.findOne({ where: { name: user.id } });

        if (!userData) {
            return await interaction.reply('This user has no registered accounts!')
        }

        interaction.deferReply();

        let cocField = "";
        let crField = "";
        let bsField = "";
        let newColor = null;

        let cocAccounts = userData.cocAccounts.split(',')
        if (cocAccounts[0] == '') cocAccounts = cocAccounts.slice(1)
        for (let i = 0; i < cocAccounts.length; i++) {
            response = await getApi('coc', `https://api.clashofclans.com/v1/players/%23${cocAccounts[i]}`)
            cocField += `${response.name} | Town Hall: ${response.townHallLevel}\n`;
        }
        let crAccounts = userData.crAccounts.split(',')
        if (crAccounts[0] == '') crAccounts = crAccounts.slice(1)
        for (let i = 0; i < crAccounts.length; i++) {
            response = await getApi('cr', `https://api.clashroyale.com/v1/players/%23${crAccounts[i]}`)
            crField += `${response.name} | Level: ${response.expLevel}\n`;
        }
        let bsAccounts = userData.bsAccounts.split(',')
        if (bsAccounts[0] == '') bsAccounts = bsAccounts.slice(1)
        response = await getApi('bs', `https://api.brawlstars.com/v1/players/%23${bsAccounts[0]}`)
        newColor = response.nameColor.slice(4, 10);
        for (let i = 0; i < bsAccounts.length; i++) {
            response = await getApi('bs', `https://api.brawlstars.com/v1/players/%23${bsAccounts[i]}`)
            bsField += `${response.name} | ${response.expLevel}\n`;
        }

        let embed = new Discord.MessageEmbed()
            .setAuthor({ name: `${user.username}'s profile`, iconURL: user.avatarURL({ dynamic: true }) })
            .setDescription(`Below you can find the accounts ${user} has.\nLanguage: ${getLanguage(userData.language)}`)
            .addField('Clash of Clans', cocField || "None", true)
            .addField('Clash Royale', crField || "None", true)
            .addField('Brawl Stars', bsField || "None", true)
            .setColor(newColor || color)

        interaction.editReply({ embeds: [embed] })

        function getLanguage(lang) {
            if (lang == "en-US") lang = "English (United States)"
            if (lang == "en-UK") lang = "English (United Kingdom)"
            if (lang == "en-AU") lang = "English (Australia)"
            if (lang == "fr") lang = "French"
            if (lang == "nl") lang = "Dutch"
            if (lang == "de") lang = "German"
            if (lang == "ru") lang = "Russian"
            return lang;
        }
    },
};

