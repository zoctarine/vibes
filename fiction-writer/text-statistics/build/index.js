import { startStdioServer, startHttpServer } from "./transport/serverTransport.js";
import { logger } from "./utils/logger.js";
async function main() {
    const transportType = process.env.TRANSPORT_TYPE || "stdio";
    const port = parseInt(process.env.PORT || "3000");
    try {
        if (transportType.toLowerCase() === "http") {
            await startHttpServer(port);
        }
        else {
            await startStdioServer();
        }
    }
    catch (error) {
        logger.error("Fatal error starting server:", error);
        process.exit(1);
    }
}
main().catch((error) => {
    logger.error("Unhandled exception in main:", error);
    process.exit(1);
});
