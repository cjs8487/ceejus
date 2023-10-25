declare module 'ss-scene-flags' {
    function flagToEvent(flag: string, mapName: string): string;
    function getBiTInfo(flag: string): string[];
    function lookupFlag(
        searchTerm: string,
        mapName: string,
        verbose: boolean,
    ): string[];
}

// redclare session store to supress type errors
declare module 'better-sqlite3-session-store';
