import * as pb from "@sellout/models/.dist/sellout-proto";
import { PbMessageHandler } from './PbMessageHandler';


/* Message handler wrapper method for unidirectional calls */
function invokeWithEmptyResponse(method) {
  return (req: Buffer) => method(req).then(() => Promise.resolve(pb.google.protobuf.Empty.create()));
}

/**
 * Provides a wrapper around asynchronous Protobuf messages that don't return a response.
 * Incoming buffers are decoded, the handler method is called using staticly-compiled
 * Protobuf definitions.
 */
export class PbAsyncMessageHandler extends PbMessageHandler {

  /**
   * @constructor
   * @param method - Message handler method to be invoked
   * @param requestCls - Request class provided by Protobuf
   */
  constructor(method, requestCls) {
    super(invokeWithEmptyResponse(method), requestCls, pb.google.protobuf.Empty);
  }

}

export default PbAsyncMessageHandler;
