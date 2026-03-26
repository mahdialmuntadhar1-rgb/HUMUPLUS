type LogContext = object;

const isProduction = import.meta.env.PROD;

function safeContext(context?: LogContext) {
  if (!context) return undefined;
  try {
    return JSON.parse(JSON.stringify(context));
  } catch {
    return { serializationError: true };
  }
}

export const logger = {
  info(message: string, context?: LogContext) {
    if (!isProduction) {
      console.info(`[info] ${message}`, safeContext(context));
    }
  },
  warn(message: string, context?: LogContext) {
    console.warn(`[warn] ${message}`, safeContext(context));
  },
  error(message: string, context?: LogContext) {
    console.error(`[error] ${message}`, safeContext(context));
  },
};
