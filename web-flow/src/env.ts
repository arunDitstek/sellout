export const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';
export const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
export const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
export const LOAD_TEST_ENABLED = parseInt(process.env.LOAD_TEST_ENABLED) === 1;
export const ADMIN_UI_BASE_URL = process.env.ADMIN_UI_BASE_URL || 'http://localhost:3000';
export const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY || null;
export const SELLOUT_WEBFLOW_SITE_ID = process.env.SELLOUT_WEBFLOW_SITE_ID || '5f9b3ca4be69b26d06cb99e5'; // production 5f57afbcbc8f51f7f5b926c3
