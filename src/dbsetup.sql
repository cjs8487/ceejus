-- SQLite
create TABLE if not exists COMMANDS (
    id number primary key AUTOINCREMENT,
    command_string not NULL,
    output not null
)
create TABLE if not exists QUOTES (
    id number primary key AUTOINCREMENT,
    quote not null
)
create TABLE if not exists DISCORD_COMMANDS (
    id number primary key AUTOINCREMENT,
    command_string not NULL,
    output not null
)