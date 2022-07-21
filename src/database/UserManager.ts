import { AccessToken } from '@twurple/auth';
import { Database, RunResult } from 'better-sqlite3';

export type User = {
    userId: number,
    username: string,
    active: boolean,
}

class UserManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    registerUser(username: string, twitchId: string, accessToken: AccessToken): number {
        const addData: RunResult =
            this.db.prepare('insert into users (username, twitch_id, active) values (?, ?, 1)').run(username, twitchId);
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

    getAllUsers(): User[] {
        const users = this.db.prepare('select * from users').all();
        return users.map((user: any) => ({
            userId: user.user_id,
            username: user.username,
            active: !!user.active,
        }));
    }

    updateAuth(userId: number, accessTokenObj: AccessToken) {
        const { accessToken, refreshToken, expiresIn, obtainmentTimestamp } = accessTokenObj;
        this.db.prepare('update oauth set access_token=?, refresh_token=?, expires_in=?, obtained=? where owner=?')
            .run(accessToken, refreshToken, expiresIn, obtainmentTimestamp, userId);
    }

    getAccessToken(userId: number): AccessToken {
        const data = this.db.prepare('select * from oauth where owner=?').get(userId);
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            obtainmentTimestamp: data.obtained,
            scope: [],
        };
    }

    userExists(username: string) {
        const result = this.db.prepare('select user_id from users where username=?').all(username);
        return result.length > 0;
    }
}

export default UserManager;
