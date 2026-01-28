const fs = require('fs');
const path = require('path');
const { sequelize } = require('../database/dbObjects');
const { writeLog } = require('../modules/writeLog');

async function dbInit() {
	const dbPath = path.resolve('database/database.sqlite');
	const exists = fs.existsSync(dbPath);

	await sequelize.sync();

	console.log(
		writeLog(
			exists
				? '[DB] Database synced'
				: '[DB] Database created and synced',
		),
	);
}

module.exports = { dbInit };
