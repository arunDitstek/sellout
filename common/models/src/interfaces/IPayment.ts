import { PaymentMethodTypeEnum } from '../enums/PaymentMethodTypeEnum';
export default interface IPayment {
  _id?: string;
  paymentIntentId?: string;
  amount: number;
  chargeId?: string;
  transferAmount: number;
  feeAmount: number;
  feeIds: string[];
  tax?: number;
  createdAt: number;
  createdBy: string;
  promotionCode?: string;
  discountCode?: string;
  paymentMethodType: PaymentMethodTypeEnum;
  discount:number
}
