import { IConnectionManager } from '@sellout/service/.dist/interfaces';
// import * as pb from '@sellout/models/.dist/sellout-proto';
// import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';

export interface IServiceProxy {}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {};
}
