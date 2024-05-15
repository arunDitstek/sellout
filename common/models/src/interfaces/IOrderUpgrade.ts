import IRefund from './IRefund';
import IScan from './IScan';
import { OrderItemStateEnum } from './IOrderState';

export default interface IOrderUpgrade {
  _id?: string;
  name: string;
  upgradeId: string;
  price: number;
  rollFees: boolean;
  paymentId: string | null;
  refund: IRefund;
  scan: IScan;
  state: OrderItemStateEnum;
  qrCodeUrl?: string;
}
