import IFee from '@sellout/models/.dist/interfaces/IFee';
import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer from '@sellout/service/.dist/Tracer';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Joi from '@hapi/joi';
// import { DeleteWriteOpResultObject } from 'mongodb';
// import { UpdateWriteOpResult } from 'mongodb';

const tracer = new Tracer('FeeStore');

export default class FeeStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Fee;

  constructor(Fee) {
    this.Fee = Fee;
  }
  public async createFee(spanContext: string, fee: IFee): Promise<IFee> {
    const span = tracer.startSpan('createFee', spanContext);

    const schema = Joi.object().keys({
      name: Joi.string().required(),
      orgId: Joi.string().allow(null).optional(),
      eventId: Joi.string().optional().allow(null).allow(''),
      seasonId: Joi.string().optional().allow(null).allow(''),
      type: Joi.string().required(),
      value: Joi.number().required(),
      appliedTo: Joi.string().required(),
      appliedBy: Joi.string().required(),
      minAppliedToPrice: Joi.number().optional(),
      maxAppliedToPrice: Joi.number().optional(),
      filters: Joi.array().items(Joi.string()).default([]),
      paymentMethods: Joi.array().items(Joi.string()).default([]),
      createdBy: Joi.string().required(),
      createdAt: Joi.number().required(),
      updatedBy: Joi.string().required(),
      updatedAt: Joi.number().required(),
      disabled: Joi.boolean().required(),
      isApplyPlatformFee: Joi.boolean().optional().default(false)
    });

    const params = schema.validate(fee);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const newFee = new this.Fee(fee);

    let saveFee: IFee;
    try {
      saveFee = await newFee.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveFee;
  }
  public async updateFee(spanContext: string, orgId: string, fee: IFee): Promise<IFee> {
    const span = tracer.startSpan('updateFee', spanContext);

    const schema = Joi.object().keys({
      _id: Joi.string().required(),
      name: Joi.string().optional(),
      orgId: Joi.string().allow(null).optional(),
      eventId: Joi.string().allow(null).optional(),
      seasonId: Joi.string().allow(null).optional(),
      type: Joi.string().optional(),
      value: Joi.number().optional(),
      appliedTo: Joi.string().optional(),
      appliedBy: Joi.string().optional(),
      minAppliedToPrice: Joi.number().optional(),
      maxAppliedToPrice: Joi.number().optional(),
      filters: Joi.array().items(Joi.string()).default([]),
      paymentMethods: Joi.array().items(Joi.string()).default([]),
      createdBy: Joi.string().optional(),
      createdAt: Joi.number().optional(),
      updatedBy: Joi.string().optional(),
      updatedAt: Joi.number().optional(),
      disabled: Joi.boolean().optional()
    });

    const params = schema.validate(fee);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    try {
      fee = await this.Fee.findOneAndUpdate({ orgId, _id: fee._id }, { $set: fee }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fee;
  }

  public async updateEventOrSeasonFee(spanContext: string, eventId: string, seasonId: string, fee: IFee): Promise<IFee> {
    const span = tracer.startSpan('updateEventOrSeasonFee', spanContext);

    const schema = Joi.object().keys({
      _id: Joi.string().required(),
      name: Joi.string().optional(),
      orgId: Joi.string().allow(null).optional(),
      eventId: Joi.string().allow(null).optional(),
      seasonId: Joi.string().allow(null).optional(),
      type: Joi.string().optional(),
      value: Joi.number().optional(),
      appliedTo: Joi.string().optional(),
      appliedBy: Joi.string().optional(),
      minAppliedToPrice: Joi.number().optional(),
      maxAppliedToPrice: Joi.number().optional(),
      filters: Joi.array().items(Joi.string()).default([]),
      paymentMethods: Joi.array().items(Joi.string()).default([]),
      createdBy: Joi.string().optional(),
      createdAt: Joi.number().optional(),
      updatedBy: Joi.string().optional(),
      updatedAt: Joi.number().optional(),
      disabled: Joi.boolean().optional()
    });

    const params = schema.validate(fee);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }
    const { _id, ...rest } = fee
    try {
      if (eventId) {
        fee = await this.Fee.findOneAndUpdate({ eventId, _id: fee._id }, { $set: rest }, { new: true });
      } else {
        fee = await this.Fee.findOneAndUpdate({ seasonId, _id: fee._id }, { $set: rest }, { new: true });
      }

    } catch (e) {
      console.error(e);
      span.setTag('updateEventOrSeasonFee error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fee;
  }
  public async updateFeeByEvent(spanContext: string, eventId: string, seasonId: string, name: string, value: string): Promise<IFee> {
    const span = tracer.startSpan('updateFeeByEvent', spanContext);

    try {
      var fee = await this.Fee.findOneAndUpdate({ eventId, seasonId, name }, { $set: { value: value } }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('updateFeeByEvent error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fee;
  }
  public async disableFee(spanContext: string, orgId: string, updatedBy: string, feeId: string): Promise<IFee> {
    const span = tracer.startSpan('disableFee', spanContext);

    let fee: IFee;
    try {
      fee = this.Fee.findOneAndUpdate({ orgId, _id: feeId }, { $set: { disabled: true, updatedBy } }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fee;
  }
  public async deleteOrganizationFee(spanContext: string, orgId: string, feeId: string): Promise<Boolean> {
    const span = tracer.startSpan("deleteOrganizationFee", spanContext);
    // let result: DeleteWriteOpResultObject;
    let result: any;
    try {
      result = await this.Fee.deleteOne({ orgId, eventId: null, _id: feeId });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return result.deletedCount === 1;
  }

  public async deleteEventOrSeasonFee(spanContext: string, eventId: string, seasonId: string, feeId: string): Promise<Boolean> {
    const span = tracer.startSpan("deleteEventOrSeasonFee", spanContext);
    let result: any;
    try {
      if (eventId) {
        result = await this.Fee.deleteOne({ eventId, _id: feeId });
      } else {
        result = await this.Fee.deleteOne({ seasonId, _id: feeId });
      }

    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return result.deletedCount === 1;
  }

  public async deleteAllOrganizationFees(spanContext: string, orgId: string): Promise<Boolean> {
    const span = tracer.startSpan("deleteAllOrganizationFees", spanContext);
    let result: any;
    try {
      result = await this.Fee.deleteMany({ orgId, eventId: null });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return result.deletedCount === 1;
  }
  public async deletePlatformFee(spanContext: string, feeId: string): Promise<Boolean> {
    const span = tracer.startSpan('deletePlatformFee', spanContext);
    let result: any;
    try {
      result = await this.Fee.deleteOne({ orgId: null, eventId: null, _id: feeId });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return result.deletedCount === 1;
  }
  public async listFeesById(spanContext: string, orgId: string, feeIds: string[]): Promise<IFee[]> {
    const span = tracer.startSpan('listFeesById', spanContext);
    let fees: IFee[];
    try {
      fees = await this.Fee.find({ orgId, _id: { $in: feeIds } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fees;
  }
  public async listEventFees(spanContext: string, orgId: string, eventId: string, seasonId: string): Promise<IFee[]> {
    const span = tracer.startSpan('listEventFees', spanContext);
    let fees: IFee[];
    const filters: any = {
      disabled: false
      // appliedBy: { $ne : FeeAppliedByEnum.Organization }
    }
    try {
      if (seasonId) {
        filters.seasonId = seasonId
      } else {
        filters.eventId = eventId
      }
      fees = await this.Fee.find(filters);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fees;
  }
  public async listOrganizationFees(spanContext: string, orgId: string): Promise<IFee[]> {
    const span = tracer.startSpan('listOrganizationFees', spanContext);
    let fees: IFee[];
    try {
      fees = await this.Fee.find({ orgId, eventId: null, seasonId: null });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fees;
  }
  public async listPlatformFees(spanContext: string): Promise<IFee[]> {
    const span = tracer.startSpan('listPlatformFees', spanContext);
    let fees: IFee[];
    try {
      fees = await this.Fee.find({ orgId: null, eventId: null });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fees;
  }
  public async queryFees(spanContext: string, query: object, pagination: IPagination): Promise<IFee[]> {
    const span = tracer.startSpan('queryFees', spanContext);
    let fees: IFee[];
    try {
      if (pagination) {
        const { pageSize, pageNumber } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        fees = await this.Fee.find(query)
          .skip(skips)
          .limit(pageSize);
      } else {
        fees = await this.Fee.find(query);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fees;
  }
  public async findFeeById(spanContext: string, feeId: string): Promise<IFee> {
    const span = tracer.startSpan('findFeeById', spanContext);
    let fee: IFee;
    try {
      fee = await this.Fee.findById(feeId);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fee;
  }
  public async updateOneFee(spanContext: string, feeId: string, fee: IFee): Promise<IFee> {
    const span = tracer.startSpan('updateOneFee', spanContext);
    try {
      fee = this.Fee.findOneAndUpdate({ _id: feeId }, { $set: { ...fee } }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fee;
  }
  public async updateMany(spanContext: string): Promise<IFee[]> {
    const span = tracer.startSpan('updateMany', spanContext);
    let fees: IFee[];
    try {
      fees = await this.Fee.updateMany({ orgId: null, eventId: null }, { $set: { isApplyPlatformFee: true } }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new FeeStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return fees;
  }
}
