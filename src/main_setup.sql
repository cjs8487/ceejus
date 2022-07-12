-- SQLite
create TABLE if not exists QUOTES (
    id integer primary key AUTOINCREMENT,
    quote text not null,
    alias text,
    quotedBy text,
    quotedOn date
);
