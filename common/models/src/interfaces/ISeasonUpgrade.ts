export default interface ISeasonUpgrade {
  _id?: string;
  name: string;
  price: number;
  totalQty: number;
  remainingQty: number;
  purchaseLimit: number;
  complimentary: boolean;
  complimentaryQty: number;
  ticketTypeIds: string[];
  imageUrl: string;
  description: string;
  visible: boolean;
  rollFees: boolean;
  values?: string;
}
