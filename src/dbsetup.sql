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
    username text not null unique,
    active integer not null
);

create table if not exists oauth (
    auth_id integer primary key autoincrement,
    owner integer not null,
    access_token text not null,
    refresh_token text not null,
    expires_in integer,
    obtained date,
    foreign key(owner) references users(user_id)
);