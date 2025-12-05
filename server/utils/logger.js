const pino = require('pino');

// Configure the logger with appropriate log levels and formatting
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  // Add application name and environment to all logs
  base: {
    app: 'barber-booker',
    env: process.env.NODE_ENV || 'development',
  },
});

// Export the logger instance to be used throughout the application
module.exports = logger;