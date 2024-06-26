// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const { Servers, Channels } = require('./database/dbObjects.js');
const { dateToString } = require('./modules/dateToString.js');
const { writeLog } = require('./modules/writeLog.js');
const auth = require('./modules/updateAuthConfig.js');
const channel = require('./modules/channelData.js');
const stream = require('./modules/getStreams.js');
const config = require('./config.json');
const { CronJob } = require('cron');
const path = require('node:path');
const fs = require('node:fs');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });

// Command handler
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandDirectory = fs.readdirSync(foldersPath);

for (const commandFolder of commandDirectory) {
	const scopeFolders = path.join(foldersPath, commandFolder);
	const scopePath = fs.readdirSync(scopeFolders);
	for (const folder of scopePath) {
		const commandsPath = path.join(scopeFolders, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			// Set a new item in the Collection with the key as the command name and the value as the exported module
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			}
			else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}

// Event handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// function that will run the checks
const Check = new CronJob(config.cron, async function () {
	const servers = await Servers.findAll({});
	for (const server of servers) {
		const channels = await Channels.findAll({
			where: { guildId: server.guildId },
			raw: true,
		});
		console.log(writeLog(`Checking channels from ${client.guilds.cache.get(server.guildId)}, ID: ${server.guildId}`));
		const tempData = JSON.parse(fs.readFileSync('./config.json'));

		for (const chan of channels) {
			if (!chan.ChannelName) continue;

			let streamData = await stream.getData(chan.ChannelName, tempData.twitchClientId, tempData.authToken);
			if (streamData.data.length == 0) continue;

			streamData = streamData.data[0];

			const startTime = dateToString(streamData.started_at);
			const editTime = dateToString(Date.now());

			const channelData = await channel.getData(chan.ChannelName, tempData.twitchClientId, tempData.authToken);
			if (!channelData) continue;

			const sendEmbed = new EmbedBuilder()
				.setTitle(`${streamData.user_name} is now live`)
				.setDescription(streamData.title)
				.setURL(`https://www.twitch.tv/${streamData.user_login}`)
				.setColor(15548997)
				.setFields(
					{ name: 'Playing:', value: streamData.game_name, inline: true },
					{ name: 'Viewers:', value: streamData.viewer_count.toString(), inline: true },
					{ name: 'Twitch:', value: `[Watch stream](https://www.twitch.tv/${streamData.user_login})` },
					(chan.DiscordServer ? { name: 'Discord Server:', value: `[Join here](${chan.DiscordServer})` } : { name: '\u200B', value: '\u200B' }),
				)
				.setFooter({ text: `Started ${startTime}. Last edited ${editTime}.` })
				.setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamData.user_login}-640x360.jpg?cacheBypass=${(Math.random()).toString()}`)
				.setThumbnail(channelData.thumbnail_url);

			const sendChannel = client.channels.cache.get(server.channelId);
			if (!sendChannel) {
				console.error(`Channel with ID ${chan.discord_message_id} not found in guild ${client.guilds.cache.get(chan.guildId).name}.`);
				continue;
			}

			if (!client.guilds.cache.get(chan.guildId)) {
				console.error(`Guild with ID ${chan.guildId} not found.`);
				continue;
			}

			if (chan.twitch_stream_id == streamData.id) {
				sendChannel.messages.fetch(chan.discord_message_id).then(msg => {
					// update the title, game, viewer_count and the thumbnail
					msg.edit({ embeds: [sendEmbed] });
				});
			}
			else if (server.otherRoleId) {
				await sendChannel.send({ content: `An <@&${server.otherRoleId}> has gone live! They're streaming ${streamData.game_name}!`, embeds: [sendEmbed] }).then(msg => {
					Channels.findOne({ where: { id: chan.id } }).then(existingChannel => {
						if (existingChannel) {
							existingChannel.update({ discord_message_id: msg.id, twitch_stream_id: streamData.id });
						}
						else {
							Channels.create({ id: chan.id, discord_message_id: msg.id, twitch_stream_id: streamData.id });
						}
					});
				});
			}
			else {
				await sendChannel.send({ content: `An affiliate has gone live! They're streaming ${streamData.game_name}`, embeds: [sendEmbed] }).then(msg => {
					Channels.findOne({ where: { id: chan.id } }).then(existingChannel => {
						if (existingChannel) {
							existingChannel.update({ discord_message_id: msg.id, twitch_stream_id: streamData.id });
						}
						else {
							Channels.create({ id: chan.id, discord_message_id: msg.id, twitch_stream_id: streamData.id });
						}
					});
				});
			}
		}
	}
});

let activityIndex = -1;
const updateStatus = new CronJob('*/10 * * * *', async function () {

	let totalMembers = 0;
	client.guilds.cache.forEach((guild) => {
		totalMembers += guild.memberCount;
	});

	const activities = [
		{ type: ActivityType.Watching, name: `${client.guilds.cache.size} servers` },
		{ type: ActivityType.Playing, name: `with ${totalMembers} servants` },
		{ type: ActivityType.Playing, name: 'Sid Meier\'s Civilization V' },
		{ type: ActivityType.Playing, name: 'Grand Theft Auto VI' },
		{ type: ActivityType.Playing, name: 'Final Fantasy X' },
		{ type: ActivityType.Playing, name: 'Rocket League' },
		{ type: ActivityType.Playing, name: 'hackmud' },
		{ type: ActivityType.Watching, name: 'Twitch.tv' },
		{ type: ActivityType.Watching, name: 'you sleep' },
	];

	activityIndex = (activityIndex + 1) % activities.length;
	client.user.setActivity(activities[activityIndex]);
});


// Update the authorization key every hour
const updateAuth = new CronJob('0 * * * *', async function () {
	auth.UpdateAuthConfig();
});

// Catch exceptions
process.on('uncaughtException', err => {
	console.error(writeLog('Caught exception: ', err));
});

// Start the timers
updateStatus.start();
updateAuth.start();
Check.start();

// Log in to Discord with your client's token
client.login(config.token);