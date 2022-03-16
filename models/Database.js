const Sequelize = require('sequelize');

class Database {
    constructor() {
        const sequelize = new Sequelize('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            storage: 'data/database/database.sqlite'
        });

        const Guilds = sequelize.define('guilds', {
            name: {
                type: Sequelize.STRING,
                unique: true
            },
            mainCocClan: Sequelize.STRING,
            sisterCocClans: Sequelize.ARRAY(Sequelize.TEXT),
            mainCrClan: Sequelize.STRING,
            sisterCrClans: Sequelize.ARRAY(Sequelize.TEXT),
            mainBsClub: Sequelize.STRING,
            sisterBsClubs: Sequelize.ARRAY(Sequelize.TEXT)
        })

        const Users = sequelize.define('users', {
            name: {
                type: Sequelize.STRING,
                unique: true
            },
            cocAccounts: Sequelize.ARRAY(Sequelize.TEXT),
            crAccounts: Sequelize.ARRAY(Sequelize.TEXT),
            bsAccounts: Sequelize.ARRAY(Sequelize.TEXT)
        })

        return { guilds: Guilds, users: Users }
    }

    sync(database) {
        return Database.parse(database).sync()
    }
}

module.exports = { Database }