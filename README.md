# Twitch Discord Bot
This Discord bot will automatically send a message and tag the assigned role whenever a streamer went live.
The notifications will update every 10 minutes(default) while the streamer is live.

## How does it work?
This Discord bot uses [The Official Twitch Api](https://dev.twitch.tv/docs/api/). You will be able to assign unlimited streamers to the bot. The bot uses the api to fetch the channel data to see if the streamer is live. If the streamer is live it will send a message in the assigned channel and it will also tag the assigned role. You will be able to choose the update time. If the streamer is still live the bot will update the message after X amount of time (default 10 minutes). 


# Installation
First you will have to clone the project.
```console
$ git clone https://github.com/FearlessKenji/KenjiB0t
```

## Dependencies
In order for the bot to work properly you will have to install the required node packages outlined in packages.json. Use the following command to install the dependencies.
```console
$ npm install
```

## Edit blank_config.json
- Rename to config.json
- token - Enter your [Discord bot token](https://discord.com/developers/applications) here.
- twitchClientId - Enter the Twitch application client ID here ([Twitch Developer Console](https://dev.twitch.tv/console/apps)).
- twitchSecret - Generate a api token on the Twitch application page.
- channelId - Copy and paste the Discord channel ID here (The Twitch notifications will be send in this channel).
- botOwner - Copy and paste your discord ID for top access commands.
- guildID - Copy and paste your Discord server ID here.
- roleId - Copy and paste the Discord Role ID here (This field is NOT required. Please assign "" to this if you don't want to tag any roles).
- cron - Enter your update/check interval here ([Cron Guru](https://crontab.guru/)).

NOTE: Do NOT add anything in the fields that are already empty. These fields will automatically update.
Some of values in the config.json template have "(NOT REQUIRED)" in it. If you are not using this replace it with an empty string.
```"DISCORD_SERVER_INVITE_URL(NOT REQUIRED)" --> ""```

## Add streamers
In the config.json there is a channels array. If you want to add streamers you just add new objects to this array. Don't forget commas!
```console
{
   "ChannelName": "STREAMER_NAME(REQUIRED)",
   "DiscordServer": "DISCORD_SERVER_INVITE_URL(NOT REQUIRED)",
   "twitch_stream_id": "",
   "discord_message_id": ""
}
```
- ChannelName - Enter the streamer login name here. This name is the same as the name in the channel URL.  
Example: 
URL = https://www.twitch.tv/fearlesskenji  
ChannelName = fearlesskenji
- DiscordServer - This field is not required but if the Streamer has their own Discord server you could add the invite url here.  
  
An array with multiple streamers will look something like this:
```console
{
   "ChannelName": "STREAMER1",
   "DiscordServer": "discord.gg/invite",
   "twitch_stream_id": "",
   "discord_message_id": ""
},
{
   "ChannelName": "STREAMER2",
   "DiscordServer": "",
   "twitch_stream_id": "",
   "discord_message_id": ""
}
```

## Run the bot
After you updated the config.json and installed the dependencies you can run the final command.
Use the command in the same directory as the index.js file.
```console
$ node index.js
```
Congratulations! You have successfully setup the bot.