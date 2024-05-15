import * as pb from '@sellout/models/.dist/sellout-proto';
import Joi from '@hapi/joi';
import { Client } from 'plivo';
import BaseService from '@sellout/service/.dist/BaseService';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import Tracer  from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import {
  NATS_URL,
  PLIVO_AUTH_ID,
  PLIVO_AUTH_TOKEN,
} from './env';
const tracer = new Tracer('PlivoService');

const plivoClient = new Client(PLIVO_AUTH_ID, PLIVO_AUTH_TOKEN);
const SRC_PHONE = '18027320237';
// const SRC_PHONE_2 = '17326384375';

export default class PlivoService extends BaseService {
  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }

  public static main() {
    const serviceName = pb.PlivoService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new PlivoService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
    });
    service.run();
  }
  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on('connect', () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }
  public register() {
    this.connectionMgr.subscribe(this.serviceName, 'api', {
      sendPlivoSMS: new PbMessageHandler(
        this.sendPlivoSMS,
        pb.SendPlivoSMSRequest,
        pb.SendPlivoSMSResponse,
      ),
      sendPlivoMMS: new PbMessageHandler(
        this.sendPlivoMMS,
        pb.SendPlivoMMSRequest,
        pb.SendPlivoMMSResponse,
      ),
    });
  }

  public sendPlivoSMS = async(request: pb.SendPlivoSMSRequest): Promise<pb.SendPlivoSMSResponse> => {
    const span = tracer.startSpan('sendPlivoSMS', request.spanContext);
    const response: pb.SendPlivoSMSResponse = pb.SendPlivoSMSResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      message: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`sendPlivoSMS - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { phoneNumber, message } = params.value;


    // remove spaces, add US/CA aread code
    let formattedPhoneNumber = phoneNumber.replace(/\s+/g, '');
    if (phoneNumber.length === 12) {
      formattedPhoneNumber = `1${formattedPhoneNumber}`;
    }

    try {
      const sendPhoneVerificationResponse:any = await plivoClient.messages.create(
        SRC_PHONE,
        formattedPhoneNumber,
        message,
      )
      this.logger.info(phoneNumber);
      this.logger.info(sendPhoneVerificationResponse);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`sendPlivoSMS - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public sendPlivoMMS = async(request: pb.SendPlivoMMSRequest): Promise<pb.SendPlivoMMSResponse> => {
    const span = tracer.startSpan('sendPlivoMMS', request.spanContext);
    const response: pb.SendPlivoMMSResponse = pb.SendPlivoMMSResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      message: Joi.string().required(),
      mediaUrl: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`sendPlivoMMS - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { phoneNumber, message, mediaUrl } = params.value;


    // remove spaces, add US/CA aread code
    let formattedPhoneNumber = phoneNumber.replace(/\s+/g, '');
    if (phoneNumber.length === 12) {
      formattedPhoneNumber = `1${formattedPhoneNumber}`;
    }

    try {
      const sendPhoneVerificationResponse:any = await plivoClient.messages.create(
        SRC_PHONE,
        formattedPhoneNumber,
        message,
        {
          type: 'mms',
          media_urls: [mediaUrl],
        });
      this.logger.info(phoneNumber);
      this.logger.info(sendPhoneVerificationResponse);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`sendPlivoMMS - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
}