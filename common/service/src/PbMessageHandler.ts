/**
 * Provides a wrapper around Protobuf messages. Incoming buffers are decoded, the
 * handler method is called using staticly-compiled Protobuf definitions, and returned
 * reponse objects are encoded and marshalled into Buffer.
 */
export class PbMessageHandler {

  public method;
  public requestCls;
  public responseCls;

  /**
   * @constructor
   * @param method - Message handler method to be invoked
   * @param requestCls - Request class provided by Protobuf
   * @param responseCls - Response class provided by Protobuf
   */
  constructor(method, requestCls, responseCls) {
    this.method = method;
    this.requestCls = requestCls;
    this.responseCls = responseCls;
  }

  /**
   * Invoke registered message handler.
   *
   * @param {Buffer} req - Incoming request
   * @returns {Promise<Buffer>} - Promise for buffer containing encoded response object
   */
  public process(req: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const decoded = this.requestCls.decode(req);
      // Pass plain JS object. I think this is a good idea? 
      // Idk about the performance but we'll see :)
       // TODO: enable defaults when decoding messages
      const reqObj = this.requestCls.toObject(decoded);
      this.method(reqObj).then((respObj) => {
        const respEncoded = this.responseCls.encode(respObj).finish();
        resolve(respEncoded);
      })
        .catch((e) => {
          console.log(`Error processing message for method = ${this.method}`);
          reject(e);
        });
    });
  }
}

export default PbMessageHandler;
