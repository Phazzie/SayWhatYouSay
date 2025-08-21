import { logger, createRequestLogger, withLogging } from '@/utils/logger';

describe('Logger Utils', () => {
  let consoleSpy: jest.SpyInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  describe('logger', () => {
    it('logs info messages', () => {
      logger.info('Test message');
      expect(console.log).toHaveBeenCalled();
    });

    it('logs error messages with error object', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error);
      expect(console.error).toHaveBeenCalled();
    });

    it('logs warnings', () => {
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
    });

    it('logs debug messages', () => {
      logger.debug('Test debug');
      expect(console.debug).toHaveBeenCalled();
    });

    it('logs API requests', () => {
      logger.apiRequest('GET', '/api/test');
      expect(console.log).toHaveBeenCalled();
    });

    it('logs API responses', () => {
      logger.apiResponse('GET', '/api/test', 200, 100);
      expect(console.log).toHaveBeenCalled();
    });

    it('logs API errors with error status', () => {
      logger.apiResponse('POST', '/api/error', 500, 50);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createRequestLogger', () => {
    it('creates logger with request context', () => {
      const requestLogger = createRequestLogger('req-123', { path: '/test' });
      requestLogger.info('Request test');
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('withLogging', () => {
    it('wraps function with logging', async () => {
      const testFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = withLogging(testFn, 'test-handler');
      
      const result = await wrappedFn('arg1', 'arg2');
      
      expect(result).toBe('success');
      expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(console.log).toHaveBeenCalled();
    });

    it('logs errors when function throws', async () => {
      const error = new Error('Test error');
      const testFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = withLogging(testFn, 'test-handler');
      
      await expect(wrappedFn()).rejects.toThrow('Test error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('timer functionality', () => {
    it('measures execution time', () => {
      const endTimer = logger.time('test-operation');
      endTimer();
      expect(console.log).toHaveBeenCalled();
    });
  });
});