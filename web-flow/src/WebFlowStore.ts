import IWebFlow, { IWebFlowSite, IWebFlowEntity } from '@sellout/models/.dist/interfaces/IWebFlow';
import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer  from '@sellout/service/.dist/Tracer';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import Joi from '@hapi/joi';

const tracer = new Tracer('WebFlowStore');

export default class WebFlowStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private WebFlow;

  constructor(WebFlow) {
    this.WebFlow = WebFlow;
  }
  public async createWebFlow(spanContext: string, webFlow: IWebFlow): Promise<IWebFlow> {
    const span = tracer.startSpan('createWebFlow', spanContext);

    const schema = Joi.object().keys({
      orgId: Joi.string().required(),
      entities: Joi.array().required(),
      createdAt: Joi.number().required(),
      updatedAt: Joi.number().required(),
    });

    const params = schema.validate(webFlow);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const newWebFlow = new this.WebFlow(webFlow);

    let saveWebFlow: IWebFlow;
    try {
      saveWebFlow = await newWebFlow.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new WebFlowStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveWebFlow;
  }
  public async createWebFlowSite(spanContext: string, orgId: string, webFlowSite: IWebFlowSite): Promise<IWebFlow> {
    const span = tracer.startSpan('createWebFlowSite', spanContext);
    let webFlow: IWebFlow;
    try {
      webFlow = this.WebFlow.findOneAndUpdate({ orgId }, { $push: { sites: webFlowSite }  }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new WebFlowStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return webFlow;
  }
  public async createWebFlowEntity(spanContext: string, orgId: string, webFlowEntity: IWebFlowEntity): Promise<IWebFlow> {
    const span = tracer.startSpan('createWebFlowEntity', spanContext);
    let webFlow: IWebFlow;
    try {
      webFlow = this.WebFlow.findOneAndUpdate({ orgId }, { $push: { entities: webFlowEntity }  }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new WebFlowStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return webFlow;
  }
  public async updateOrganizationWebFlow(spanContext: string, orgId: string, webFlow: IWebFlow): Promise<IWebFlow> {
    const span = tracer.startSpan('updateOrganizationWebFlow', spanContext);
    let newWebFlow: IWebFlow;
    try {
      newWebFlow = this.WebFlow.findOneAndUpdate({ orgId }, webFlow, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new WebFlowStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return newWebFlow;
  }
  public async findOrganizationWebFlow(spanContext: string, orgId: string): Promise<IWebFlow> {
    const span = tracer.startSpan('findOrganizationWebFlow', spanContext);
    let webFlow: IWebFlow;
    try {
      webFlow = await this.WebFlow.findOne({ orgId });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new WebFlowStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return webFlow;
  }
  public async findAllWebFlows(spanContext: string): Promise<IWebFlow[]> {
    const span = tracer.startSpan('findOrganizationWebFlow', spanContext);
    let webFlows: IWebFlow[];
    try {
      webFlows = await this.WebFlow.find();
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new WebFlowStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return webFlows;
  }
}
