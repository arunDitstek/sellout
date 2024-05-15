import IRefund from './IRefund';

export default interface IProcessingFee {
  refund: IRefund;
  amount: number;
};
