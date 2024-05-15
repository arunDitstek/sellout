export const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
export const LOAD_TEST_ENABLED = parseInt(process.env.LOAD_TEST_ENABLED) === 1;
export const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
