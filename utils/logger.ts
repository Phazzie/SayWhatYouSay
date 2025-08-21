type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  private log(level: LogLevel, message: string, error?: Error, additionalContext?: LogContext) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...additionalContext },
    };

    if (error) {
      logEntry.error = error;
    }

    // In development, use console methods for better formatting
    if (process.env.NODE_ENV === 'development') {
      switch (level) {
        case 'error':
          console.error(`[${logEntry.timestamp}] ERROR: ${message}`, logEntry.context, error);
          break;
        case 'warn':
          console.warn(`[${logEntry.timestamp}] WARN: ${message}`, logEntry.context);
          break;
        case 'debug':
          console.debug(`[${logEntry.timestamp}] DEBUG: ${message}`, logEntry.context);
          break;
        default:
          console.log(`[${logEntry.timestamp}] INFO: ${message}`, logEntry.context);
      }
    } else {
      // In production, use structured JSON logging
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, error, context);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  // Helper for API request/response logging
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`${method} ${path} - Request started`, {
      ...context,
      type: 'api_request',
      method,
      path,
    });
  }

  apiResponse(method: string, path: string, status: number, duration: number, context?: LogContext) {
    const level = status >= 400 ? 'error' : 'info';
    this.log(level, `${method} ${path} - Response ${status}`, undefined, {
      ...context,
      type: 'api_response',
      method,
      path,
      status,
      duration,
    });
  }

  // Performance timing helper
  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.info(`Timer: ${label}`, { duration, type: 'performance' });
      return duration;
    };
  }
}

// Create a singleton logger instance
export const logger = new Logger();

// Helper to create request-scoped logger
export const createRequestLogger = (requestId: string, additionalContext?: LogContext) => {
  const requestLogger = new Logger();
  requestLogger.setContext({ requestId, ...additionalContext });
  return requestLogger;
};

// Middleware helper for Next.js API routes
export const withLogging = <T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  handlerName: string
) => {
  return async (...args: T): Promise<R> => {
    const requestId = Math.random().toString(36).substring(2);
    const requestLogger = createRequestLogger(requestId);
    const endTimer = requestLogger.time(handlerName);

    try {
      requestLogger.info(`${handlerName} started`);
      const result = await handler(...args);
      endTimer();
      requestLogger.info(`${handlerName} completed successfully`);
      return result;
    } catch (error) {
      endTimer();
      requestLogger.error(`${handlerName} failed`, error as Error);
      throw error;
    }
  };
};