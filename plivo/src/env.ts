export const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
export const LOAD_TEST_ENABLED = parseInt(process.env.LOAD_TEST_ENABLED) === 1;
export const PLIVO_AUTH_TOKEN = process.env.PLIVO_AUTH_TOKEN;
export const PLIVO_AUTH_ID = process.env.PLIVO_AUTH_ID;
