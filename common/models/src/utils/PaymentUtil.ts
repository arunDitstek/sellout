import FeeUtil from "./FeeUtil";
import {
  ICreateOrderTicketParams,
  ICreateOrderUpgradeParams,
} from "../interfaces/ICreateOrderParams";
import IFee, {
  FeeAppliedToEnum,
  FeeFiltersEnum,
  FeeTypeEnum,
  FeeAppliedByEnum,
  // FeePaymentMethodEnum
} from "../interfaces/IFee";
import { PaymentMethodTypeEnum } from "../enums/PaymentMethodTypeEnum";
import IEventPromotion, {
  EventPromotionAppliesToEnum,
  EventPromotionDiscountTypeEnum,
} from "../interfaces/IEventPromotion";
// import EventPromotionDiscountTypeEnum from '../interfaces/I'
// import Fee from "src/schemas/Fee";

interface IPaymentCalculatorParams {
  tickets: ICreateOrderTicketParams[];
  upgrades: ICreateOrderUpgradeParams[];
  fees: IFee[];
  paymentMethodType: PaymentMethodTypeEnum;
  promotions?: IEventPromotion[];
}

// interface IOrderItems {
//   tickets: ICreateOrderTicketParams[];
//   upgrades: ICreateOrderUpgradeParams[];
// }

class PaymentUtil {
  // DOES NOT WORK! Work in Progress :)
  // calculateOrderItemPrices(params: IPaymentCalculatorParams): IOrderItems {

  //   let {
  //     tickets = [],
  //     upgrades = [],
  //     fees = [],
  //     paymentMethodType,
  //   } = params;

  //   // Filter fees
  //   fees = fees.filter((fee: IFee) => {
  //     // Ignore card reader fees for non card reader payemnts
  //     if (fee.filters && fee.filters.includes(FeeFiltersEnum.CardReader) && paymentMethodType !== PaymentMethodTypeEnum.CardReader) {
  //       return false;
  //     }

  //     // Ignore card entry fees for non card entry payemnts
  //     if (fee.filters && fee.filters.includes(FeeFiltersEnum.CardEntry) && paymentMethodType !== PaymentMethodTypeEnum.CardEntry) {
  //       return false;
  //     }

  //     return true;
  //   });

  //   const ticketFees = fees.filter(f => f.appliedTo === FeeAppliedToEnum.Ticket)
  //     .sort(({ type }) => {
  //       if (type === FeeTypeEnum.Flat) return -1;
  //       else return 1;
  //     });
  //   const upgradeFees = fees.filter(f => f.appliedTo === FeeAppliedToEnum.Upgrade);
  //   // Orders mattes here. Flat type fees must be applied before Percent type fees
  //   const orderFees = fees.filter(f => f.appliedTo === FeeAppliedToEnum.Order)
  //   .sort(({ type }) => {
  //     if (type === FeeTypeEnum.Percent) return -1;
  //     else return 1;
  //   })
  //   .map(fee => {
  //     if(fee.type === FeeTypeEnum.Flat) {
  //       return {
  //         ...fee,
  //         value: fee.value / tickets.length,
  //       }
  //     }
  //     else return fee;
  //   });

  //   const reverseApplyFee = (price: number, ticket: ICreateOrderTicketParams, fee: IFee): number => {
  //     // Ignore seated fees
  //     if (fee.filters && fee.filters.includes(FeeFiltersEnum.Seated) && !ticket.seat) {
  //       return price;
  //     }

  //     const minFee = fee.minAppliedToPrice || 0;
  //     const maxFee = fee.maxAppliedToPrice || Infinity;

  //     if (minFee <= price && price <= maxFee) {
  // console.log(fee);
  //       if (fee.type === FeeTypeEnum.Flat) {
  //         return price - fee.value;
  //       } if (fee.type === FeeTypeEnum.Percent) {
  //         return price * (1 - fee.value / 100);
  //       }
  //     }

  //     // if(fee.type === FeeTypeEnum.Percent) {
  //     //   return price * (1 - fee.value / 100);
  //     // }

  //     // if(fee.type === FeeTypeEnum.Flat) {
  //     //   return price - fee.value;
  //     // }

  //     return price;
  //   }

  //   function calculateTicketPrice(ticket: ICreateOrderTicketParams): number {
  //     if(!ticket.rollFees) return ticket.price;

  //     const allFees = [...orderFees, ...ticketFees];

  //     return allFees.reduce((cur, fee) => {
  //       const next = reverseApplyFee(cur, ticket, fee);
  //       return next;
  //     }, ticket.price);

  //   }

  //   tickets = tickets.map((ticket: ICreateOrderTicketParams): ICreateOrderTicketParams => {
  //     const price = Math.floor(calculateTicketPrice(ticket));
  // console.log(`Ticket Price: `, price);
  //     return {
  //       ...ticket,
  //       price,
  //     }
  //   });

  //   // upgrades = upgrades.map((upgrade: ICreateOrderUpgradeParams): ICreateOrderUpgradeParams => {
  //   //   return {
  //   //     ...upgrade,
  //   //     price: calculateUpgradePrice(upgrade),
  //   //   }
  //   // });

