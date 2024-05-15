import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';
import PbBroadcastProxy from '@sellout/service/.dist/PbBroadcastProxy';

export interface IServiceProxy {
  broadcast: pb.Broadcast.Publisher;
  feeService: pb.feeService;
  eventService: pb.EventService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    broadcast: new PbBroadcastProxy(conn).activate(),
    feeService: new PbServiceProxy<pb.FeeService>(conn, pb.FeeService.name)
      .activate(pb.FeeService),
    eventService: new PbServiceProxy<pb.EventService>(conn, pb.EventService.name)
      .activate(pb.EventService),
  };
}
