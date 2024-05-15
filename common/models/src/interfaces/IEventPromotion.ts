export enum EventPromotionTypeEnum {
  PreSale = "Presale",
  Unlock = "Unlock",
  Discount = 'Discount',
  LimitOverride = "Limit Override"
}

export enum EventPromotionDiscountTypeEnum {
  Flat = "Flat",
  Percent = "Percent",
}

export enum EventPromotionAppliesToEnum {
  PerTicket = "Per Ticket",
  PerOrder = "Per Order",
}

export default interface IEventPromotion {
  _id?: string;
  code: string;
  type: EventPromotionTypeEnum;
  totalQty: number;
  overRideMax : number,
  overRideMaxUpg : number,
  remainingQty: number;
  ticketTypeIds: string[];
  upgradeIds: string[];
  active: boolean;
  startsAt: number;
  endsAt: number;
  useLimit: number;
  discountType: EventPromotionDiscountTypeEnum;
  discountValue: number;
  appliesTo:EventPromotionAppliesToEnum;

}
