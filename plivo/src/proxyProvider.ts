// import { IConnectionManager } from '@sellout/service/.dist/interfaces';
// import * as pb from '@sellout/sellout-common/dist/sellout-proto';
// import PbServiceProxy from '@sellout/sellout-common/dist/PbServiceProxy';
import { IConnectionManager } from '@sellout/service/.dist/interfaces';
export interface IServiceProxy {}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {};
}
