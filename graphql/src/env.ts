export const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
export const LOAD_TEST_ENABLED = parseInt(process.env.LOAD_TEST_ENABLED) === 1;
export const GRAPHQL_PORT = process.env.GRAPHQL_PORT || '4000';
export const JWT_SECRET = process.env.JWT_SECRET || "THIS_IS_NOT_SECURE!#$%";
// export const DEBUG_ENABLED = process.env.DEBUG_ENABLED || 1;
export const DEBUG_ENABLED = 1;
export const ADMIN_UI_BASE_URL = process.env.ADMIN_UI_BASE_URL || 'http://localhost:3000';
export const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const SELLOUT_WEBFLOW_SITE_ID = process.env.SELLOUT_WEBFLOW_SITE_ID || '5f9b3ca4be69b26d06cb99e5'; // production 5f57afbcbc8f51f7f5b926c3
