-- SQLite
create TABLE if not exists QUOTES (
    id integer primary key AUTOINCREMENT,
    quote text not null,
    alias text,
    quotedBy text,
    quotedOn date
);

create table if not exists users (
    user_id integer primary key autoincrement,
    username text not null,
    twitch_id text not null,
    discord_id text,
    active integer not null
);
create unique index if not exists user_username_index on users(username);
create unique index if not exists user_twitchid_index on users(twitch_id);
create unique index if not exists user_discordid_index on users(discord_id);

create table if not exists oauth (
    auth_id integer primary key autoincrement,
    owner integer not null,
    service text not null,
    refresh_token text not null,
    foreign key(owner) references users(user_id)
);

create table if not exists economy_redemptions(
    redemption_id integer primary key autoincrement,
    owner integer not null,
    twitch_reward_id text not null,
    amount integer not null,
    foreign key(owner) references users(user_id)
);
create index if not exists economy_redemptions_twitch_id_index on economy_redemptions(twitch_reward_id);

create table if not exists redemption_metadata(
    meta_id integer primary key autoincrement,
    owner integer not null,
    twitch_reward_id text not null,
    module text not null,
    type text,
    foreign key(owner) references users(user_id)
);
create index if not exists redemption_metadata_twitch_id_index on redemption_metadata(twitch_reward_id);

create table if not exists economy(
    user number not null,
    owner number not null,
    amount number not null,
    gamble_net number not null,
    amount_given number not null,
    amount_received number not null,
    primary key(user, owner)
    foreign key(user) references users(user_id),
    foreign key(owner) references users(user_id)
);
create index if not exists economy_gamble_net_index on economy(gamble_net);

create table if not exists economy_config(
    info_id integer primary key autoincrement,
    owner number not null,
    currency_name string not null,
    earn_rate number not null,
    require_active number not null,
    minimum_gamble number not null,
    foreign key(owner) references users(user_id)
);

create TABLE if not exists COMMANDS (
    id integer,
    owner number not null,
    command_string text not NULL,
    output text not null,
    active integer not null default 1,
    permission integer not null default 0,
    primary key(id, owner),
    foreign key(owner) references users(user_id)
);