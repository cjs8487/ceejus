import Database, { Database as DB } from 'better-sqlite3';
import fs from 'fs';
import { testing } from './Environment';
import { logInfo, logVerbose } from './Logger';

// set up the databse
// the setup script will run everytime the bot starts.
// Take care that it will not overwrite data and will always work or the bot may not start
// eslint-disable-next-line import/no-mutable-exports
export let db: DB;
if (testing) {
    db = new Database('database.db', { verbose: logVerbose });
    logInfo('db verbose enabled');
} else {
    db = new Database('database.db');
}
const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

// Ensure that the database connection is closed when the process terminates
process.on('exit', () => db.close());

export default {};
