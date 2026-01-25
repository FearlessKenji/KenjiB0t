/*
 * equivalent to: CREATE TABLE servers (
 * guildId VARCHAR(255) PRIMARY KEY,
 * selfChannelId VARCHAR(255) UNIQUE,
 * affiliateChannelId VARCHAR(255) UNIQUE,
 * selfRoleId VARCHAR(255) UNIQUE,
 * affiliateRoleId VARCHAR(255) UNIQUE
 * );
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('servers', {
		guildId: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		selfChannelId: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: true
		},
		affiliateChannelId: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: true
		},
		selfRoleId: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: true
		},
		affiliateRoleId: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: true
		},
	},
		{
			timestamps: false,
		});
};