  //   return {
  //     tickets,
  //     upgrades,
  //   };
  // },

  calculatePaymentTotal(params: IPaymentCalculatorParams): any {
    let {
      tickets = [],
      upgrades = [],
      fees = [],
      paymentMethodType,
      promotions = [],
    } = params;

    // No items, total is always 0
    if (!tickets.length && !upgrades.length) return 0;

    const ticketFeesPromoCodePercent = promotions?.filter(
      (f) =>
        f.appliesTo === EventPromotionAppliesToEnum.PerTicket &&
        f.discountType === EventPromotionDiscountTypeEnum.Percent
    );

    const discountFeePercentPerTicketTotal = tickets?.reduce((cur, ticket) => {
      return (
        cur +
        ticketFeesPromoCodePercent?.reduce((cur, promotion) => {
          const value = cur + applyTicketDiscount(ticket, promotion);
          return value;
        }, 0)
      );
    }, 0);

    // console.log(
    //   "++++++++++++eee+>>>>>>>>>>>>",
    //   discountFeePercentPerTicketTotal
    // );


    if (promotions?.length) {
      tickets = tickets.map(ticket => {
        if (promotions && promotions[0].discountType === EventPromotionDiscountTypeEnum.Flat && promotions[0].appliesTo === EventPromotionAppliesToEnum.PerTicket) {
          if (promotions[0]?.ticketTypeIds.length == 0) {
            const discountValue = Number(promotions[0].discountValue);
            const originalPrice = ticket.price;
            const discountedPrice = originalPrice - discountValue;
            return {
              ...ticket,
              price: discountedPrice
            };
          } else {
            if (promotions[0]?.ticketTypeIds.includes(ticket?.ticketTypeId)) {
              const discountValue = Number(promotions[0].discountValue);
              const originalPrice = ticket.price;
              const discountedPrice = originalPrice - discountValue;
              return {
                ...ticket,
                price: discountedPrice
              };
            } else {
              const originalPrice = ticket.price;
              return {
                ...ticket,
                price: originalPrice
              };
            }
          }
        }
        if (promotions && promotions[0].discountType === EventPromotionDiscountTypeEnum.Percent && promotions[0].appliesTo === EventPromotionAppliesToEnum.PerTicket) {

          if (promotions[0]?.ticketTypeIds.length == 0) {
            const discountValue = Number(promotions[0].discountValue);
            const percentTicketValue = (ticket.origionalPrice * discountValue) / 100
            const originalPrice = ticket.price;
            const discountPercentPrice = originalPrice - percentTicketValue;
            return {
              ...ticket,
              price: discountPercentPrice
            };
          } else {

            if (promotions[0]?.ticketTypeIds.includes(ticket?.ticketTypeId)) {
              const discountValue = Number(promotions[0].discountValue);
              const percentTicketValue = (ticket.origionalPrice * discountValue) / 100
              const originalPrice = ticket.price;
              const discountPercentPrice = originalPrice - percentTicketValue
              // const discountedPrice = originalPrice
              // console.log("percentTicketValue",percentTicketValue);

              return {
                ...ticket,
                price: discountPercentPrice
              };
            }
            else {
              const originalPrice = ticket.price;
              return {
                ...ticket,
                price: originalPrice
              };
            }
          }
        }

        return ticket;
      })
    }

    // Filter fees
    fees = fees.filter((fee: IFee) => {
      if (!fee?.paymentMethods || fee?.paymentMethods?.length == 0) {
        return true;
      } else if (fee?.paymentMethods?.includes(paymentMethodType as any)) {
        return true;
      } else {
        return false;
      }

      // fee.paymentMethods.includes(paymentMethodType)
      // fee?.paymentMethods?.includes(paymentMethodType)

      // let isPayment = paymentMethodType !==  fee?.paymentMethods?.includes(paymentMethodType) || PaymentMethodTypeEnum.Check || PaymentMethodTypeEnum.None ||  PaymentMethodTypeEnum.CardReader ? true: false;

      // console.log("isPayment ++++>>",isPayment)

      // if (
      //   fee.paymentMethods &&
      //   fee.paymentMethods.includes(FeePaymentMethodEnum.CardReader) &&
      //   paymentMethodType !== PaymentMethodTypeEnum.CardReader
      // ) {
      //   return false;
      // }

      // if (
      //   fee.paymentMethods &&
      //   fee.paymentMethods.includes(FeePaymentMethodEnum.CardEntry) &&
      //   paymentMethodType !== PaymentMethodTypeEnum.CardEntry
      // ) {
      //   return false;
      // }

      // if (
      //   fee.paymentMethods &&
      //   fee.paymentMethods.includes(FeePaymentMethodEnum.Cash) &&
      //   paymentMethodType !== PaymentMethodTypeEnum.Cash
      // ) {
      //   return false;
      // }

      // if (
      //   fee.paymentMethods &&
      //   fee.paymentMethods.includes(FeePaymentMethodEnum.Check) &&
      //   paymentMethodType !== PaymentMethodTypeEnum.Check
      // ) {
      //   return false;
      // }

      // Ignore card reader fees for non card reader payemnts
      // if (
      //   fee.filters &&
      //   fee.filters.includes(FeeFiltersEnum.CardReader) &&
      //   paymentMethodType !== PaymentMethodTypeEnum.CardReader
      // ) {
      //   return false;
      // }

      // if (fee.appliedBy == FeeAppliedByEnum.Stripe && (paymentMethodType == PaymentMethodTypeEnum.Cash || paymentMethodType == PaymentMethodTypeEnum.Check)) {
      //   return false;
      // }

      // // Ignore card entry fees for non card entry payemnts
      // if (
      //   fee.filters &&
      //   fee.filters.includes(FeeFiltersEnum.CardEntry) &&
      //   paymentMethodType !== PaymentMethodTypeEnum.CardEntry
      // ) {
      //   return false;
      // }

      // return true;
    });

    let guestFees = fees.filter(
      (fee: IFee) => fee.filters && fee.filters[0] == FeeFiltersEnum.GuestTicket
    );

    fees = fees.filter(
      (fee: IFee) =>
        fee.filters && fee.filters[0] !== FeeFiltersEnum.GuestTicket
    );

    function applyGuestTicketFee(
      ticket: ICreateOrderTicketParams,
      fee: IFee
    ): number {
      // Ignore seated fees if not seated
      if (
        fee.filters &&
        fee.filters.includes(FeeFiltersEnum.Seated) &&
        !ticket.seat
      ) {
        return 0;
      }

      if (!ticket.guestTicket) {
        return 0;
      }

      const minFee = fee.minAppliedToPrice || 0;
      const maxFee = fee.maxAppliedToPrice || Infinity;

      if (minFee <= ticket.price && ticket.price <= maxFee) {
        if (fee.type === FeeTypeEnum.Flat) {
          return fee.value;
        }
        if (fee.type === FeeTypeEnum.Percent) {
          return (ticket.price * fee.value) / 100;
        }
      } else {
        return 0;
      }

      return 0;
    }

    // Discount codes apply

    // const isDiscount = promotions?.filter((f) => f.discountValue);
    // console.log(isDiscount,"isDiscount");


    const ticketFeesPromoCodeFlat = promotions?.filter(
      (f) =>
        f.appliesTo === EventPromotionAppliesToEnum.PerTicket &&
        f.discountType === EventPromotionDiscountTypeEnum.Flat
    );


    // const ticketFeesPromoCodePercent = promotions?.filter(
    //   (f) =>
    //     f.appliesTo === EventPromotionAppliesToEnum.PerTicket &&
    //     f.discountType === EventPromotionDiscountTypeEnum.Percent
    // );

    // const ticketFeesPromoCodeFlatPerOrder = promotions?.filter(
    //   (f) =>
    //     f.appliesTo === EventPromotionAppliesToEnum.PerOrder &&
    //     f.discountType === EventPromotionDiscountTypeEnum.Flat
    // );

    // const ticketFeesPromoCodePercentPerOrder = promotions?.filter(
    //   (f) =>
    //     f.appliesTo === EventPromotionAppliesToEnum.PerOrder &&
    //     f.discountType === EventPromotionDiscountTypeEnum.Percent
    // );


    // Fees applied
    const ticketFeesPromotersFlat = fees.filter(
      (f) =>
        f.appliedTo === FeeAppliedToEnum.Ticket &&
        f.appliedBy == FeeAppliedByEnum.Organization &&
        f.type === FeeTypeEnum.Flat
    );
    const ticketFeesPromotersPercent = fees.filter(
      (f) =>
        f.appliedTo === FeeAppliedToEnum.Ticket &&
        f.appliedBy == FeeAppliedByEnum.Organization &&
        f.type === FeeTypeEnum.Percent
    );

    const upgradeFeesPromotersFees = fees.filter(
      (f) =>
        f.appliedTo === FeeAppliedToEnum.Upgrade &&
        f.appliedBy == FeeAppliedByEnum.Organization
    );

    const upgradeFeesSelloutFees = fees.filter(
      (f) =>
        f.appliedTo === FeeAppliedToEnum.Upgrade &&
        f.appliedBy == FeeAppliedByEnum.Sellout
    );

    const selloutFees: any = fees.filter(
      (f) => f.appliedBy == FeeAppliedByEnum.Sellout
      // (f) => f.appliedTo === FeeAppliedToEnum.Upgrade && f.appliedBy == FeeAppliedByEnum.Sellout
    );
    // sales tax fee
    const salesTaxFees = fees.find((f) => f.name == "Sales tax");
    const stripeFees = fees.filter(
      (f) => f.appliedBy == FeeAppliedByEnum.Stripe
    );
    // Orders mattes here. Flat type fees must be applied before Percent type fees
    const promoterOrderFees = fees
      .filter(
        (f) =>
          f.appliedTo === FeeAppliedToEnum.Order &&
          f.name != "Sales tax" &&
          f.appliedBy == FeeAppliedByEnum.Organization
      )
      .sort(({ type }) => {
        if (type === "Flat") return -1;
        else return 1;
      });
    // Caclualtions
    const ticketTotal = tickets.reduce((cur, ticket) => cur + ticket.price, 0);
    const upgradeTotal = upgrades.reduce(
      (cur, upgrade) => cur + upgrade.price,
      0
    );

    const totalTicketUpgrade = ticketTotal + upgradeTotal;

    const discountFeeFlatPerTicketTotal = tickets?.reduce((cur, ticket) => {
      return (
        cur +
        ticketFeesPromoCodeFlat?.reduce((cur, promotion) => {
          const value = cur + applyTicketDiscount(ticket, promotion);
          return value;
        }, 0)
      );
    }, 0);

    // console.log("+++++++++++++>>>>>>>>>>>>", discountFeeFlatPerTicketTotal);

    // const discountFeePercentPerTicketTotal = tickets?.reduce((cur, ticket) => {
    //   return (
    //     cur +
    //     ticketFeesPromoCodePercent?.reduce((cur, promotion) => {
    //       const value = cur + applyTicketDiscount(ticket, promotion);
    //       return value;
    //     }, 0)
    //   );
    // }, 0);

    // console.log(
    //   "++++++++++++eee+>>>>>>>>>>>>",
    //   discountFeePercentPerTicketTotal
    // );

    // const discountFeeFlatPerOrderTotal = tickets?.reduce((cur, ticket) => {
    //   return (
    //     cur +
    //     ticketFeesPromoCodeFlatPerOrder?.reduce((cur, promotion) => {
    //       const value = cur + applyTicketDiscount(ticket, promotion);
    //       return value;
    //     }, 0)
    //   );
    // }, 0);

    // console.log("+++++++++++++>>>>>>>>>>>>", discountFeeFlatPerOrderTotal);

    // const discountFeePercentPerOrderTotal = tickets?.reduce((cur, ticket) => {
    //   return (
    //     cur +
    //     ticketFeesPromoCodePercentPerOrder?.reduce((cur, promotion) => {
    //       const value = cur + applyTicketDiscount(ticket, promotion);
    //       return value;
    //     }, 0)
    //   );
    // }, 0);

    // console.log("+++++++++++++>>>>>>>>>>>>", discountFeePercentPerOrderTotal);

    // const promoterFeeFlatPerOrderTotal = promoterOrderFees.reduce(
    //   (acc, fee: any) => {
    //     return fee.type == FeeTypeEnum.Flat ? acc + getFeeAmount(fee) : acc;
    //   },
    //   0
    // );

    const discountFeeFlatPerOrderAmt = promotions?.reduce(
      (cur: number, promotion: IEventPromotion) => {
        if (
          promotion.discountType == EventPromotionDiscountTypeEnum.Flat &&
          promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder
        ) {
          const value = cur + promotion.discountValue;
          return value;
        }
        return cur;
      },
      0
    );

    // console.log("Amt flat per order",discountFeeFlatPerOrderAmt)


    const discountFeePercentPerOrderAmt = promotions?.reduce(
      (cur: number, promotion: IEventPromotion) => {
        if (
          promotion.discountType == EventPromotionDiscountTypeEnum.Percent &&
          promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder
        ) {
          const value = cur + (totalTicketUpgrade * promotion.discountValue) / 100;
          return value;
        }
        return cur;
      },
      0
    );

    // console.log("Amt percent per order",discountFeePercentPerOrderAmt)

    const discount =
      Math.round(
        discountFeeFlatPerTicketTotal || 0 + discountFeePercentPerTicketTotal || 0) || 0;
    const discountOrder =
      Math.round(
        discountFeeFlatPerOrderAmt || 0 + discountFeePercentPerOrderAmt || 0) || 0;

    const totalTicketAndUpgrades = Math.round(ticketTotal - discountOrder || 0) + Math.round(upgradeTotal);



    const promoterFeeFlatPerOrderTotal = promoterOrderFees.reduce(
      (acc, fee: any) => {
        return fee.type == FeeTypeEnum.Flat ? acc + getFeeAmount(fee) : acc;
      },
      0
    );

    //

    const promoterFeeFlatPerTicketTotal = tickets.reduce((cur, ticket) => {
      return (
        cur +
        ticketFeesPromotersFlat.reduce((cur, fee) => {
          const value = cur + applyTicketFee(ticket, fee);
          return value;
        }, 0)
      );
    }, 0);

    // discount

    // const discountTickets = tickets.filter(
    //   (obj, index) =>
    //     tickets.findIndex((item) => item.ticketTypeId === obj.ticketTypeId) ===
    //     index
    // );
    // console.log(discountTickets, "discountTickets");

    // const discountFeeFlatPerTicketTotal = tickets?.reduce((cur, ticket) => {
    //   return (
    //     cur +
    //     ticketFeesPromoCodeFlat?.reduce((cur, promotion) => {
    //       const value = cur + applyTicketDiscount(ticket, promotion);
    //       return value;
    //     }, 0)
    //   );
    // }, 0);

    // console.log("+++++++++++++>>>>>>>>>>>>", discountFeeFlatPerTicketTotal);

    // const discountFeePercentPerTicketTotal = tickets?.reduce((cur, ticket) => {
    //   return (
    //     cur +
    //     ticketFeesPromoCodePercent?.reduce((cur, promotion) => {
    //       const value = cur + applyTicketDiscount(ticket, promotion);
    //       return value;
    //     }, 0)
    //   );
    // }, 0);

    // console.log(
    //   "++++++++++++eee+>>>>>>>>>>>>",
    //   discountFeePercentPerTicketTotal
    // );

    // // const discountFeeFlatPerOrderTotal = tickets?.reduce((cur, ticket) => {
    // //   return (
    // //     cur +
    // //     ticketFeesPromoCodeFlatPerOrder?.reduce((cur, promotion) => {
    // //       const value = cur + applyTicketDiscount(ticket, promotion);
    // //       return value;
    // //     }, 0)
    // //   );
    // // }, 0);

    // // console.log("+++++++++++++>>>>>>>>>>>>", discountFeeFlatPerOrderTotal);

    // const discountFeePercentPerOrderTotal = tickets?.reduce((cur, ticket) => {
    //   return (
    //     cur +
    //     ticketFeesPromoCodePercentPerOrder?.reduce((cur, promotion) => {
    //       const value = cur + applyTicketDiscount(ticket, promotion);
    //       return value;
    //     }, 0)
    //   );
    // }, 0);

    // console.log("+++++++++++++>>>>>>>>>>>>", discountFeePercentPerOrderTotal);

    // // const promoterFeeFlatPerOrderTotal = promoterOrderFees.reduce(
    // //   (acc, fee: any) => {
    // //     return fee.type == FeeTypeEnum.Flat ? acc + getFeeAmount(fee) : acc;
    // //   },
    // //   0
    // // );

    // const discountFeeFlatPerOrderAmt = promotions?.reduce(
    //   (cur: number,promotion: IEventPromotion) => {
    //     if (
    //       promotion.discountType == EventPromotionDiscountTypeEnum.Flat &&
    //       promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder
    //     ) {
    //       const value = cur + promotion.discountValue;
    //       return value;
    //     }
    //     return cur;
    //   },
    //   0
    // );

    // console.log("Amt flat per order",discountFeeFlatPerOrderAmt)

    // const discountPercentFeesAmt  = promotions.reduce((acc, promotion) => {
    //   if (promotion.discountType == EventPromotionDiscountTypeEnum.Percent && 
    //     promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder
    //     ) {
    //     return acc + getFeeAmount(promotion, promoterTotal);
    //   }
    //   return acc;
    // }, 0);

    // console.log("order amt percent",discountPercentFeesAmt)

    const promoterFeeFlatPerUpgradeTotal = upgrades.reduce((cur, upgrade) => {
      return (
        cur +
        upgradeFeesPromotersFees.reduce((cur, fee) => {
          const value = cur + applyUpgradeFee(upgrade, fee);
          return value;
        }, 0)
      );
    }, 0);

    const SelloutFeeFlatPerUpgradeTotal = upgrades.reduce((cur, upgrade) => {
      return (
        cur +
        upgradeFeesSelloutFees.reduce((cur, fee) => {
          const value = cur + applyUpgradeFee(upgrade, fee);
          return value;
        }, 0)
      );
    }, 0);

    const promoterFeePercentPerTicketTotal = tickets.reduce((cur, ticket) => {
      return (
        cur +
        ticketFeesPromotersPercent.reduce((cur, fee) => {
          const value = cur + applyTicketFee(ticket, fee);
          return value;
        }, 0)
      );
    }, 0);



    let promoterFeePercentPerTicketTotal1 = Math.round(promoterFeePercentPerTicketTotal)
    // console.log(promoterFeePercentPerTicketTotal1,"+++++++++")

    const promoterFeePercentPerOrder = promoterOrderFees.reduce((acc, fee) => {
      if (fee.type == FeeTypeEnum.Percent) {
        return acc + getFeeAmount(fee, totalTicketAndUpgrades);
      }
      return acc;
    }, 0);

    let promoterFeePercentPerOrder1 = Math.round(promoterFeePercentPerOrder)

    const ticketGuestFeeTotalForPromoter = tickets.reduce((cur, ticket) => {
      return (
        cur +
        guestFees.reduce((cur, fee) => {
          const value =
            fee.appliedBy == FeeAppliedByEnum.Organization
              ? cur + applyGuestTicketFee(ticket, fee)
              : 0;
          return value;
        }, 0)
      );
    }, 0);

    const ticketGuestFeeTotalForSellout = tickets.reduce((cur, ticket) => {
      return (
        cur +
        guestFees.reduce((cur, fee) => {
          const value =
            fee.appliedBy == FeeAppliedByEnum.Sellout
              ? cur + applyGuestTicketFee(ticket, fee)
              : 0;
          return value;
        }, 0)
      );
    }, 0);

    // const discount =
    //   Math.round(
    //     discountFeeFlatPerTicketTotal ||
    //       0 + discountFeePercentPerTicketTotal ||
    //       0 + discountFeeFlatPerOrderAmt ||
    //       0 + discountFeePercentPerOrderTotal ||
    //       0
    //   ) || 0;
    // console.log(discount);

    const orderSubtotal = Math.round(
      totalTicketAndUpgrades +
      // upgradeTotal +
      promoterFeeFlatPerTicketTotal +
      promoterFeeFlatPerOrderTotal +
      promoterFeePercentPerTicketTotal1 +
      promoterFeePercentPerOrder1 +
      ticketGuestFeeTotalForPromoter +
      promoterFeeFlatPerUpgradeTotal
    );



    // const discountValue = Math.round(orderSubtotal);
    // console.log(discountValue, "discountValue");

    const salesTaxAmount = salesTaxFees
      ? (orderSubtotal * salesTaxFees.value) / 100
      : 0;

    const promoterTotal = Math.round(orderSubtotal) + Math.round(salesTaxAmount);

    const selloutPercentFeesAmt = selloutFees.reduce((acc, fee) => {
      if (fee.type == FeeTypeEnum.Percent) {
        return acc + getFeeAmount(fee, promoterTotal);
      }
      return acc;
    }, 0);

    //

    // const discountPercentFeesAmt  = promotions.reduce((acc, promotion) => {
    //   if (promotion.discountType == EventPromotionDiscountTypeEnum.Percent) {
    //     return acc + getFeeAmount(promotion, promoterTotal);
    //   }
    //   return acc;
    // }, 0);

    // console.log(discountPercentFeesAmt)

    const selloutFeeFlatPerTicketAmt = tickets.reduce(
      (cur: number, ticket: any) => {
        return (
          cur +
          selloutFees.reduce((cur: number, fee: IFee) => {
            if (
              fee.type == FeeTypeEnum.Flat &&
              fee.appliedTo === FeeAppliedToEnum.Ticket &&
              !fee?.filters?.includes(FeeFiltersEnum.Seated)
            ) {
              const value = cur + applyTicketFee(ticket, fee);
              return value;
            }
            return cur;
          }, 0)
        );
      },
      0
    );

    const selloutFeeFlatPerOrderAmt = selloutFees.reduce(
      (cur: number, fee: IFee) => {
        if (
          fee.type === FeeTypeEnum.Flat &&
          fee.appliedTo === FeeAppliedToEnum.Order
        ) {
          const value = cur + fee.value;
          return value;
        }
        return cur;
      },
      0
    );

    // if (fee.type === FeeTypeEnum.Percent) {
    //   return amt * (fee.value / 100);
    // }
    // const discountFeeFlatPerOrderAmt = promotions?.reduce(
    //   (cur: number,promotion: IEventPromotion) => {
    //     if (
    //       promotion.discountType == EventPromotionDiscountTypeEnum.Percent &&
    //       promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder
    //     ) {
    //       // const value = cur + promotion.discountValue;
    //       // return value;
    //       return amt * (promotion.discountType / 100);


    //     }
    //     return cur;
    //   },
    //   0
    // );

    // console.log(discountFeeFlatPerOrderAmt)


    const selloutSeatedFeeAmt = tickets.reduce((cur: number, ticket: any) => {
      return (
        cur +
        selloutFees.reduce((cur: number, fee: IFee) => {
          if (
            fee.type == FeeTypeEnum.Flat &&
            fee.appliedTo === FeeAppliedToEnum.Ticket &&
            fee?.filters?.includes(FeeFiltersEnum.Seated)
          ) {
            const value = cur + applyTicketFee(ticket, fee);
            return value;
          }

          return cur;
        }, 0)
      );
    }, 0);

    const selloutFeesTotal = Math.round(
      selloutPercentFeesAmt +
      selloutFeeFlatPerTicketAmt +
      selloutFeeFlatPerOrderAmt +
      selloutSeatedFeeAmt +
      ticketGuestFeeTotalForSellout +
      SelloutFeeFlatPerUpgradeTotal
    );
    const preStripeTotal = promoterTotal + selloutFeesTotal;

    let stripeFeeAmt = 0;

    const stripeFeePercentage =
      stripeFees.find((fee) => fee.type == FeeTypeEnum.Percent)?.value || 0;
    const stripeFeeFlat =
      stripeFees.find((fee) => fee.type == FeeTypeEnum.Flat)?.value || 0;
    stripeFeeAmt =
      (preStripeTotal + stripeFeeFlat) / (1 - stripeFeePercentage / 100) -
      preStripeTotal;

    function applyTicketFee(
      ticket: ICreateOrderTicketParams,
      fee: IFee
    ): number {
      // Ignore seated fees if not seated
      if (
        fee.filters &&
        fee.filters.includes(FeeFiltersEnum.Seated) &&
        !ticket.seat
      ) {
        return 0;
      }

      const minFee = fee.minAppliedToPrice || 0;
      const maxFee = fee.maxAppliedToPrice || Infinity;

      if (minFee <= ticket.price && ticket.price <= maxFee) {
        if (fee.type === FeeTypeEnum.Flat) {
          return fee.value;
        }
        if (fee.type === FeeTypeEnum.Percent) {
          return (ticket.price * fee.value) / 100;
        }
      } else {
        return 0;
      }

      return 0;
    }
    //
    function applyTicketDiscount(
      ticket: ICreateOrderTicketParams,
      promotion: IEventPromotion
    ): any {
      if (
        promotion.ticketTypeIds.includes(ticket?.ticketTypeId) ||
        promotion.ticketTypeIds.length == 0
        // promotions[0]?.ticketTypeIds.includes(ticket?.ticketTypeId) || promotion.ticketTypeIds.length == 0
      ) {
        if (promotion?.discountType === EventPromotionDiscountTypeEnum.Flat) {
          return promotion.discountValue;
        }
        if (promotion.discountType === EventPromotionDiscountTypeEnum.Percent) {
          return (ticket.origionalPrice * promotion.discountValue) / 100;
        }
      } else {
        return 0;
      }
    }

    function applyUpgradeFee(
      upgrade: ICreateOrderUpgradeParams,
      fee: IFee
    ): number {
      const minFee = fee.minAppliedToPrice || 0;
      const maxFee = fee.maxAppliedToPrice || Infinity;

      if (minFee <= upgrade.price && upgrade.price <= maxFee) {
        if (fee.type === FeeTypeEnum.Flat) {
          // return upgrade.price + fee.value;
          return fee.value;
        }
        if (fee.type === FeeTypeEnum.Percent) {
          return (upgrade.price * fee.value) / 100;
        }
      } else {
        return 0;
      }

      return 0;
    }

    // function getDiscount(promotion: IEventPromotion, amt = 0) {
    //   if (promotion?.discountType === EventPromotionDiscountTypeEnum.Flat) {
    //     return (amt -);
    //   }
    //   if (promotion?.discountType === EventPromotionDiscountTypeEnum.Percent) {
    //     return amt * (promotion.discountValue/ 100);
    //   }
    // }

    // console.log(getDiscount)

    // return Calculated fees amount based on type
    function getFeeAmount(fee, amt = 0) {
      if (fee.type === FeeTypeEnum.Flat) {
        return fee.value;
      }
      if (fee.type === FeeTypeEnum.Percent) {
        return amt * (fee.value / 100);
      }
    }
    let promoterFeeAmount =
      promoterFeeFlatPerTicketTotal +
      promoterFeeFlatPerOrderTotal +
      promoterFeePercentPerTicketTotal1 +
      promoterFeePercentPerOrder1 +
      ticketGuestFeeTotalForPromoter +
      promoterFeeFlatPerUpgradeTotal;


    // let total = {
    //   salesTax: Math.round(salesTaxAmount || 0),
    //   total: isDiscount && discount > 0
    //     ? Math.round(orderSubtotal - discount) +
    //       Math.round(
    //         promoterFeeAmount +
    //           (isDiscount && discount > 0 ? stripeDiscountFeeAmt : stripeFeeAmt) +
    //           selloutFeesTotal +
    //           salesTaxAmount || 0
    //       )
    //     : Math.round(preStripeTotal) + Math.round(isDiscount ? stripeDiscountFeeAmt : stripeFeeAmt) || 0,
    //   promoterFees: Math.round(promoterFeeAmount || 0),
    //   stripeFees: Math.round(isDiscount ? stripeDiscountFeeAmt : stripeFeeAmt || 0),
    //   selloutFees: Math.round(selloutFeesTotal || 0),
    //   orderSubtotal: Math.round(orderSubtotal || 0),
    //   subTotal: isDiscount && discount > 0
    //     ? Math.round(orderSubtotal - discount || 0)
    //     : Math.round(totalTicketAndUpgrades || 0),
    //   // subTotal: Math.round(totalTicketAndUpgrades || 0),

    //   totalFees: Math.round(
    //     promoterFeeAmount +
    //       stripeDiscountFeeAmt +
    //       selloutFeesTotal +
    //       salesTaxAmount || 0
    //   ),
    //   totalWithoutTaxFees: Math.round(
    //     promoterFeeAmount + stripeFeeAmt + selloutFeesTotal || 0
    //   ),
    //   guestFeeForPromoter: Math.round(ticketGuestFeeTotalForPromoter || 0),
    //   guestFeeForSellout: Math.round(ticketGuestFeeTotalForSellout || 0),
    //   discountAmount: Math.round(discount) || 0,
    // };

    let total = {
      salesTax: Math.round(salesTaxAmount || 0),
      total: Math.round(preStripeTotal) + Math.round(stripeFeeAmt) || 0,
      promoterFees: Math.round((promoterFeeAmount) || 0),
      stripeFees: Math.round(stripeFeeAmt || 0),
      selloutFees: Math.round(selloutFeesTotal || 0),
      orderSubtotal: Math.round(orderSubtotal || 0),
      subTotal: Math.round(totalTicketAndUpgrades || 0),
      totalFees: Math.round((promoterFeeAmount + stripeFeeAmt + selloutFeesTotal + salesTaxAmount) || 0),
      totalWithoutTaxFees: Math.round((promoterFeeAmount + stripeFeeAmt + selloutFeesTotal) || 0),
      guestFeeForPromoter: Math.round(ticketGuestFeeTotalForPromoter || 0),
      guestFeeForSellout: Math.round(ticketGuestFeeTotalForSellout || 0),
      discountAmount: Math.round(discount || discountOrder) || 0,

    }
    // console.log(total, "total");
    return total;
  }

