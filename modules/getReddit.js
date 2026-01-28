const { Servers, Subs } = require('../database/dbObjects.js');
const { EmbedBuilder } = require('discord.js');
const { writeLog } = require('./writeLog.js');
const he = require('he'); // decode HTML entities in Reddit text

// Fetch the latest post from a subreddit
async function getLatestPost(subName) {
	try {
		const res = await fetch(
			`https://www.reddit.com/r/${subName}/new.json?limit=1`,
			{ headers: { 'User-Agent': 'KenjiBot/2.0' } },
		);

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		return data.data.children[0]?.data || null;
	}
	catch (err) {
		console.error(writeLog(`Failed to fetch latest post for r/${subName}:`, err));
		return null;
	}
}

// Fetch subreddit info (like icon, description, etc.)
async function getSubredditInfo(subName) {
	try {
		const res = await fetch(
			`https://www.reddit.com/r/${subName}/about.json`,
			{ headers: { 'User-Agent': 'KenjiBot/2.0' } },
		);

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		return data.data || null;
	}
	catch (err) {
		console.error(writeLog(`Failed to fetch subreddit info for r/${subName}:`, err));
		return null;
	}
}

// Main function: check all subreddits for all servers
async function checkReddit(client, throttle = 1000) {
	if (!client.user || !client.isReady()) return;

	const servers = await Servers.findAll();

	for (const server of servers) {

		const subs = await Subs.findAll({ where: { guildId: server.guildId }, raw: true });

		for (const sub of subs) {
			await new Promise(r => setTimeout(r, throttle));

			const post = await getLatestPost(sub.subName);
			if (!post) continue;

			const subInfo = await getSubredditInfo(sub.subName);
			const subChannel = client.channels.cache.get(sub.channelId);
			if (!subChannel) {
				console.error(writeLog(`Sub channel ${sub.channelId} not found`));
				continue;
			}

			const existingMessage = sub.messageId
				? await subChannel.messages.fetch(sub.messageId).catch(() => null)
				: null;

			const isSamePost = sub.postId && sub.postId === post.id && existingMessage;

			// Build embed fields
			const fields = [];
			if (post.link_flair_text) fields.push({ name: 'Flair', value: he.decode(post.link_flair_text) });
			fields.push(
				{ name: 'Upvotes', value: post.ups.toString(), inline: true },
				{ name: 'Downvotes', value: post.downs.toString(), inline: true },
				{ name: 'Mature Content', value: post.over_18 ? 'Yes' : 'No' },
			);

			// Create embed
			const redditEmbed = new EmbedBuilder()
				.setTitle(he.decode(post.title).slice(0, 256))
				.setURL(`https://reddit.com${post.permalink}`)
				.setAuthor({ name: `u/${post.author}` })
				.setColor(0xff4500)
				.setFields(fields)
				.setFooter({ text: `r/${sub.subName}` });

			// ----------------------------
			// THUMBNAIL: subreddit icon
			// ----------------------------
			if (subInfo?.icon_img?.startsWith('http')) {
				redditEmbed.setThumbnail(subInfo.icon_img);
			}

			// ----------------------------
			// MAIN IMAGE: Reddit post preview
			// ----------------------------
			let imgUrl = null;
			const preview = post.preview?.images?.[0];

			if (preview?.source?.url) {
				imgUrl = he.decode(preview.source.url);
			}
			else if (preview?.resolutions?.length) {
				imgUrl = he.decode(preview.resolutions[preview.resolutions.length - 1].url);
			}

			// Make sure URL is fully qualified
			if (imgUrl && imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;

			// ----------------------------
			// NSFW handling: skip image if post is over_18 and sub requires SFW
			// ----------------------------
			if (!post.over_18) {
				if (imgUrl && imgUrl.startsWith('http')) {
					redditEmbed.setImage(imgUrl);
				}
			}

			// ----------------------------
			// DESCRIPTION: post selftext (truncated if too long)
			// ----------------------------
			if (post.selftext?.length) {
				let description = he.decode(post.selftext);
				if (description.length > 4096) {
					const truncated = description.slice(0, 4093);
					const lastSpace = truncated.lastIndexOf(' ');
					description = (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
				}
				redditEmbed.setDescription(description);
			}

			// ----------------------------
			// SEND OR UPDATE MESSAGE
			// ----------------------------
			try {
				if (isSamePost) {
					await existingMessage.edit({ embeds: [redditEmbed] });
				}
				else {
					const message = await subChannel.send({ embeds: [redditEmbed] });
					await Subs.update(
						{ postId: post.id, messageId: message.id },
						{ where: { id: sub.id } },
					);
				}
			}
			catch (err) {
				console.error(writeLog(`Failed to send/update message for r/${sub.subName}:`, err));
			}
		}
	}
}

module.exports = { checkReddit };