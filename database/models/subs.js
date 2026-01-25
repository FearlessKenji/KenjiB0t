/*
 * Equivalent to:
 *
 * CREATE TABLE subs (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *
 *   subName    VARCHAR(255) NOT NULL,
 *   postId     VARCHAR(255),
 *   messageId  VARCHAR(255) UNIQUE,
 *   channelId  VARCHAR(255) NOT NULL UNIQUE,
 *   guildId    VARCHAR(255) NOT NULL,
 *
 *   -- Constraints
 *   UNIQUE (subName, guildId)
 * );
 *
 * Notes:
 * - Each row represents a subreddit subscription within a guild
 * - subName must be unique per guild
 * - channelId and messageId are globally unique
 * - postId may be NULL and is not unique
 * - No timestamps are stored
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('subs', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		subName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		postId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		messageId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true, // globally unique
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false,
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
				fields: ['subName', 'guildId'],
				name: 'subIndex',
			},
		],
	});
};
