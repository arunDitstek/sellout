export enum UpgradeTypeComplimentaryWithEnum {
  Order = 'Order',
  Ticket = 'Ticket',
};

export default interface IEventUpgrade {
  _id?: string;
  name: string;
  price: number;
  totalQty: number;
  remainingQty: number;
  purchaseLimit: number;
  complimentary: boolean;
  complimentaryWith: UpgradeTypeComplimentaryWithEnum;
  complimentaryQty: number;
  ticketTypeIds: string[];
  imageUrl: string;
  description: string;
  visible: boolean;
  rollFees: boolean;
  values?:string;
}
