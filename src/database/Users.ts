import { AccessToken } from '@twurple/auth';
import { RunResult } from 'better-sqlite3';
import { db } from '../System';

export type User = {
    userId: number;
    username: string;
    active: boolean;
    twitchId: string;
    discordId?: string;
};

export const NO_TOKEN: AccessToken = {
    accessToken: '',
    refreshToken: '',
    expiresIn: 0,
    obtainmentTimestamp: 0,
    scope: [],
};

type DBUser = {
    user_id: number;
    username: string;
    active: number;
    twitch_id: string;
    discord_id?: string;
};

const toExternalForm = (user: DBUser): User => ({
    userId: user.user_id,
    username: user.username,
    active: !!user.active,
    twitchId: user.twitch_id,
    discordId: user.discord_id,
});

export const registerUser = (
    username: string,
    twitchId: string,
    discordId?: string,
): number => {
    const addData: RunResult = db
        .prepare(
            'insert into users (username, twitch_id, active, discord_id) values (?, ?, 1, ?)',
        )
        .run(username, twitchId, discordId);
    return addData.lastInsertRowid as number;
};

export const addAuthToUser = (
    userId: number,
    service: string,
    refreshToken: string,
) => {
    db.prepare(
        'insert into oauth (owner, refresh_token, service) values (?, ?, ?)',
    ).run(userId, refreshToken, service);
};

export const updateUser = (userId: number, username: string) => {
    db.prepare('update users set username=? where user_id=?').run(
        username,
        userId,
    );
};

export const updateUserDiscordId = (userId: number, discordId: string) => {
    db.prepare('update users set discord_id=? where user_id=?').run(
        discordId,
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

export const getUser = (userId: number): User | undefined => {
    const selectedUser: DBUser = db
        .prepare('select * from users where user_id=?')
        .get(userId);
    if (selectedUser === undefined) {
        return undefined;
    }
    return toExternalForm(selectedUser);
};

export const getUserByName = (username: string): User | undefined => {
    const selectedUser: DBUser = db
        .prepare('select * from users where username=?')
        .get(username);
    if (selectedUser === undefined) {
        return undefined;
    }
    return toExternalForm(selectedUser);
};

export const getUserByTwitchId = (twitchId: string): User | undefined => {
    const user: DBUser = db
        .prepare('select * from users where twitch_id=?')
        .get(twitchId);
    if (user === undefined) return undefined;
    return toExternalForm(user);
};

export const getUserByDiscordId = (discordId: string): User | undefined => {
    const user: DBUser | undefined = db
        .prepare('select * from users where discord_id=?')
        .get(discordId);
    if (!user) return undefined;
    return toExternalForm(user);
};

export const updateAuth = (
    userId: number,
    service: string,
    refreshToken: string,
) => {
    db.prepare(
        'update oauth set refresh_token=? where owner=? and service=?',
    ).run(refreshToken, userId, service);
};

export const userExists = (username: string) => {
    const result = db
        .prepare('select user_id from users where username=?')
        .all(username);
    return result.length > 0;
};
