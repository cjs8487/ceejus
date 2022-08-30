import { AccessToken } from '@twurple/auth';
import { Database, RunResult } from 'better-sqlite3';

export type User = {
    userId: number,
    username: string,
    active: boolean,
}

export const NO_USER: User = {
    userId: -1,
    username: '',
    active: false,
};

export const NO_TOKEN: AccessToken = {
    accessToken: '',
    refreshToken: '',
    expiresIn: 0,
    obtainmentTimestamp: 0,
    scope: [],
};

type DBUSer = {
    // eslint-disable-next-line camelcase
    user_id: number,
    username: string,
    active: number,
}

const toExternalForm = (user: DBUSer): User => ({
    userId: user.user_id,
    username: user.username,
    active: !!user.active,
});

class UserManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    registerUser(username: string, twitchId: string, accessToken: AccessToken): number {
        const addData: RunResult =
            this.db.prepare('insert into users (username, twitch_id, active) values (?, ?, 1)').run(username, twitchId);
        this.db.prepare(
            // eslint-disable-next-line max-len
            'insert into oauth (owner, access_token, refresh_token, scopes, expires_in, obtained) values (?, ?, ?, ?, ?, ?)',
        ).run(
            addData.lastInsertRowid,
            accessToken.accessToken,
            accessToken.refreshToken,
            accessToken.scope.join(','),
            accessToken.expiresIn,
            accessToken.obtainmentTimestamp,
        );
        return addData.lastInsertRowid as number;
    }

    registerUserWithoutAuth(username: string, twitchId: string): number {
        const addData: RunResult =
            this.db.prepare('insert into users (username, twitch_id, active) values (?, ?, 1)').run(username, twitchId);
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
        const users: DBUSer[] = this.db.prepare('select * from users').all();
        return users.map((user: DBUSer) => toExternalForm(user));
    }

    getUser(user: number): User;
    getUser(user: string): User;

    getUser(user: number | string): User {
        let sql = 'select * from users where ';
        if (typeof user === 'number') {
            sql += 'user_id=?';
        } else {
            sql += 'username=?';
        }
        const selectedUser: DBUSer = this.db.prepare(sql).get(user);
        if (selectedUser === undefined) {
            return NO_USER;
        }
        return toExternalForm(selectedUser);
    }

    getUserByTwitchId(twitchId: string): User {
        const user: DBUSer = this.db.prepare('select * from users where twitch_id=?').get(twitchId);
        if (user === undefined) return NO_USER;
        return toExternalForm(user);
    }

    updateAuth(userId: number, accessTokenObj: AccessToken) {
        const { accessToken, refreshToken, expiresIn, obtainmentTimestamp } = accessTokenObj;
        this.db.prepare('update oauth set access_token=?, refresh_token=?, expires_in=?, obtained=? where owner=?')
            .run(accessToken, refreshToken, expiresIn, obtainmentTimestamp, userId);
    }

    getAccessToken(userId: number): AccessToken {
        const data = this.db.prepare('select * from oauth where owner=?').get(userId);
        if (data === undefined) return NO_TOKEN;
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            obtainmentTimestamp: data.obtained,
            scope: data.scopes.split(','),
        };
    }

    userExists(username: string) {
        const result = this.db.prepare('select user_id from users where username=?').all(username);
        return result.length > 0;
    }
}

export default UserManager;
