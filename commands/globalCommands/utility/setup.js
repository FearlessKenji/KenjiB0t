const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const { Servers } = require('../../../database/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Configure server settings.')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Channel for notifications.')
				.setRequired(true),
		)
		.addRoleOption(option =>
			option.setName('main-role')
				.setDescription('Notification role for a single channel. Typically your own.')
				.setRequired(true),
		)
		.addRoleOption(option =>
			option.setName('other-role')
				.setDescription('Notification role for standard channels.'),
		)
		.setDefaultMemberPermissions(0) // Restrict to admins or bot owner
		.setContexts(InteractionContextType.Guild), // Guild only

	async execute(interaction) {
		const channelId = interaction.options.getString('channel');
		const mainRoleId = interaction.options.getString('main-role');
		const otherRoleId = interaction.options.getString('other-role');

		try {
			await Servers.upsert({ guildId: interaction.guild.id, channelId: channelId, mainRoleId: mainRoleId, otherRoleId: otherRoleId });
			await interaction.reply({ content: 'Server settings updated successfully.', flags: MessageFlags.Ephemeral });
		}
		catch (error) {
			console.error('Failed to update server settings:', error);
			await interaction.reply({ content: 'Failed to update server settings.', flags: MessageFlags.Ephemeral });
		}
	},
};
