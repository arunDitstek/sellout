import Tracer from './Tracer';
import * as url from 'url';

const traceHTTP = (req, res, tracer): void => {
  const pathname = url.parse(req.url).pathname;
  const span = tracer.startSpan(<string>pathname);
  span.logEvent('request_recieved');
  span.setTag('span.kind', 'server');
  span.setTag('http.method', req.method);
  span.setTag('http.url', req.url);
  
  res.setHeader('uver-trace-id', span.context().toString());
  
  req.span = span;
  req.tracer = tracer;

  const finish = () => {
    span.logEvent('request_finished');
    span.setTag('http.status_code', res.statusCode);
    if(res.statusCode >= 500) {
      span.setTag('error', true);
      span.setTag('sampling.priority', 1);
    }
    span.finish();
  };
  
  res.on("finish", finish);
};

export const tracerExpress = (serviceName: string) => {
  const tracer = new Tracer(serviceName);
  return async (req, res, next): Promise<void> => {
    traceHTTP(req, res, tracer);
    next();
  }
};
