/*
 * equivalent to: CREATE TABLE subs(
 * id INTEGER PRIMARYKEY AUTOINCREMENT,
 * name VARCHAR(255) NOT NULL,
 * postId VARCHAR(255) UNIQUE,
 * messageId VARCHAR(255) UNIQUE,
 * serverId VARCHAR(255) NOT NULL
 * );
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('subs', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		SubName: {
			type: DataTypes.STRING,
			allowNull: false,
            unique: true
		},
		postId: {
			type: DataTypes.STRING,
			allowNull: true,
            unique: 'subIndex', // Ensure unique within the same guildId
		},
		discord_message_id: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true, // Ensure globally unique
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'subIndex', // Ensure unique within the same guildId
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'subIndex', // Ensure unique within the same guildId
		},
	}, {
		timestamps: false,
		indexes: [
			{
				unique: true,
				fields: ['postId', 'guildId'], // Composite unique index
				name: 'subIndex',
			},
		],
	});
};
