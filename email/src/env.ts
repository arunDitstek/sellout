export const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
export const LOAD_TEST_ENABLED = parseInt(process.env.LOAD_TEST_ENABLED) === 1;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const DEBUG_ENABLED = process.env.DEBUG_ENABLED || 1;
export const ADMIN_UI_BASE_URL = process.env.ADMIN_UI_BASE_URL || 'http://localhost:3000';
export const DOMAIN_NAME = process.env.DOMAIN_NAME || 'sellout.cool';
