export const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';
export const LOAD_TEST_ENABLED = parseInt(process.env.LOAD_TEST_ENABLED) === 1;
export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || '';
export const GCP_BUCKET_NAME = process.env.GCP_BUCKET_NAME || '';
