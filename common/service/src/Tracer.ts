import { initTracer, Span, SpanContext } from 'jaeger-client';
const JAEGER_AGENT_HOST = process.env.JAEGER_AGENT_HOST;

// console.log(`Jaeger Agent Host: ${JAEGER_AGENT_HOST}`);

export default class Tracer {

  serviceName: string;
  logger: any;
  tracer: any;

  constructor(serviceName: string, logger: any = console, verbose: boolean = true) {
    this.serviceName = serviceName;
    this.logger = logger ? logger : console;
    try {
      this.tracer = initTracer(this.config(verbose), this.options());
    } catch (error) {
      console.log(error, 'err', this.tracer) 
      this.tracer = null    
    }
  }

  config(verbose: boolean) {
    return {
      serviceName: this.serviceName,
      sampler: {
        type: "const",
        param: 1
      },
      reporter: {
        // agentHost: 'jaeger-agent',
        agentHost: JAEGER_AGENT_HOST,
        // agentHost: 'foobar',
        // collectorEndpoint: "http://localhost:14268/api/traces",
        logSpans: verbose
      }
    };
  }

  options() {
    const options = {
      logger: this.logger,
    };

    return options;
  }

  startSpan(name: string, parentSpan?: (Span | SpanContext | string)) {
    let childOf;

    if (typeof parentSpan === 'string') {
      childOf = SpanContext.fromString(parentSpan);
    } else if (parentSpan instanceof Span) {
      childOf = parentSpan.context();
    } else if (parentSpan instanceof SpanContext) {
      childOf = parentSpan;
    }
    return this.tracer.startSpan(name, { childOf });
  }
}
