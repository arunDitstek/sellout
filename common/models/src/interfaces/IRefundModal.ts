export default interface IRefundModal {
  orderId: string;
  ticketIds: string[];
  upgradeIds: string[];
  refundAmount: number;
  refundReason: string;
  processingFee: boolean;
  promoterFee: boolean;
}
