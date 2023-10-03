import { AccessToken } from '@twurple/auth';
import { RunResult } from 'better-sqlite3';
import { db } from '../System';

export type User = {
    userId: number;
    username: string;
    active: boolean;
};

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

type DBUser = {
    // eslint-disable-next-line camelcase
    user_id: number;
    username: string;
    active: number;
};

const toExternalForm = (user: DBUser): User => ({
    userId: user.user_id,
    username: user.username,
    active: !!user.active,
});

export const registerUser = (
    username: string,
    twitchId: string,
    accessToken: AccessToken,
): number => {
    const addData: RunResult = db
        .prepare(
            'insert into users (username, twitch_id, active) values (?, ?, 1)',
        )
        .run(username, twitchId);
    db.prepare(
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
};

export const registerUserWithoutAuth = (
    username: string,
    twitchId: string,
): number => {
    const addData: RunResult = db
        .prepare(
            'insert into users (username, twitch_id, active) values (?, ?, 1)',
        )
        .run(username, twitchId);
    return addData.lastInsertRowid as number;
};

export const updateUser = (userId: number, username: string) => {
    db.prepare('update users set username=? where user_id=?').run(
        username,
        userId,
    );
};

export const activateUser = (userId: number) => {
    db.prepare('update users set active=1 where user_id=?').run(userId);
};

export const deactivateUser = (userId: number) => {
    db.prepare('update users set active=0 where user_id=?').run(userId);
};

export const getAllUsers = (active?: boolean): User[] => {
    let users: DBUser[];
    if (active) {
        users = db.prepare('select * from users where active=1').all();
    } else {
        users = db.prepare('select * from users').all();
    }
    return users.map((user: DBUser) => toExternalForm(user));
};

export const getUser = (user: number | string): User => {
    let sql = 'select * from users where ';
    if (typeof user === 'number') {
        sql += 'user_id=?';
    } else {
        sql += 'username=?';
    }
    const selectedUser: DBUser = db.prepare(sql).get(user);
    if (selectedUser === undefined) {
        return NO_USER;
    }
    return toExternalForm(selectedUser);
};

export const getUserByTwitchId = (twitchId: string): User => {
    const user: DBUser = db
        .prepare('select * from users where twitch_id=?')
        .get(twitchId);
    if (user === undefined) return NO_USER;
    return toExternalForm(user);
};

export const updateTwitchAuth = (twitchId: string, token: AccessToken) => {
    const { accessToken, refreshToken, expiresIn, obtainmentTimestamp } = token;
    const owner = getUserByTwitchId(twitchId);
    db.prepare(
        'update oauth set access_token=?, refresh_token=?, expires_in=?, obtained=? where owner=?',
    ).run(
        accessToken,
        refreshToken,
        expiresIn,
        obtainmentTimestamp,
        owner.userId,
    );
};

export const updateAuth = (userId: number, accessTokenObj: AccessToken) => {
    const { accessToken, refreshToken, expiresIn, obtainmentTimestamp } =
        accessTokenObj;
    db.prepare(
        'update oauth set access_token=?, refresh_token=?, expires_in=?, obtained=? where owner=?',
    ).run(accessToken, refreshToken, expiresIn, obtainmentTimestamp, userId);
};

export const getAccessToken = (userId: number): AccessToken => {
    const data = db.prepare('select * from oauth where owner=?').get(userId);
    if (data === undefined) return NO_TOKEN;
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        obtainmentTimestamp: data.obtained,
        scope: data.scopes.split(','),
    };
};

export const userExists = (username: string) => {
    const result = db
        .prepare('select user_id from users where username=?')
        .all(username);
    return result.length > 0;
};
