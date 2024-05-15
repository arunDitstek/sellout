export default interface ITicketHold {
  _id?: string;
  name: string;
  qty: number;
  ticketType:string;
  totalHeld:number;
  totalCheckedIn:number;
  totalReleased:number;
  totalOutstanding:number
  ticketTypeId: string;
  ticketRemaining?: number;
}
