import { AccessToken } from '@twurple/auth';
import { Database, RunResult } from 'better-sqlite3';

class UserManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    registerUser(username: string, accessToken: AccessToken): number {
        const addData: RunResult = this.db.prepare('insert into users (username, active) values (?, 1)').run(username);
        this.db.prepare(
            'insert into oauth (owner, access_token, refresh_token, expires_in, obtained) values (?, ?, ?, ?, ?)',
        ).run(
            addData.lastInsertRowid,
            accessToken.accessToken,
            accessToken.refreshToken,
            accessToken.expiresIn,
            accessToken.obtainmentTimestamp,
        );
        return addData.lastInsertRowid as number;
    }

    updateUser(userId: number, username: string) {
        this.db.prepare('update users set username=? where user_id=?').run(username, userId);
    }

    activateUser(userId: number) {
        this.db.prepare('update users set active=1 where user_id=?').run(userId);
    }

    deactivateUser(userId: number) {
        this.db.prepare('update users set active=0 where user_id=?').run(userId);
    }

    updateAuth(userId: number, accessTokenObj: AccessToken) {
        const { accessToken, refreshToken, expiresIn, obtainmentTimestamp } = accessTokenObj;
        this.db.prepare('update oauth set access_token=?, refresh_token=?, expires_in=?, obtained=? where owner=?')
            .run(accessToken, refreshToken, expiresIn, obtainmentTimestamp, userId);
    }
}

export default UserManager;
