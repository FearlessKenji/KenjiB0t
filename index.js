const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { writeLog } = require('./modules/writeLog.js');
const createCronJobs = require('./modules/crons.js');
const config = require('./config.json');
const path = require('node:path');
const fs = require('node:fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions] });
client.cronJobs = createCronJobs(client);

// =======================
// Command handler
// =======================
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

for (const scope of fs.readdirSync(commandsPath)) {
  const scopePath = path.join(commandsPath, scope);
  for (const folder of fs.readdirSync(scopePath)) {
    const folderPath = path.join(scopePath, folder);
    for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
      const command = require(path.join(folderPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] ${file} missing data or execute`);
      }
    }
  }
}

// =======================
// Event handler
// =======================
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// =======================
// Global error handling
// =======================
process.on('uncaughtException', err => {
  console.error(writeLog('Uncaught exception:', err));
});

// =======================
// Login
// =======================
client.login(config.token);

// =======================
// Shutdown logic
// =======================
process.on('SIGINT', () => {
  console.log('Stopping bot...')
  for (const [name, job] of Object.entries(client.cronJobs)) {
    console.log(`${name} cron stopped.`)
    job.stop();
  }
  process.exit(0);
});