const { writeLog } = require('./writeLog.js')
const config = require('../config.json');
const auth = require('./auth.js');
const fs = require('node:fs');

// get a new authorization key and update the config
async function updateAuthConfig() {
	// get the auth key
	const authKey = await auth.getKey(config.twitchClientId, config.twitchSecret);
	if (!authKey) return;

	// write the new auth key
	//console.log(writeLog(`Updating authToken and writing to config.`));
	const tempConfig = JSON.parse(fs.readFileSync('./config.json'));
	tempConfig.authToken = authKey;
	fs.writeFileSync('./config.json', JSON.stringify(tempConfig, null, 2));
}
module.exports = { updateAuthConfig };