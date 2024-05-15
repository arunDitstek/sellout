export default interface IRefund {
  refunded: boolean;
  refundedAt: number;
  refundedBy: string;
  refundedAmount: number;
  refundReason:string;
}
