class GlobalUtils {
    static getTodaysDate() {
        // current timestamp in milliseconds
        const ts = Date.now();

        const date = new Date(ts);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // prints date & time in YYYY-MM-DD format
        return `${year}-${month}-${day}`;
    }
}

module.exports.GlobalUtils = GlobalUtils;
