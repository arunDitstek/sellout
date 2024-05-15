export interface ISubscriptionRoutes {
  [routeName: string]: IMessageHandler;
}

export interface IConnectionManager {
  connect();
  close();
  on(event: string, cb: (...args: any[]) => void);
  send(
    serviceId: string,
    method: string,
    req: Buffer,
    cb: (error, reply) => void,
    timeout?: number
  );
  sendAsync(
    serviceId: string,
    method: string,
    req: Buffer,
    cb: (error, reply) => void,
    timeout?: number
  );
  sendBroadcast(messageId: string, req: Buffer, cb: (error, reply) => void);
  subscribe(serviceId: string, queue: string, routes: ISubscriptionRoutes);
  subscribeBroadcast(serviceId: string, routes: ISubscriptionRoutes);
}

export interface ILogManager {
  info(msg: string, ...params: string[]): void;
  warn(msg: string, ...params: string[]): void;
  error(msg: string, ...params: string[]): void;
}

export interface ILogManagerOpts {
  serviceName: string;
}

export interface IMessageHandler {
  process(req: Buffer): Promise<Buffer>;
}

export interface IServiceOpts {
  serviceName: string;
  connectionMgr: IConnectionManager;
  logManager: ILogManager;
  storageManager?: any;
}
