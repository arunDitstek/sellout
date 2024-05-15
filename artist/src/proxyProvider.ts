import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
// import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';
import PbBroadcastProxy from '@sellout/service/.dist/PbBroadcastProxy';

export interface IServiceProxy {
  broadcast: pb.Broadcast.Publisher;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    broadcast: new PbBroadcastProxy(conn).activate(),
  };
}
