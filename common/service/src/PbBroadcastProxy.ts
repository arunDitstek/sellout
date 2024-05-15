import { Broadcast } from "@sellout/models/.dist/sellout-proto";
import { IConnectionManager } from './interfaces';
import { PbServiceProxy } from './PbServiceProxy';

export default class PbBroadcastProxy extends PbServiceProxy<Broadcast.Publisher> {
  constructor(conn: IConnectionManager) {
    super(conn, 'BROADCAST');
  }

  public activate(svc = Broadcast.Publisher): Broadcast.Publisher {
    return super.activate(svc, true);
  }

  /**
   * Provides handler logic for RPC sender. Note: use of arrow function
   * required to maintain instance context.
   *
   * @param method
   * @param requestData
   * @param callback
   */
  protected sendRpcImpl = (method, requestData, callback) => {
    throw('PbBroadcastProxy does not support synchronous calls');
  }

  /**
   * Provides handler logic for RPC sender. Note: use of arrow function
   * required to maintain instance context.
   *
   * @param method
   * @param requestData
   * @param callback
   */
  protected sendRpcImplAsync = (method, requestData, callback) => {
    try {
      this.conn.sendBroadcast(method.name, requestData, callback);
    } catch (e) {
      callback(e, null);
    }
  }
}
