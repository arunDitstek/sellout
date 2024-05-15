import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from './proxyProvider';
import Tracer  from '@sellout/service/.dist/Tracer';
import { NODE_ENV } from './env';

const tracer = new Tracer('AuthenticateHostname');

class HostnameCache {
  public hostnames: string[];
  public interval: NodeJS.Timer;
  public proxy: IServiceProxy;

  constructor(proxy) {
    this.hostnames = [];
    // this.interval = setInterval(() => this.refreshHostnames(), 30000);
    this.proxy = proxy;
    this.refreshHostnames();
  }

  async refreshHostnames() {
    let span = tracer.startSpan('authenticateHostname')
    let request = pb.ListOrganizationUrlsRequest.create({
      spanContext: span.context().toString(),
    });

    let response;
    try {
      response = await this.proxy.organizationService.listOrganizationUrls(request);
      if (response.status !== pb.StatusCode.OK) {
        throw new Error(`listOrganizationUrls returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(e);
      span.setTag("error", true);
      span.log({ errors: e.message  });
      span.finish();
      return;
    }
    this.hostnames = response.orgUrls;
    span.finish();
    return;
  }
}

export const authenticateHostname = proxy => {
  let cache = new HostnameCache(proxy);

  return async (req, res, next) => {
    req.hostnameIsValid = true;
    next();
    return;
    const isDev = NODE_ENV === 'development';
    const isLocal = req.get('host') === 'localhost:4000';
    const origin = req.get('origin');

    const devHostnames: string[] = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'https://embed.sellout.cool',
      'https://app.sellout.cool',
      'https://graphql.sellout.cool'
    ];

    let validHostnames: string[] = cache.hostnames;
    
    if(isDev) {
      validHostnames = validHostnames.concat(devHostnames);
    }

    if (validHostnames.find(h => h === origin) || (isDev && isLocal)) {
      console.log('host found, next!');
      req.hostnameIsValid = true;
      next();
    } else {
      req.hostnameIsValid = false;
      console.log(`hostname ${origin} is invalid!`);
      return res.status(401).send();
    }
  }
}
