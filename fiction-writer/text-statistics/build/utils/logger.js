export const logger = {
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    warn: (message, ...args) => console.error(`[WARN] ${message}`, ...args),
    info: (message, ...args) => console.error(`[INFO] ${message}`, ...args),
    debug: (message, ...args) => {
        if (process.env.DEBUG) {
            console.error(`[DEBUG] ${message}`, ...args);
        }
    }
};
