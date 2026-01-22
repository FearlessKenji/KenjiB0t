const Sequelize = require('sequelize');
const { guildId } = require('../config.json');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Channels = require('./models/channels.js')(sequelize, Sequelize.DataTypes);
const Servers = require('./models/servers.js')(sequelize, Sequelize.DataTypes);
const Subreddits = require('./models/subs.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const channel = [
		Channels.upsert({ ChannelName: 'themagicdragin', DiscordServer: 'https://discord.gg/388R444EKw', guildId: guildId }),
		Channels.upsert({ ChannelName: 'chzplzz', DiscordServer: 'https://discord.gg/KtbsvvBWyd', guildId: guildId }),
		Channels.upsert({ ChannelName: 'pasbal', DiscordServer: 'https://discord.gg/mZP9x6CEVe', guildId: guildId }),
		Channels.upsert({ ChannelName: 'piratesoftware', DiscordServer: 'https://discord.gg/piratesoftware', guildId: guildId }),
		Channels.upsert({ ChannelName: 'mediocremischief', DiscordServer: 'https://discord.gg/R5TxaZtCm', guildId: guildId })
	];
	const server = [
		Servers.upsert({ guildId: guildId, channelId: '872496220755591188', mainRoleId: '873383420573646939', otherRoleId: '873788813397360650' }),
	];

	const sub = [
		Subreddits.upsert({ SubName: 'evangelionmemes', channelId: '1463359516283375843', guildId: guildId }),
		Subreddits.upsert({ SubName: 'netorase', channelId: '1463359516283375843', guildId: guildId }),
	];

	await Promise.all(channel, server, sub);
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);