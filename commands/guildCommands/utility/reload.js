const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true),
		)
		.setDefaultMemberPermissions(0), // Restrict to admins or bot owner

	async execute(interaction) {
		if (interaction.user.id === config.botOwner) {
			const commandName = interaction.options.getString('command', true).toLowerCase();
			const command = interaction.client.commands.get(commandName);

			if (!command) {
				return interaction.reply({ content: `There is no command with name \`${commandName}\`!`, flags: MessageFlags.Ephemeral });
			}
			delete require.cache[require.resolve(`./${command.data.name}.js`)];

			try {
				interaction.client.commands.delete(command.data.name);
				const newCommand = require(`./${command.data.name}.js`);
				interaction.client.commands.set(newCommand.data.name, newCommand);
				await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, flags: MessageFlags.Ephemeral });
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``, flags: MessageFlags.Ephemeral });
			}
		}
	},
};