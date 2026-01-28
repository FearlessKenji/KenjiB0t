const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Servers, Channels } = require('../../../database/dbObjects.js');
const { writeLog } = require('../../../modules/writeLog.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('Edit channel list for affiliates.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a Twitch user.')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Twitch username.')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('discord')
						.setDescription('Discord invite URL for the channel.'),
				)
				.addBooleanOption(option =>
					option.setName('self')
						.setDescription('Set true if this is your own stream.'),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a Twitch user from the database.')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Twitch username to delete.')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all Twitch channels for this server.'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configure Twitch notification settings.')
				.addChannelOption(option =>
					option.setName('self-channel')
						.setDescription('Discord channel for notifications when a specific channel goes live. Typically your own.')
						.setRequired(true),
				)
				.addChannelOption(option =>
					option.setName('affiliate-channel')
						.setDescription('Discord channel for notifications when people you like go live.')
						.setRequired(true),
				)
				.addRoleOption(option =>
					option.setName('self-role')
						.setDescription('Notification role for when a specific channel goes live. Typically your own.')
						.setRequired(true),
				)
				.addRoleOption(option =>
					option.setName('affiliate-role')
						.setDescription('Notification role for when people you like go live.'),
				),
		),

	async execute(interaction) {
		const affiliateChannelId = interaction.options.getChannel('affiliate-channel')?.id || null;
		const affiliateRoleId = interaction.options.getRole('affiliate-role')?.id || null;
		const selfChannelId = interaction.options.getChannel('self-channel')?.id || null;
		const selfRoleId = interaction.options.getRole('self-role')?.id || null;
		const subcommand = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;

		if (subcommand === 'setup') {
			try {
				await Servers.upsert({
					guildId,
					selfChannelId,
					affiliateChannelId,
					selfRoleId,
					affiliateRoleId,
				});
				await interaction.reply({
					content: `Server settings updated successfully.
					## **When you go live:**
					-Role:		<@${selfRoleId}>
					-Channel:	<#${selfChannelId}>
					## When someone you know goes live:
					-Role:		<@${affiliateRoleId}>
					-Channel:	<#${affiliateChannelId}>`,
					flags: MessageFlags.Ephemeral,
				});
			}
			catch (error) {
				console.error(writeLog('Failed to update server settings:', error));
				await interaction.reply({ content: 'Failed to update server settings.', flags: MessageFlags.Ephemeral });
			}
		}
		if (subcommand === 'add') {
			const channelName = interaction.options.getString('name');
			const discordUrl = interaction.options.getString('discord') || null;
			const isSelf = interaction.options.getBoolean('self') ?? false;

			try {
				await Servers.upsert({ guildId });
				await Channels.upsert({
					channelName,
					discordUrl,
					isSelf,
					guildId,
				});

				await interaction.reply({
					content: `Added **${channelName}** successfully.`,
					flags: MessageFlags.Ephemeral,
				});
			}
			catch (error) {
				console.error(writeLog(`Failed to add channel **${channelName}**:`, error));
				await interaction.reply({
					content: `Failed to add **${channelName}**.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		else if (subcommand === 'delete') {
			const channelName = interaction.options.getString('name');

			try {
				const deleted = await Channels.destroy({
					where: { channelName, guildId },
				});

				if (!deleted) {
					return interaction.reply({
						content: `Channel **${channelName}** not found in database.`,
						flags: MessageFlags.Ephemeral,
					});
				}

				await interaction.reply({
					content: `Deleted **${channelName}** successfully.`,
					flags: MessageFlags.Ephemeral,
				});
			}
			catch (error) {
				console.error(writeLog(`Failed to delete **${channelName}**:`, error));
				await interaction.reply({
					content: `Failed to delete **${channelName}**.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		else if (subcommand === 'list') {
			try {
				const channels = await Channels.findAll({
					where: { guildId },
					raw: true,
				});

				if (!channels.length) {
					return interaction.reply({
						content: 'No Twitch channels configured.',
						flags: MessageFlags.Ephemeral,
					});
				}

				const list = channels.map(chan =>
					`• **${chan.channelName}** ${chan.isSelf ? '(self)' : '(affiliate)'}`,
				);

				await interaction.reply({
					content: `**Twitch Channels:**\n${list.join('\n')}`,
					flags: MessageFlags.Ephemeral,
				});
			}
			catch (error) {
				console.error(writeLog('An error occurred while fetching the channel list:', error));
				await interaction.reply({
					content: 'An error occurred while fetching the channel list.',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	},
};