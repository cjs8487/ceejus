import { createLogger, format, transports } from 'winston';
import { testing } from './Environment';

const { combine, colorize, timestamp, printf } = format;

const logFormat = combine(
    timestamp({ format: 'ddd MMMM D YYYY h:mm:ss A' }),
    colorize({}),
    printf((info) => `${info.timestamp} [${info.level}] ${info.message}`),
);

export const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [],
});

if (testing) {
    logger.level = 'silly';
    logger.add(new transports.Console());
}

export const logDebug = (message: string) => {
    logger.log('debug', message);
};

export const logVerbose = (message: string) => {
    logger.log('verbose', message);
};

export const logInfo = (message: string) => {
    logger.log('info', message);
};

export const logWarn = (message: string) => {
    logger.log('warn', message);
};

export const logError = (message: string) => {
    logger.log('error', message);
};
