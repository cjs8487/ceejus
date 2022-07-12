create TABLE if not exists COMMANDS (
    id integer primary key AUTOINCREMENT,
    command_string text not NULL,
    output text not null
);
create TABLE if not exists DISCORD_COMMANDS (
    id integer primary key AUTOINCREMENT,
    command_string text not NULL,
    output text not null
);
create TABLE if not exists ECONOMY (
    id integer primary key AUTOINCREMENT,
    user text not NULL,
    amount integer not NULL
);