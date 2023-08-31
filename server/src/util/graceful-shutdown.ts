import * as http from 'http';
import {Connection} from 'mysql';
import {logger} from "../main";

export function initializeGracefulShutdown(
    server: http.Server,
    con: Connection,
    timeoutMs: number
) {
    const handleShutdown = (signal: string) => {
        console.log('');
        logger.info(`Received ${signal} Starting graceful shutdown`);
        gracefulShutdown(server, con, timeoutMs);
    };

    process.once('SIGTERM', () => handleShutdown('SIGTERM'));
    process.once('SIGINT', () => handleShutdown('SIGINT'));

    process.on('SIGUSR2', () => {
        console.log('');
        logger.info('Received SIGUSR2. Forcefully terminating');
        process.exit(2);
    });
}

export function gracefulShutdown(
    server: http.Server,
    con: Connection,
    timeoutMs: number
) {
    logger.info('Shutting down gracefully');

    const timeout = setTimeout(() => {
        logger.error('Forcefully terminating due to timeout');
        process.exit(2);
    }, timeoutMs);

    logger.info('Closing server');
    server.close(serverError => {
        if (serverError) {
            clearTimeout(timeout);
            logger.error(`An error occurred during graceful shutdown: ${serverError}`, {
                message: serverError.message,
                stack: serverError.stack
            });
            process.exit(1);
        }
        logger.info('Server closed');
        logger.info('Closing idle connections');
        server.closeIdleConnections();
        logger.info('Idle connections closed');
        logger.info('Closing MySQL connection');
        con.end(conError => {
            if (conError) {
                clearTimeout(timeout);
                logger.error(`An error occurred during graceful shutdown: ${conError}`, {
                    message: conError.message,
                    stack: conError.stack
                });
                process.exit(1);
            }
            logger.info('MySQL connection closed');
            clearTimeout(timeout);
            logger.info('Cleanup completed');
            logger.info('Exiting');
            process.exit(0)
        })
    });
}
