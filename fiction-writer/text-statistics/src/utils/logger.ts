export const logger = {
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.error(`[WARN] ${message}`, ...args),
  info: (message: string, ...args: any[]) => console.error(`[INFO] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }
};