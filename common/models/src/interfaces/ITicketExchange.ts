export enum TicketExchangeAllowedEnum {
  Always = "Always",
  Never = 'Never',
  After = 'After event is sold out',
  Percent = 'After a percent of tickets are sold',
}

export default interface ITicketExchange {
  allowed: TicketExchangeAllowedEnum
  percent: number;
}
