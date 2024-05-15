export const DISABLE_PROMETHEUS = process.env.DISABLE_PROMETHEUS || false;
export const LOAD_TEST_ENABLED = process.env.LOAD_TEST_ENABLED === '1';
export const SEGMENT_IO_WRITE_KEY = process.env.SEGMENT_IO_WRITE_KEY;
export const SENTRY_DSN = process.env.SENTRY_DSN;
export const NODE_ENV = process.env.NODE_ENV || 'development';
