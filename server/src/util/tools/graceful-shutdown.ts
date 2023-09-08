import {Pool} from 'mysql';
import {logger} from "../../main";
import {Transporter} from "nodemailer";
import {Server} from "http";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

export function initiateGracefulShutdown(
    server: Server,
    dbPool: Pool,
    smtpTransport:  Transporter<SMTPTransport.SentMessageInfo>,
    timeoutMs: number,
    ongoingRequestsCounter: {
        getOngoingRequests: () => number;
    }
) {
    process.once('SIGTERM', () => handleShutdown('SIGTERM'));
    process.once('SIGINT', () => handleShutdown('SIGINT'));

    process.on('SIGUSR2', () => {
        console.log('');
        logger.info('Received SIGUSR2. Forcefully terminating');
        process.exit(2);
    });

    const handleShutdown = (signal: string) => {
        console.log('');
        logger.info(`Received ${signal} Starting graceful shutdown`);
        gracefulShutdown(server, dbPool, smtpTransport, timeoutMs, ongoingRequestsCounter);
    };
}

export function gracefulShutdown(
    server: Server,
    dbPool: Pool,
    smtpTransport:  Transporter<SMTPTransport.SentMessageInfo>,
    timeoutMs: number,
    ongoingRequestsCounter: {
        getOngoingRequests: () => number;
    }
) {
    logger.info('Shutting down gracefully');

    const timeout = setTimeout(() => {
        logger.error('Forcefully terminating due to timeout');
        process.exit(2);
    }, timeoutMs);

    const checkOngoingRequests = () => {
        if (ongoingRequestsCounter.getOngoingRequests() === 0) {
            logger.info(`No ongoing requests`);
            cleanupResources();
        } else {
            logger.info(`Ongoing requests: ${ongoingRequestsCounter.getOngoingRequests()}`)
            setTimeout(checkOngoingRequests, 1000);
        }
    };

    const cleanupResources = () => {
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
            logger.info('Closing SMTP Transport');
            smtpTransport.close();
            logger.info('SMTP Transport Closed');
            logger.info('Closing MySQL connection');
            dbPool.end(conError => {
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

    checkOngoingRequests()
}
