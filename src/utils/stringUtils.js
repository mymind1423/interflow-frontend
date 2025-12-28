
/**
 * Tries to fix common encoding issues where UTF-8 characters are displayed incorrectly.
 * @param {string} str 
 * @returns {string}
 */
export const fixEncoding = (str) => {
    if (!str) return "";
    try {
        // 1. Try treating the string as if it was Latin-1 (ISO-8859-1) interpreted as UTF-8
        // This fixes "Ã©" -> "é", "Ã¨" -> "è", etc.
        return decodeURIComponent(escape(str));
    } catch (e) {
        // 2. Fallback: Manual replacements for common issues seen in Oracle/Windows envs
        // If the above fails, or if it's a different type of corruption (like  or ??)
        // We can't recover '?' or '' automatically because the data is lost, 
        // but we can try to clean up known patterns if they are specific artifacts.

        // Example: If 'Dveloppeur' is literally in the string (unlikely for JS strings unless escaped)
        // usually it's just mapped garbage.
        return str
            .replace(/Ã©/g, "é")
            .replace(/Ã¨/g, "è")
            .replace(/Ã/g, "à")
            .replace(/\uFFFD/g, "") // Remove replacement characters if we can't fix them
            .replace(/\?\?/g, ""); // Remove double question marks if they are artifacts
    }
};