  calculatePaymentSubtotal(params: IPaymentCalculatorParams): number {
    let {
      tickets = [],
      upgrades = [],
      paymentMethodType,
      // fees
      // promotions = [],

    } = params;

    if (paymentMethodType === PaymentMethodTypeEnum.None) return 0;
    const ticketTotal = tickets.reduce((cur, ticket) => cur + ticket.price, 0); // +  (ticket.price * tax/100)
    const upgradeTotal = upgrades.reduce(
      (cur, upgrade) => cur + upgrade.price,
      0
    );
    return ticketTotal + upgradeTotal
  }

  calculatePaymentSubtotalValue(params: any): number {
    let {
      tickets = [],
      upgrades = [],
      // paymentMethodType,
      // fees
    } = params;

    // if (paymentMethodType === PaymentMethodTypeEnum.None) return 0;

    const ticketTotal = tickets.reduce((cur, ticket) => cur + ticket.price, 0); // +  (ticket.price * tax/100)
    const upgradeTotal = upgrades.reduce(
      (cur, upgrade) => cur + upgrade.price,
      0
    ); // +  (upgrade.price * tax/100)
    return ticketTotal + upgradeTotal;
  }

  calculateFee(params: IPaymentCalculatorParams): number {
    let { fees } = params;
    const salesTax = fees.filter((f) => f.name == "Sales tax");
    const tax = salesTax.length > 0 ? salesTax[0].value : 0;
    const total = this.calculatePaymentTotal(params).total;
    let subtotal = this.calculatePaymentSubtotal(params);
    subtotal = subtotal + (subtotal * tax) / 100;
    return Math.round(total - subtotal);
  }

