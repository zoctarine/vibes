import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { logger } from "../utils/logger.js";
import { createMcpServer } from "../server/mcpServer.js";
export async function startStdioServer() {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    logger.info("Text Analysis MCP Server starting with stdio transport...");
    await server.connect(transport);
    logger.info("Text Analysis MCP Server running on stdio");
    process.on('SIGINT', async () => {
        logger.info("Received SIGINT signal. Shutting down stdio server...");
        await server.close();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        logger.info("Received SIGTERM signal. Shutting down stdio server...");
        await server.close();
        process.exit(0);
    });
}
export async function startHttpServer(port = 3000) {
    const app = express();
    app.use(express.json());
    const transports = {};
    const sessions = {};
    setInterval(() => {
        const now = new Date();
        Object.entries(sessions).forEach(([id, session]) => {
            if (now.getTime() - session.createdAt.getTime() > 3600000) {
                logger.info(`Cleaning up inactive session: ${id}`);
                if (transports[id]) {
                    transports[id].close();
                    delete transports[id];
                }
                session.server.close();
                delete sessions[id];
            }
        });
    }, 300000);
    app.post('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        try {
            if (sessionId && transports[sessionId]) {
                const transport = transports[sessionId];
                sessions[sessionId].createdAt = new Date();
                await transport.handleRequest(req, res, req.body);
            }
            else {
                const transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => Math.random().toString(36).substring(2, 15),
                    onsessioninitialized: (newSessionId) => {
                        logger.info(`New HTTP session initialized: ${newSessionId}`);
                        transports[newSessionId] = transport;
                    }
                });
                const server = createMcpServer();
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
                if (transport.sessionId) {
                    sessions[transport.sessionId] = { server, createdAt: new Date() };
                    transport.onclose = () => {
                        if (transport.sessionId) {
                            logger.info(`Session closed: ${transport.sessionId}`);
                            delete transports[transport.sessionId];
                            if (sessions[transport.sessionId]) {
                                sessions[transport.sessionId].server.close();
                                delete sessions[transport.sessionId];
                            }
                        }
                    };
                }
            }
        }
        catch (error) {
            logger.error("Error handling HTTP request:", error);
            if (!res.headersSent) {
                res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
            }
        }
    });
    app.get('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        if (sessionId && transports[sessionId]) {
            sessions[sessionId].createdAt = new Date();
            await transports[sessionId].handleRequest(req, res);
        }
        else {
            res.status(404).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Session not found' }, id: null });
        }
    });
    app.delete('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        if (sessionId && transports[sessionId]) {
            logger.info(`Terminating session: ${sessionId}`);
            const transport = transports[sessionId];
            delete transports[sessionId];
            if (sessions[sessionId]) {
                await sessions[sessionId].server.close();
                delete sessions[sessionId];
            }
            transport.close();
            res.status(204).end();
        }
        else {
            res.status(404).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Session not found' }, id: null });
        }
    });
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now(), activeSessions: Object.keys(sessions).length });
    });
    const server = app.listen(port, () => {
        logger.info(`Text Analysis MCP HTTP Server listening on port ${port}`);
    });
    process.on('SIGINT', () => {
        logger.info("Received SIGINT signal. Shutting down HTTP server...");
        server.close(() => {
            Object.entries(sessions).forEach(([id, session]) => {
                if (transports[id]) {
                    transports[id].close();
                }
                session.server.close();
            });
            process.exit(0);
        });
    });
    process.on('SIGTERM', () => {
        logger.info("Received SIGTERM signal. Shutting down HTTP server...");
        server.close(() => {
            Object.entries(sessions).forEach(([id, session]) => {
                if (transports[id]) {
                    transports[id].close();
                }
                session.server.close();
            });
            process.exit(0);
        });
    });
}
