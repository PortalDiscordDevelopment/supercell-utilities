const fs = require("fs");
const config = require('./data/config/config.json')
const Discord = require('discord.js');
const got = require('got')
const moment = require('moment');
const Sequelize = require('sequelize')
const hasteURLs = [
    "https://hst.sh",
    "https://hastebin.com",
    "https://haste.clicksminuteper.net",
    "https://haste.tyman.tech"
]

function getRandomNumber(min, max) {
    if (max == undefined) {
        max = min
        min = 0
    }
    let random = Math.floor(Math.random() * Math.floor(max) + min);
    return random;
}

function getDatabase() {
    const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'data/database/database.sqlite'
    });

    // const Guilds = sequelize.define('guilds', {
    //     name: Sequelize.STRING
    // })

    const Users = sequelize.define('users', {
        name: {
            type: Sequelize.STRING,
            unique: true
        },
        accounts: Sequelize.ARRAY(Sequelize.TEXT)
    })

    return { users: Users }
}

module.exports = {
    async getApi(link) {
        let response = await got.get({
            url: link,
            headers: {
                'Accept': "application/json",
                'Authorization': "Bearer " + config.cocToken
            }
        });
        return JSON.parse(response.body);
    },
    getDatabase: getDatabase,
    getTime(date) {
        return moment(Number(date)).format("H:mm:ss");
    },
    getRandomNumber: getRandomNumber,
    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '';
        for (let i = 0; i < 6; i++) {
            color += letters[getRandomNumber(16)];
        }
        return color;
    },
    getPresence(client, type, name, status) {
        client.user.setPresence({
            status: String(status),
            activities: [{
                type: String(type).toUpperCase(),
                name: String(name),
                url: "https://www.youtube.com/watch?v=ciqUEV9F0OY&list=RDRbslF7GISf0&index=28"
            }],

        })
    },
    getArray(args) {
        let tempArray = [];
        for (const data in destiny) {
            if (destiny[data].tag == args) {
                tempArray.push(destiny[data].name)
            }
            else continue;
        }
        return tempArray;
    },
    getRandomUser(client) {
        let users = client.users.cache;
        let usersArray = [];
        users.forEach(user => {
            if (user.bot) return;
            else {
                usersArray.push(user.username)
            }
        })
        let randomUser = usersArray[getRandomNumber(usersArray.length)];
        return randomUser;
    },
    getRandomEmojis(args) {
        let choices = new Discord.Collection()
        let choicesLeft = message.guild.emojis.cache.filter(e => e.animated)
        let curChoice = "";
        for (let i = 0; i < Number(args[0]); i++) {
            curChoice = choicesLeft.randomKey()
            choices.set(curChoice, choicesLeft.get(curChoice))
            choicesLeft.delete(curChoice)
        }
        return choices
    },
    getShuffleArray(array) {
        let shuffled = [];
        array = Array.from(array);
        while (array.length > 0) {
            shuffled.push(array.splice(randomNumber(array.length), 1)[0]);
        }
        return shuffled;
    },
    getUptime(client) {
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let uptime = `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
        let noSecUptime = `${days}d, ${hours}h, ${minutes}m`;
        return { uptime: uptime, noSecUptime: noSecUptime };
    },
    async getHaste(text) {
        for (const url of hasteURLs) {
            try {
                const resp = await got.post(url + "/documents", {
                    body: text
                }).json()
                return `${url}/${resp.key}`
            } catch (e) {
                console.log(e)
                continue
            }
        }
        throw new Error("Haste failure")
    },
    getCapitalize(name) {
        name = name.toLowerCase();
        return name.charAt(0).toUpperCase() + name.slice(1)
    },
    getCommandError(action, error) {
        function getErrorCode() {
            let code = 0
            if (error.name == 'TypeError') return code = 1;
            if (error.name == 'DiscordAPIError') return code = 3;
            if (error.name == 'ReferenceError') return code = 2;
            if (error.code != undefined) return error.code;
            else return code;
        }
        let channels = config.LogsChannel;
        let embed = new Discord.MessageEmbed()
            .setTitle("ERROR")
            .setDescription(`\`\`\`js\n${error.stack}\`\`\``)
            .setColor(config.color)
            .addField('Extra info', `Server: ${action.guild.name}\nChannel: ${action.channel}\nUser: ${action.author == undefined ? action.user.tag : action.author.tag}\nCommand: ${String(action).length < 200 ? action : String(action).slice(200)}`, true)
        action.client.channels.fetch(channels)
            .then(channel => {
                channel.send({ embeds: [embed] })
                try {
                    let errorEmbed = new Discord.MessageEmbed()
                        .setTitle('Something went wrong')
                        .setColor(config.color)
                        .setDescription(`Something went wrong with \`${action.commandName == undefined ? action.content.slice(1).split(/ +/)[0] : action.commandName}\`. This error got logged in my [support server](${config.invite}).\n\nCode: ${getErrorCode()}`)
                    action.reply({ embeds: [errorEmbed], ephemeral: true })
                }
                catch { }
            }).catch((err) => {
                console.error(err, error)
            })
        action.client.channels.fetch(channels)
            .then(channel => {
                channel.send({ embeds: [embed] })
            }).catch((err) => {
                console.error(err, error)
            })
    },
    getDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    getValidURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    }
};