import FeeUtil from './FeeUtil';
import IOrder from "../interfaces/IOrder";
import { OrderTypeEnum } from "../interfaces/IOrderType";
import IOrderCustomField from '../interfaces/IOrderCustomField';
import ICreateOrderParams from '../interfaces/ICreateOrderParams';
import IPayment from '../interfaces/IPayment';
import PaymentUtil from './PaymentUtil';
// import IFee from '../interfaces/IFee';
import IFee, { FeeAppliedByEnum, FeeTypeEnum, FeeFiltersEnum } from "../interfaces/IFee";

export default {
  isComp(order) {
    const { type = 'Online' } = order;
    return type === OrderTypeEnum.Complimentary;
  },
  isRSVP(order) {
    const { type = 'Online' } = order;
    return type === OrderTypeEnum.RSVP;
  },
  /*****************************************************************************************
  Order
  *****************************************************************************************/
  orderTotal(order: IOrder, fees: any[]): number {
    if (order?.payments && order?.payments.length > 0) {
      return order.payments.reduce((cur: number, payment: IPayment): number => {
        return cur + PaymentUtil.calculatePaymentTotal({
          tickets: order.tickets.filter(ticket => ticket.paymentId === payment._id),
          upgrades: order.upgrades.filter(upgrade => upgrade.paymentId === payment._id),
          fees: fees,
          paymentMethodType: payment.paymentMethodType,
        }).total || 0;
      }, 0);
    } else {
      if (
        (!order.tickets || !order.tickets.length) &&
        (!order.upgrades || !order.upgrades.length)
      )
        return 0;

      if (!order.tickets) order.tickets = [];
      if (!order.upgrades) order.upgrades = [];

      // console.log("order ++++++++++>>>",order);


      // const ticketFees = fees.filter(f => f.appliedTo === "Ticket");
      // const upgradeFees = fees.filter(f => f.appliedTo === "Upgrade");
      // let orderFees = fees.filter(f => f.appliedTo === "Order");

      // function applyTicketFee(ticket, fee) {
      //   if (fee.filters.includes("Seated") && !ticket.seat) return 0;
      //   const noMax = fee.maxAppliedToPrice === 0;
      //   if (
      //     (fee.minAppliedToPrice <= ticket.price &&
      //       ticket.price <= fee.maxAppliedToPrice) ||
      //     noMax
      //   ) {
      //     if (fee.type === "Flat") {
      //       return fee.value;
      //     }
      //     if (fee.type === "Percent") {
      //       return (ticket.price * fee.value) / 100;
      //     }
      //   } else {
      //     return 0;
      //   }
      // }

      // function applyUpgradeFee(upgrade, fee) {
      //   const noMax = fee.maxAppliedToPrice === 0;
      //   if (
      //     (fee.minAppliedToPrice <= upgrade.price &&
      //       upgrade.price <= fee.minAppliedToPrice) ||
      //     noMax
      //   ) {
      //     if (fee.type === "Flat") {
      //       return fee.value;
      //     }
      //     if (fee.type === "Percent") {
      //       return (upgrade.price * fee.value) / 100;
      //     }
      //   } else {
      //     return 0;
      //   }
      // }

      // function applyOrderFee(orderSubtotal, fee) {
      //   if (fee.type === "Flat") {
      //     return orderSubtotal + fee.value;
      //   }
      //   if (fee.type === "Percent") {
      //     return orderSubtotal / (1 - fee.value / 100);
      //   }
      // }

      // const ticketTotal = order.tickets.reduce(
      //   (cur, ticket) => cur + ticket.price,
      //   0
      // );

      // const ticketFeeTotal = order.tickets.reduce((cur, ticket) => {
      //   return (
      //     cur +
      //     ticketFees.reduce((cur, fee) => cur + applyTicketFee(ticket, fee), 0)
      //   );
      // }, 0);

      // const upgradeTotal = order.upgrades.reduce(
      //   (cur, upgrade) => cur + upgrade.price,
      //   0
      // );

      // const upgradeFeeTotal = order.upgrades.reduce((cur, upgrade) => {
      //   return (
      //     cur +
      //     upgradeFees.reduce((cur, fee) => cur + applyUpgradeFee(upgrade, fee), 0)
      //   );
      // }, 0);
      // const orderSubtotal =
      //   ticketTotal + ticketFeeTotal + upgradeTotal + upgradeFeeTotal;

      // // Order matters here. Flat type fees must be
      // // applied before Percent type fees
      // orderFees = orderFees.sort(({ type }) => {
      //   if (type === "Flat") return -1;
      //   return 1;
      // });

      // const orderTotal = orderFees.reduce((cur, fee) => {
      //   return applyOrderFee(cur, fee);
      // }, orderSubtotal) || 0;

      // console.log("orderTotal  orderTotal+++++>>",orderTotal );

      // return Math.round(orderTotal);


      const ticketTotal = order.tickets.reduce(
        (cur, ticket) => cur + ticket.price,
        0
      );

      const upgradeTotal = order.upgrades.reduce(
        (cur, upgrade) => cur + upgrade.price,
        0
      );
      console.log("++++>>>>>>/ fees");
      const totalFee = fees.reduce(
        (cur, fee) => cur + parseInt(fee.amount),
        0
      );
      // console.log("++++>>>>>>", ticketTotal, upgradeTotal, totalFee)
      const orderSubtotal =
        ticketTotal + upgradeTotal + totalFee;
      // console.log("++++",orderSubtotal)
      return Math.round(orderSubtotal);

    }
  },


  guestFees(order: IOrder, fees: IFee[]): any {
    let guestTicketFees = fees.find(
      (fee: IFee) => {
        const filter: any = fee?.filters
        return filter.includes(FeeFiltersEnum.GuestTicket)
      }
    );

    let guestFeesValue = guestTicketFees?.value || 0;
    // const ticketTotal = order.tickets.reduce((cur, ticket) => cur + ticket.price - ticket.refund.refundedAmount, 0);
    const ticketTotal = order.tickets.reduce((cur, ticket) => cur + ticket.price - ticket.refund.refundedAmount, 0);
    let guestMembers = order.tickets.filter((a) => a.guestTicket).length;
    // let guestMembers = order.tickets.filter((a) => a.guestTicket && a.refund.refunded == false).length;
    let guestMembersRefunded = order.tickets.filter((a) => a.guestTicket && a.refund.refunded == true).length;
    const stripeFees: any = fees.find(
      (fee: IFee) => fee.appliedBy === FeeAppliedByEnum.Stripe && fee.type === FeeTypeEnum.Percent
    );
    let guestFees;
    let guestFeesRefunded;

    if (guestTicketFees?.type === "Flat") {
      guestFees = (guestFeesValue as number) * guestMembers
      guestFeesRefunded = (guestFeesValue as number) * guestMembersRefunded
    } else if (guestTicketFees?.type === "Percent") {
      guestFees = (ticketTotal * guestFeesValue) / 100
      guestFeesRefunded = (ticketTotal * guestMembersRefunded) / 100
    }
    let stripeFeeAmount = 0;
    if (stripeFees?.value) {
      stripeFeeAmount = Math.round(guestFees * stripeFees?.value / 100)
    }

    return {
      guestFees: guestFees || 0,
      guestFeesRefunded: guestFeesRefunded || 0,
      stripeFeeAmount: stripeFeeAmount || 0
    }

  },
  orderTotalWithRefund(order, fees) {
    const orderTotal = this.orderTotal(order, fees);
    return orderTotal - (order.refundedAmount || 0);
  },
  orderTransferAmountWithRefund(order, fees) {
    const promoterFees = FeeUtil.promoterFees(fees);
    return this.orderTotalWithRefund(order, promoterFees);
  },
  orderSubtotal(order: IOrder): number {
    let subTotal;
    if (order.payments) {
      subTotal = order?.payments?.reduce((cur: number, payment: IPayment): number => {
        return cur + PaymentUtil.calculatePaymentSubtotal({
          tickets: order.tickets.filter(ticket => ticket.paymentId === payment._id),
          upgrades: order.upgrades.filter(upgrade => upgrade.paymentId === payment._id),
          fees: [],
          paymentMethodType: payment.paymentMethodType,
        })
      }, 0);
    } else {
      subTotal = PaymentUtil.calculatePaymentSubtotalValue({
        tickets: order.tickets,
        upgrades: order.upgrades
      })
    }


    // order?.payments?.reduce((cur: number, payment: IPayment): number => {
    //   return cur + PaymentUtil.calculatePaymentSubtotal({
    //     tickets: order.tickets.filter(ticket => ticket.paymentId === payment._id),
    //     upgrades: order.upgrades.filter(upgrade => upgrade.paymentId === payment._id),
    //     fees: [],
    //     paymentMethodType: payment.paymentMethodType,
    //   })
    // }, 0);

    return subTotal || 0
  },

  orderSubtotalWithRefund(order) {
    if (order.type === OrderTypeEnum.Complimentary) return 0;
    if (!order.tickets) order.tickets = [];
    if (!order.upgrades) order.upgrades = [];

    const ticketTotal = order.tickets.reduce((cur, ticket) => cur + ticket.price - ticket.refund.refundedAmount, 0);
    const upgradeTotal = order.upgrades.reduce((cur, upgrade) => cur + upgrade.price - upgrade.refund.refundedAmount, 0);
    return ticketTotal + upgradeTotal;
  },
  ticketsSubtotal(order) {
    if (!order.tickets) order.tickets = [];
    return order.tickets.reduce((cur, ticket) => cur + ticket.price, 0);
  },
  ticketsSubtotalWithRefund(order) {
    if (!order.tickets) order.tickets = [];
    return order.tickets.reduce((cur, ticket) => cur + ticket.price - ticket.refund.refundedAmount, 0);
  },
  upgradesSubtotal(order) {
    if (!order.upgrades) order.upgrades = [];
    return order.upgrades.reduce((cur, upgrade) => cur + upgrade.price, 0);
  },
  upgradesSubtotalWithRefund(order) {
    if (!order.upgrades) order.upgrades = [];
    return order.upgrades.reduce((cur, upgrade) => cur + upgrade.price - upgrade.refund.refundedAmount, 0);
  },
  orderFee(order, fees) {
    if (!order.tickets) order.tickets = [];
    if (!order.upgrades) order.upgrades = [];
    return this.orderTotal(order, fees) - this.orderSubtotal(order);
  },
  // This one is special because stripe fees
  // can be applied as a percentage
  processingFees(order, fees) {
    if (!order.tickets) order.tickets = [];
    if (!order.upgrades) order.upgrades = [];
    const total = this.orderTotal(order, fees);
    const subtotal = this.orderSubtotal(order);
    const promoterFees = this.promoterFees(order, fees);
    return total - subtotal - promoterFees;
  },
  selloutFees(order, fees) {
    if (!order.tickets) order.tickets = [];
    if (!order.upgrades) order.upgrades = [];
    fees = FeeUtil.selloutFees(fees);
    return this.orderTotal(order, fees) - this.orderSubtotal(order);
  },

  // This one is special because stripe fees
  // can be applied as a percentage
  stripeFees(order, fees) {
    if (!order.tickets) order.tickets = [];
    if (!order.upgrades) order.upgrades = [];
    const total = this.orderTotal(order, fees);
    const subtotal = this.orderSubtotal(order);
    const selloutFees = this.selloutFees(order, fees);
    const promoterFees = this.promoterFees(order, fees);
    let stripeFee = total - subtotal - selloutFees - promoterFees;
    let stripeFeeT = stripeFee < 0 ? 0 : stripeFee;
    return stripeFeeT;
  },

  promoterFees(order, fees) {
    if (!order.tickets) order.tickets = [];
    if (!order.upgrades) order.upgrades = [];
    fees = FeeUtil.promoterFees(fees);
    return this.orderFee(order, fees);
  },
  promoterFeesWithRefund(order, fees) {
    if (order.state === 'Refunded') {
      return 0;
    }

    if (order.state === 'Partial Refund') {
      const orderTotalWithRefund = this.orderTotalWithRefund(order, fees);
      const orderSubtotal = this.orderSubtotal(order, fees);
      if (order.refundedAmount > orderSubtotal) {
        const processingFees = this.processingFees(order, fees);
        return orderTotalWithRefund - processingFees;
      }
    }

    return this.promoterFees(order, fees);
  },
  /*****************************************************************************************
  Ticket
  *****************************************************************************************/
  ticketTypeTotal(order, ticketTypeId) {
    return order.tickets
      .filter(t => t.ticketTypeId === ticketTypeId)
      .reduce((cur, next) => cur + (next.origionalPrice ? next.origionalPrice : next.price)  , 0);
  },
  ticketCountsByTicketTypeId(order) {
    return order.tickets.reduce((cur, ticket) => {
      if (cur[ticket.ticketTypeId]) cur[ticket.ticketTypeId]++;
      else cur[ticket.ticketTypeId] = 1;
      return cur;
    }, {});
  },
  ticketTypeCount(order, ticketTypeId) {
    const counts = this.ticketCountsByTicketTypeId(order);
    return counts[ticketTypeId] || 0;
  },
  ticketIsScannable(orderTicket) {
    if (!orderTicket) return false;
    const { scan = {}, refund = {} } = orderTicket;

    if (scan.scanned && scan.scannedAt > 0) return false;
    if (refund.refunded && refund.refundedAt > 0) return false;
    return true;
  },
  seatIsSelected(order, seat) {
    const allSeats = this.allSeats(order);
    return allSeats.includes(seat);
  },
  allSeats(order) {
    return order.tickets
      .filter(ticket => Boolean(ticket.seat))
      .map(ticket => ticket.seat);
  },
  ticketTypeSeats(order, ticketTypeId) {
    return order.tickets
      .filter(ticket => ticket.ticketTypeId === ticketTypeId)
      .filter(ticket => Boolean(ticket.seat))
      .map(ticket => ticket.seat);
  },
  /*****************************************************************************************
  Upgrade
  *****************************************************************************************/
  upgradeTypeTotal(order, upgradeId) {
    return order.upgrades
      .filter(t => t.upgradeId === upgradeId)
      .reduce((cur, next) => cur + next.price, 0);
  },
  upgradeCount(order, upgradeId) {
    const counts = this.upgradeCountsByTicketTypeId(order);
    return counts[upgradeId] || 0;
  },
  upgradeCountsByTicketTypeId(order) {
    return order.upgrades.reduce((cur, upgrade) => {
      if (cur[upgrade.upgradeId]) cur[upgrade.upgradeId]++;
      else cur[upgrade.upgradeId] = 1;
      return cur;
    }, {});
  },
  upgradeCountsByUpgradeId(order) {
    return order.upgrades.reduce((cur, upgrade) => {
      if (cur[upgrade.upgradeId]) cur[upgrade.upgradeId]++;
      else cur[upgrade.upgradeId] = 1;
      return cur;
    }, {});
  },
  upgradeIsScannable(orderUpgrade) {
    if (!orderUpgrade) return false;
    const { scan = {}, refund = {} } = orderUpgrade;

    if (scan.scanned && scan.scannedAt > 0) return false;
    if (refund.refunded && refund.refundedAt > 0) return false;
    return true;
  },
  /*****************************************************************************************
  Custom Field
  *****************************************************************************************/
  customField(order: IOrder | ICreateOrderParams, eventCustomFieldId: string): IOrderCustomField | null {
    return order?.customFields?.find(
      (customField) => customField.customFieldId === eventCustomFieldId
    ) ?? null;
  }
};
