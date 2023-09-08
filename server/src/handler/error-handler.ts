import * as internal from "stream";
import {logger} from "../main";

export const errorMessage = (err: any) => {
    return `Error message: ${err.message} 
Error stack: ${err.stack}`
}

export function handleClientError(err: Error, socket: internal.Duplex) {
    logger.error(`Client error: ${errorMessage(err)}`);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}

export function handleServerError(err: NodeJS.ErrnoException, PORT: string | number) {
    if (err.code === 'EACCES') {
        logger.error(`Server error: Bind ${PORT} requires elevated privileges
Error code: ${err.code} 
${errorMessage(err)}`);
    } else if (err.code === 'EADDRINUSE') {
        logger.error(`Server error: Port ${PORT} is already in use 
Error code: ${err.code} 
${errorMessage(err)}`);
    } else {
        logger.error(`Server error: Error code: ${err.code} 
${errorMessage(err)}`);
    }
    process.exit(1);
}

export function handleStartServerError(reason: any) {
    logger.error(`Error starting server: Error code: ${reason.code} 
${errorMessage(reason)}`);
    process.exit(1);
}

export function handleUncaughtException(err: Error) {
    logger.error(`Uncaught Exception: ${errorMessage(err)}`);
}

export function handleUnhandledRejection(reason: unknown, promise: Promise<unknown>) {
    logger.error(`Unhandled Rejection: ${reason} ${JSON.stringify(promise)}`);
}