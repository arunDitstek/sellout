import * as pb from "@sellout/models/.dist/sellout-proto";
import Joi from "@hapi/joi";
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from "@sellout/service/.dist/ConsoleLogManager";
import NatsConnectionManager from "@sellout/service/.dist/NatsConnectionManager";
import PbMessageHandler from "@sellout/service/.dist/PbMessageHandler";
import joiToErrors from "@sellout/service/.dist/joiToErrors";
import Tracer from "@sellout/service/.dist/Tracer";
import IFile from "@sellout/models/.dist/interfaces/IFile";
import { IServiceProxy, proxyProvider } from "./proxyProvider";
import { NATS_URL } from "./env";
import { Storage } from "@google-cloud/storage";
import { Duplex } from "stream";
import {
  // GCP_PROJECT_ID,
  GCP_BUCKET_NAME,
} from "./env";

function bufferToStream(buffer) {
  const stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${GCP_BUCKET_NAME}/${filename}`;
}

const tracer = new Tracer("FileUploadService");
const storage = new Storage();

export default class FileUploadService extends BaseService {
  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.FileUploadService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new FileUploadService({
      serviceName,
      connectionMgr: new NatsConnectionManager(
        [<string>NATS_URL],
        logger,
        true
      ),
      logManager: logger,
    });
    service.run();
  }
  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on("connect", () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }
  public register() {
    this.connectionMgr.subscribe(this.serviceName, "api", {
      /**
       * Incoming Message Handlers
       */
      uploadFile: new PbMessageHandler(
        this.uploadFile,
        pb.UploadFileRequest,
        pb.UploadFileResponse
      ),
    });
  }
  private toPb = (file: IFile): IFile => {
    if (!file) {
      return new pb.File();
    }

    const pbFile = Object.assign(new pb.File(), {
      file: file.file,
      filename: file.filename,
      mimetype: file.mimetype,
      encoding: file.encoding,
      url: file.url,
    });

    return pbFile;
  };

  private uploadToStorage = async (
    buffer: Buffer,
    mimetype: string,
    name: string,
    orgId: string,
    userId: string,
    gzip: string,
  ): Promise<any> => {
    // const filename = `orgId:${orgId || "none"}-userId:${
    //   userId || "none"
    // }-${Date.now().toString()}-${name}`.replace(" ", "");

    const filename = `orgId-${orgId || "none"}-userId-${
      userId || "none"
    }-${Date.now().toString()}-${name}`.replace(" ", "");
    
    const bucket = storage.bucket(GCP_BUCKET_NAME);
    const file = bucket.file(filename);
    const options = {
      // gzip must be disabled when uploading
      // QR codes or Plivio MMS breaks
      gzip,
      resumable: false,
      metadata: {
        contentType: mimetype,
        cacheControl: "public, max-age=31536000",
      },
    };

    return new Promise((resolve, reject) => {
      bufferToStream(buffer)
        .pipe(file.createWriteStream(options))
        .on("error", function (err) {
          console.log(err); // ignore for now
        })
        .on("finish", function () {
          file.makePublic().then(() => {
            resolve(getPublicUrl(filename));
          });
        });
    });
  };

  public uploadFile = async (
    request: pb.UploadFileRequest
  ): Promise<pb.UploadFileResponse> => {
    const span = tracer.startSpan("uploadFile", request.spanContext);
    const response: pb.UploadFileResponse = pb.UploadFileResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      userId: Joi.string().optional(),
      files: Joi.array().required(),
      gzip: Joi.bool().optional().default(true),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`uploadFile - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, userId, files, gzip } = params.value;


    try {
      const responses = await Promise.all(
        files.map(async (f) => {
          const { file, filename, mimetype, encoding } = f;
          const response = {
            filename,
            mimetype,
            encoding,
            url: await this.uploadToStorage(file, mimetype, filename, orgId, userId, gzip),
          };

          return this.toPb(response);
        })
      );
      response.status = pb.StatusCode.OK;
      response.files = responses;
    } catch (e) {
      this.logger.error(`uploadFile - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };
}
