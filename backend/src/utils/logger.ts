// Simple logger utility
type LogLevel = 'info' | 'error' | 'warn' | 'debug';

function log(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export const logger = {
  info: (message: string, meta?: any) => log('info', message, meta),
  error: (message: string, meta?: any) => log('error', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  debug: (message: string, meta?: any) => log('debug', message, meta),
};

