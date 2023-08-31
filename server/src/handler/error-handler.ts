import * as internal from "stream";
import {logger} from "../main";

export function handleClientError(err: Error, socket: internal.Duplex) {
    logger.error(`Client error: ${err}`, {message: err.message, stack: err.stack});
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}

export function handleServerError(err: NodeJS.ErrnoException, PORT: string | number) {
    logger.error(`Server error code: ${err.code}`, {message: err.message, stack: err.stack});
    if (err.code === 'EACCES') {
        logger.error(`Server error code: ${err.code}. Bind ${PORT} requires elevated privileges`, {
            message: err.message,
            stack: err.stack
        });
    } else if (err.code === 'EADDRINUSE') {
        logger.error(`Server error code: ${err.code}. Port ${PORT} is already in use`, {
            message: err.message,
            stack: err.stack
        });
    } else {
        logger.error(`Server error code: ${err.code}`, {message: err.message, stack: err.stack});
    }
    process.exit(1);
}

export function handleStartServerError(reason: any) {
    logger.error(`Error starting server: ${reason}`, {message: reason.message, stack: reason.stack});
    process.exit(1);
}

export function handleUncaughtException(err: Error) {
    logger.error(`Uncaught Exception: ${err}`, {message: err.message, stack: err.stack});
}

export function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>) {
    logger.error(`Unhandled Rejection: ${reason}`, {promise: promise, reason: reason});
}