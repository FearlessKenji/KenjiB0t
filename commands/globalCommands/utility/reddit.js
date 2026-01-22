const { SlashCommandBuilder, MessageFlags, ChannelType } = require('discord.js');
const { Servers, Subs } = require('../../../database/dbObjects.js');

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
		if (subcommand === 'add') {
			const subName = interaction.options.getString('name');
			const chanName = interaction.options.getChannel('channel');
			try {
				await Subs.upsert({ SubName: subName, channelId: chanName.id, guildId: interaction.guild.id });
				await Servers.upsert({ guildId: interaction.guild.id });
				await interaction.reply({ content: 'Subreddit added successfully.', flags: MessageFlags.Ephemeral });
			}
			catch (error) {
				console.error('Failed to add subreddit:', error);
				await interaction.reply({ content: 'Failed to add subreddit.', flags: MessageFlags.Ephemeral });
			}
		}
		else if (subcommand === 'delete') {
			const subName = interaction.options.getString('name');
			try {
				await Subs.destroy({ where: { SubName: subName, guildId: interaction.guild.id } });
				await interaction.reply({ content: 'Subreddit deleted successfully.', flags: MessageFlags.Ephemeral });
			}
			catch (error) {
				console.error('Failed to delete subreddit:', error);
				await interaction.reply({ content: 'Failed to delete subreddit.', flags: MessageFlags.Ephemeral });
			}
		}
		else if (subcommand === 'list') {
			const list = [];
			try {
				const subs = await Subs.findAll({
					where: { guildId: interaction.guild.id },
					raw: true,
				});
				for (const sub of subs) {
					list.push(sub.SubName);
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