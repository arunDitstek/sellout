export default interface ITicketTier {
  _id?: string;
  name: string;
  price: number;
  startsAt: number | null;
  endsAt: number | null;
  totalQty: number;
  remainingQty: number;
}
