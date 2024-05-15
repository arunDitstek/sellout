import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import { Server } from './server';
import { NATS_URL, GRAPHQL_PORT } from "./env";

const logger = new ConsoleLogManager({
  serviceName: 'graphql'
});

const conn = new NatsConnectionManager(
  [<string>NATS_URL],
  logger,
  true,
  30000
);
conn.connect();

new Server(conn, GRAPHQL_PORT);
