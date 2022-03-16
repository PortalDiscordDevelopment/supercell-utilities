const { global } = require('../data/config/config.json');
const { getRandomNumber } = require('../funcs.js');
const games = [
    "Clash of Clans",
    "Clash Royale",
    "Brawl Stars"
]
module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        function presence() {
            client.user.setPresence({
                activities: [{
                    type: "PLAYING",
                    name: games[getRandomNumber(games.length)]
                }],
                status: "idle"
            })
        }
        presence()
        setInterval(() => {
            presence()
        }, 300000)
    }
}