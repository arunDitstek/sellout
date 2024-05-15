import Joi from "@hapi/joi";
import IFee from "src/interfaces/IFee";

export default {
  processingFees(fees: any[] = []) {
    return fees.filter((fee) => {
      if (fee.appliedBy === "Sellout" || fee.appliedBy === "Stripe") {
        return true;
      }
      return false;
    });
  },
  selloutFees(fees: any[] = []) {
    return fees.filter((fee) => {
      if (fee.appliedBy === "Sellout") {
        return true;
      }
      return false;
    });
  },
  stripeFees(fees: any[] = []) {
    return fees.filter((fee) => {
      if (fee.appliedBy === "Stripe") {
        return false;
      }
      return true;
    });
  },
  organizationFees(fees: any[] = []) {
    return fees.filter((fee) => {
      if (fee.appliedBy === "Organization") {
        return false;
      }
      return true;
    });
  },
  promoterFees(fees: any[] = []) {
    return fees?.filter((fee) => {
      if (fee.appliedBy === "Sellout" || fee.appliedBy === "Stripe") {
        return false;
      }
      return true;
    });
  },

  taxFees(fees: any[] = []) {
    return fees.filter((fee) => {
      if (fee.name.toLowerCase() === "sales tax") {
        return true;
      }
      return false;
    });
  },
  /****************************************************************************************
   * Fee  validate
   ****************************************************************************************/
  validateFee(fee: IFee): any {
    let feeSchema;
    feeSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        name: Joi.string()
          .required()
          .messages({ "string.empty": '"Fee Name" is a required field.' }),
        type: Joi.string().required(),
        value: Joi.number().required().min(1).messages({
          "number.required": '"Price" is a required field.',
          "number.min": '"Price" must be greater than 0.',
        }),
        appliedTo: Joi.string().required(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().items(Joi.string()).default([]),
        appliedBy: Joi.string().required(),
      })
      .unknown(true);
    return feeSchema.validate(fee);
  },
};
