const Sequelize = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: dbPath,
});

// Import models
const Servers = require('./models/servers.js')(sequelize, Sequelize.DataTypes);
const Channels = require('./models/channels.js')(sequelize, Sequelize.DataTypes);
const Subs = require('./models/subs.js')(sequelize, Sequelize.DataTypes);

// Associations
Channels.belongsTo(Servers, { foreignKey: 'guildId', targetKey: 'guildId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Subs.belongsTo(Servers, { foreignKey: 'guildId', targetKey: 'guildId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Servers.hasMany(Channels, { foreignKey: 'guildId', sourceKey: 'guildId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Servers.hasMany(Subs, { foreignKey: 'guildId', sourceKey: 'guildId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = { sequelize, Servers, Channels, Subs };