import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import { proxyProvider } from './proxyProvider';
import express from 'express';
import compression from 'compression';
import * as bodyParser from 'body-parser';
import { executableSchema as schema } from './schema';
import { ApolloServer } from "apollo-server-express";
import { tracerExpress } from '@sellout/service/.dist/TracerExpress';
import { authenticate } from './authenticate';
import { authenticateHostname } from './authenticateHostname';
import { cors } from './cors';
import { graphqlUploadExpress } from "graphql-upload";
import { resolvers } from './resolvers/event';


import {
  DEBUG_ENABLED
} from './env';

export class Server {
  private port;
  private proxy;

  constructor(conn: NatsConnectionManager, port) {
    this.port = port;
    this.proxy = proxyProvider(conn);
    this.connect();
  }

  public connect = async (): Promise<void> => {

    const server = new ApolloServer({
      uploads: false,
      schema,
      context: req => ({
        req: req.req,
        res: req.res,
        proxy: this.proxy,
      }),
      formatError: error => {
        if (!DEBUG_ENABLED) {
          delete error.extensions.exception;
        }
        return error;
      }
    });

    const app = express();
    app.use(compression());
    app.use(cors);
    app.use(bodyParser.json());
    app.use(tracerExpress('GraphQL'));
    app.use(authenticate);
    app.use(authenticateHostname(this.proxy));
    app.use(graphqlUploadExpress());

    app.get('/', (_, res) => {
      res.status(200).send('OK');
    });

    app.get('/getEventList', async (req, res) => {
      let response = await resolvers.Query.eventsList({ req: req, proxy: this.proxy })
      res.status(response.status).send(response);
    });
    app.get('/getSeasonList', async (req, res) => {
      let response = await resolvers.Query.seasonsList({ req: req, proxy: this.proxy })
      res.status(response.status).send(response);

    });
    app.get('/getEventDetail', async (req, res) => {
      if (req.query && req.query.id!= '' || req.query.name!= '') {
        let response = await resolvers.Query.eventsDetails({ req: req, proxy: this.proxy })
        res.status(response.status).send(response);
      } else {
        res.status(422).send({
          "status": "UNPROCESSABLE_ENTITY",
          "errors": [
            {
              "key": "eventId",
              "message": "\"eventId\" is required"
            }
          ]
        });
      }
    });
    app.get('/getSeasonDetail', async (req, res) => {
      if (req.query && req.query.id != '') {
        let response = await resolvers.Query.seasonsDetails({ req: req, proxy: this.proxy })
        res.status(response.status).send(response);
      } else {
        res.status(422).send({
          "status": "UNPROCESSABLE_ENTITY",
          "errors": [
            {
              "key": "seasonId",
              "message": "\"seasonId\" is required"
            }
          ]
        });
      }
    });


    server.applyMiddleware({ app });

    app.listen(this.port, () => {
      console.log(`GraphQL live on port ${this.port}`);
    });
  }
}
