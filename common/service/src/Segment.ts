import { ILogManager } from "./interfaces";

const Analytics = require('analytics-node');

/**
 * Segment class to allow for 
 * tracking only in production
 */
export default class Segment {
  private segment: any;
  private logger: ILogManager
  constructor(SEGMENT_IO_WRITE_KEY: string | undefined, logger: ILogManager) {
    this.segment = null;
    this.logger = logger;

    if(SEGMENT_IO_WRITE_KEY) {
      this.logger.info("Segment - Initializing...");
      this.segment = new Analytics(SEGMENT_IO_WRITE_KEY);
    } else {
      this.logger.warn("Segment - No write key supplied, skipping initialization...");
    }
  } 
  track(params) {
    if (this.segment) {
      this.logger.info(`Segment - Tracking event ${params.event}.`);
      this.segment.track(params);
    }
  }
  identify(params) {
    if (this.segment) {
      this.logger.info(`Segment - Identified user.`);
      this.segment.identify(params);
    }
  }
}
