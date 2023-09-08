import * as winston from "winston";

export function createConsoleLogFormat(): winston.Logform.Format {
    return winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.align(),
        winston.format.printf(info =>
            `${info.timestamp} app[Contact Information]: ${info.level.toUpperCase()}: ${info.message}`)
    );
}

export function createFileLogFormat(): winston.Logform.Format {
    return winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    );
}

export function createLogger(logLevel: string): winston.Logger {
    return winston.createLogger({
        exitOnError: false,
        level: logLevel,
        format: createFileLogFormat(),
        transports: [
            new winston.transports.Console({
                format: createConsoleLogFormat()
            }),
            new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
            new winston.transports.File({filename: 'logs/combined.log'}),
        ],
    });
}