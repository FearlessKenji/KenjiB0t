/*
 * equivalent to: CREATE TABLE channels (
 * id INTEGER PRIMARY KEY AUTOINCREMENT,
 * channelName VARCHAR(255) NOT NULL,
 * discordUrl VARCHAR(255),
 * isSelf BOOLEAN NOT NULL DEFAULT false,
 * streamId VARCHAR(255),
 * messageId VARCHAR(255) UNIQUE,
 * guildId VARCHAR(255) NOT NULL,
 * UNIQUE (channelName, guildId)
 * );
 */

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('channels', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		channelName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		discordUrl: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		isSelf: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: false,
		},
		streamId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		messageId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true, // Ensure globally unique
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		timestamps: false,
		indexes: [
			{
				unique: true,
				fields: ['channelName', 'guildId'], // Composite unique index
				name: 'compositeIndex',
			},
		],
	});
};
