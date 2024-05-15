import { IConnectionManager, ILogManager, IServiceOpts } from "./interfaces";
import * as Prometheus from 'prom-client';
import * as express from 'express';
import {
  DISABLE_PROMETHEUS,
  SENTRY_DSN,
  NODE_ENV,
  SEGMENT_IO_WRITE_KEY,
} from "./env";
import * as Sentry from "@sentry/node";
import Segment from "./Segment";

/**
 * Provides the abstract class for all service implementations.
 */
class BaseService {
  public opts: IServiceOpts;
  public serviceName: string;
  public connectionMgr: IConnectionManager;
  public logger: ILogManager;
  public storage;
  public segment: Segment;
  public collectDefaultMetrics;

  constructor(opts: IServiceOpts) {
    this.opts = opts;
    this.connectionMgr = this.opts.connectionMgr;
    this.logger = this.opts.logManager;
    this.serviceName = this.opts.serviceName;
    this.storage = this.opts.storageManager;
    this.segment = new Segment(SEGMENT_IO_WRITE_KEY, this.logger);

    /**
     * Initialize Sentry
     */
    if (SENTRY_DSN) {
      this.logger.info("Sentry - Initializing with environment ${NODE_ENV}...");
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: NODE_ENV,
      });
    } else {
      this.logger.warn("Sentry - No DSN supplied, skipping initialization...");
    }

    // Enable/Disable Prometheus
    if(!DISABLE_PROMETHEUS) {
      // set up Prometheus client metrics gathering
      const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
      // collectDefaultMetrics({ timeout: 5000 });
      collectDefaultMetrics();

      // initialize Express app
      const app = express();
      const metricsPort = 5499; // todo: parameterize this

      // Metrics endpoint
      app.get('/metrics', (req, res) => {
        res.set('Content-Type', Prometheus.register.contentType)
        res.send(Prometheus.register.metrics())
      });

      app.get('/readiness', (req, res) => {
        if (this.isReady()) {
          res.status(200).send('OK');
        } else {
          res.status(500).send('Not ready');
        }
      });

      // as long as the event loop is running this should run
      app.get('/liveness', (req, res) => {
        res.status(200).send('OK');
      });

      // listen for metrics requests
      app.listen(metricsPort, () => this.logger.info(`Service '${this.serviceName}' listening for metrics requests on port ${metricsPort}.`));
    }
  }

  // override to have derived classes declare non-readiness to k8s
  public isReady() : boolean {
    return true;
  }

  /**
   * Register message listeners here.
   */
  public register() {
    throw new Error("Not Implemented: register method in Service class.");
  }

  public run() {
    throw new Error("Not Implemented: run method in Service class.");
  }
}

export default BaseService;