  calculateFeeWithoutTax(params: IPaymentCalculatorParams): any {
    const total = this.calculatePaymentTotal(params);
    // let subtotal = this.calculatePaymentSubtotal(params);
    // return Math.round(total - subtotal);
    return total;
  }
  calculateOrganizationFee(params: IPaymentCalculatorParams): number {
    let { tickets = [], upgrades = [], fees = [], paymentMethodType } = params;

    fees = FeeUtil.promoterFees(fees);
    return this.calculateFee({
      tickets,
      upgrades,
      fees,
      paymentMethodType,
    });
  }

  calculateTaxFee(params: IPaymentCalculatorParams): number {
    let { tickets = [], upgrades = [], fees = [], paymentMethodType } = params;

    fees = FeeUtil.taxFees(fees);
    return this.calculateFeeWithoutTax({
      tickets,
      upgrades,
      fees,
      paymentMethodType,
    });
  }
  calculatePlatformFee(params: IPaymentCalculatorParams): number {
    let { tickets = [], upgrades = [], fees = [], paymentMethodType } = params;

    fees = FeeUtil.selloutFees(fees);

    return this.calculateFee({
      tickets,
      upgrades,
      fees,
      paymentMethodType,
    });
  }
  calculateStripeFee(params: IPaymentCalculatorParams): number {
    const total = this.calculatePaymentTotal(params).total;
    const subtotal = this.calculatePaymentSubtotal(params);
    const platformFees = this.calculatePlatformFee(params);
    const organizationFee = this.calculateOrganizationFee(params);
    return total - subtotal - platformFees - organizationFee;
  }
  calculateProcessingFee(params: IPaymentCalculatorParams): number {
    const total = this.calculatePaymentTotal(params).total;
    const subtotal = this.calculatePaymentSubtotal(params);
    const organizationFee = this.calculateOrganizationFee(params);
    return total - subtotal - organizationFee;
  }
  // calculateTaxFee(params: IPaymentCalculatorParams): number {
  //   const organizationFee = this.calculateTaxFee(params);
  //   console.log(organizationFee,'............................salesTax..')
  //   return organizationFee;
  // }

  calculateGuestFee(tickets: any, event: any): number {
    let guestTicketFees = event?.fees.filter(
      (fee: IFee) =>
        fee.filters && fee.filters[0] === FeeFiltersEnum.GuestTicket
    );

    let stripeFees = event?.fees.filter(
      (fee: IFee) =>
        fee.appliedBy === FeeAppliedByEnum.Stripe &&
        fee.type === FeeTypeEnum.Percent
    );

    let guestFeesValue = guestTicketFees && guestTicketFees[0]?.value;
    let stripeFeesValue = stripeFees && stripeFees[0]?.value;
    let guestMembers = tickets.filter((a) => a.guestTicket).length;
    let guestFees = (guestFeesValue as number) * guestMembers;
    return guestTicketFees.length > 0 && event.organization.isTegIntegration
      ? guestFees + (guestFees * stripeFeesValue) / 100
      : 0;
  }
}

export default new PaymentUtil();
