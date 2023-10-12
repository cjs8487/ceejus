/**
 * Gets today's date in YYYY-MM-DD format
 * @returns String representation of today's date in YYYY-MM-DD format
 */
export const getTodaysDate = () => {
    const ts = Date.now();
    const date = new Date(ts);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

export default {};
