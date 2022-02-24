const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, cocToken } = require('../../data/config/config.json');
const options = require('../../data/config/options.json');
const Discord = require('discord.js');
const got = require('got');

module.exports = {
    detailedDescription: "war",
    category: "Info",
    data: new SlashCommandBuilder()
        .setName('war')
        .setDescription('war'),
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

        let res = await getApi(`https://api.clashofclans.com/v1/clans/%232Y8U8GR02/currentwar`)
        console.log(res.clan.members)
    },
};