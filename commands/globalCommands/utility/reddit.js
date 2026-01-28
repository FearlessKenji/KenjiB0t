const { SlashCommandBuilder, MessageFlags, ChannelType } = require('discord.js');
const { Servers, Subs } = require ('../../../database/dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reddit')
		.setDescription('Edit list of subreddits to be posted.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a subreddit.')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name of the sub.')
						.setRequired(true))
				.addChannelOption(option =>
					option.setName('channel')
						.setDescription('Channel to post to.')
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a sub.')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name of the sub to be deleted.')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all subs for your server.'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;

		if (subcommand === 'add') {
			const subName = interaction.options.getString('name');
			const channelId = interaction.options.getChannel('channel').id;
			try {
				await Servers.upsert({ guildId });
				await Subs.upsert({ subName, channelId, guildId });
				await interaction.reply({ content: `Subreddit **${subName}** added successfully to <#${channelId}>.`, flags: MessageFlags.Ephemeral });
			}
			catch (error) {
				console.error('Failed to add subreddit:', error);
				await interaction.reply({ content: `Failed to add **${subName}** to <#${channelId}>.`, flags: MessageFlags.Ephemeral });
			}
		}
		else if (subcommand === 'delete') {
			const subName = interaction.options.getString('name');
			try {
				const deleted = await Subs.destroy(
					{ where: { subName, guildId } });

				if (!deleted) {
					return interaction.reply({
						content: `Channel **${subName}** not found in database.`,
						flags: MessageFlags.Ephemeral,
					});
				}
				await interaction.reply({ content: `Subreddit **${subName}** deleted successfully.`, flags: MessageFlags.Ephemeral });
			}
			catch (error) {
				console.error('Failed to delete subreddit:', error);
				await interaction.reply({ content: `Failed to delete **${subName}**.`, flags: MessageFlags.Ephemeral });
			}
		}
		else if (subcommand === 'list') {
			try {
				const subs = await Subs.findAll({
					where: { guildId },
					raw: true,
				});
				const list = subs.map(sub => sub.subName);

				if (!subs.length) {
					return interaction.reply({
						content: 'No subreddits configured.',
						flags: MessageFlags.Ephemeral,
					});
				}

				await interaction.reply({ content: `Sub List:\n${list.join('\n')}`, flags: MessageFlags.Ephemeral });
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content: 'An error occurred while fetching the sub list.', flags: MessageFlags.Ephemeral });
			}
		}

	},
};