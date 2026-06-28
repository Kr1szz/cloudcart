const log = (level, message, meta = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logData));
  } else {
    const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
    console.log(`${logData.timestamp} [${color}${level}\x1b[0m]: ${message}`, Object.keys(meta).length ? meta : '');
  }
};

const logger = {
  info: (msg, meta) => log('INFO', msg, meta),
  warn: (msg, meta) => log('WARN', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      log('DEBUG', msg, meta);
    }
  }
};

module.exports = logger;
