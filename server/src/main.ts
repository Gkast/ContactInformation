import {initiateGracefulShutdown} from "./util/tools/graceful-shutdown";
import {createLogger} from "./util/tools/logger";
import {createDatabasePool, createSMTPTransport} from "./util/config/connection-config";
import {createRouter} from "./util/config/router-config";
import {handleRequest} from "./handler/request-handler";
import {
    handleClientError,
    handleServerError,
    handleStartServerError,
    handleUncaughtException,
    handleUnhandledRejection
} from "./handler/error-handler";
import {createServer} from "http";

export const logger = createLogger(process.env.LOG_LEVEL || 'info');
logger.info(`Process initiated with id: ${process.pid}`);
process.on('unhandledRejection', (reason, promise) => handleUnhandledRejection(reason, promise));
process.on('uncaughtException', (err) => handleUncaughtException(err));

async function startServer(): Promise<void> {
    const smtpTransport = await createSMTPTransport()
    const dbPool = await createDatabasePool();
    const captchaSecret = process.env.CAPTCHA_SECRET;
    const router = await createRouter(dbPool, smtpTransport, captchaSecret);
    let ongoingRequests = 0;

    const server = createServer((nodeReq, nodeRes) => {
        ongoingRequests++;
        handleRequest(nodeReq, nodeRes, router, dbPool);
        nodeRes.on('finish', () => ongoingRequests--);
    })

    server.keepAliveTimeout = 30000;
    server.on('error', (err: NodeJS.ErrnoException) => handleServerError(err, PORT))
    server.on('clientError', (err, socket) => handleClientError(err, socket));

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server initialized and listening on port ${PORT}`);
        const timeoutMs = 10000;
        initiateGracefulShutdown(
            server,
            dbPool,
            smtpTransport,
            timeoutMs,
            {getOngoingRequests: () => ongoingRequests}
        );
    })
}

startServer().catch(reason => handleStartServerError(reason))