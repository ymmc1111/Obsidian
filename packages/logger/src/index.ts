import pino from 'pino';

// FIPS-compliant logging wrapper
// Ensures logs are structured JSON and PII is redacted (future enhancement)

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    base: {
        service: process.env.SERVICE_NAME || 'pocket-ops',
    },
});

export const log = {
    info: (msg: string, context?: object) => logger.info(context, msg),
    error: (msg: string, context?: object) => logger.error(context, msg),
    warn: (msg: string, context?: object) => logger.warn(context, msg),
    debug: (msg: string, context?: object) => logger.debug(context, msg),

    // Audit log specifically for security events
    audit: (msg: string, context: { actor: string; action: string;[key: string]: any }) => {
        logger.info({ ...context, type: 'AUDIT' }, msg);
    }
};
