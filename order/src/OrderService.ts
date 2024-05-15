import * as pb from "@sellout/models/.dist/sellout-proto";
import * as Time from "@sellout/utils/.dist/time";
import * as Price from "@sellout/utils/.dist/price";
import * as CSV from "@sellout/utils/.dist/CSV";
import * as IPStack from "@sellout/utils/.dist/IPStack";
import wait from "@sellout/utils/.dist/wait";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import BaseService from "@sellout/service/.dist/BaseService";
import IAddress from "@sellout/models/.dist/interfaces/IAddress";
import Joi from "@hapi/joi";
import ConsoleLogManager from "@sellout/service/.dist/ConsoleLogManager";
import NatsConnectionManager from "@sellout/service/.dist/NatsConnectionManager";
import PbMessageHandler from "@sellout/service/.dist/PbMessageHandler";
import joiToErrors from "@sellout/service/.dist/joiToErrors";
import { Order } from "./Order";
import OrderStore from "./OrderStore";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";
import IOrderTicket from "@sellout/models/.dist/interfaces/IOrderTicket";
import IOrderUpgrade from "@sellout/models/.dist/interfaces/IOrderUpgrade";
import IOrderSummary, {
  IOrderSummaryItem,
} from "@sellout/models/.dist/interfaces/IOrderSummary";
import {
  OrderStateEnum,
  OrderItemStateEnum,
} from "@sellout/models/.dist/interfaces/IOrderState";
import IPayment from "@sellout/models/.dist/interfaces/IPayment";
import IOrderQuery from "@sellout/models/.dist/interfaces/IOrderQuery";
import Tracer from "@sellout/service/.dist/Tracer";
import { IServiceProxy, proxyProvider } from "./proxyProvider";
import { NATS_URL } from "./env";
import QRCode from "qrcode";
import uuid4 from "uuid/v4";
import { OrderTypeEnum } from "@sellout/models/.dist/interfaces/IOrderType";
import IAnalytics, {
  IAnalyticsQueryParams,
  AnalyticsTypeEnum,
} from "@sellout/models/.dist/interfaces/IAnalytics";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import { OrderItemTypeEnum } from "@sellout/models/.dist/enums/OrderItemTypeEnum";
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import shortid from "shortid";
import ICreateOrderParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import ICreateSeasonOrderParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import { ITicketRestriction } from "@sellout/models/.dist/interfaces/IOrder";
import IEvent, { EventTicketDelivery } from "@sellout/models/.dist/interfaces/IEvent";
import ISeason from "@sellout/models/.dist/interfaces/ISeason";
import SaveLogsToFile from "@sellout/models/.dist/utils/SaveLogsToFile";
import IFee, { FeeAppliedByEnum, FeeAppliedToEnum, FeeFiltersEnum, FeeTypeEnum } from "@sellout/models/.dist/interfaces/IFee";
import { EventPromotionAppliesToEnum, EventPromotionDiscountTypeEnum } from "@sellout/models/.dist/interfaces/IEventPromotion";
const tracer = new Tracer("OrderService");


interface IOrderEntities {
  order?: any;
  organization?: any;
  user?: any;
  event?: any;
  season?: any;
  venues?: any[];
  artists?: any[];
  fees?: any[];
}

interface ISeasonOrderEntities {
  order?: any;
  organization?: any;
  user?: any;
  season?: any;
  venues?: any[];
  artists?: any[];
  fees?: any[];
  events?: any[];
}

export default class OrderService extends BaseService {
  [x: string]: any;
  public proxy: IServiceProxy;
  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.OrderService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new OrderService({
      serviceName,
      connectionMgr: new NatsConnectionManager(
        [<string>NATS_URL],
        logger,
        true
      ),
      logManager: logger,
      storageManager: new OrderStore(Order),
    });
    service.run();
  }

  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on("connect", () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }
  public register() {
    this.connectionMgr.subscribe(this.serviceName, "api", {
      /**
       * Incoming Message Handlers
       */
      ticketRestriction: new PbMessageHandler(
        this.ticketRestriction,
        pb.TicketRestrictionRequest,
        pb.TicketRestrictionResponse
      ),
      createOrder: new PbMessageHandler(
        this.createOrder,
        pb.CreateOrderRequest,
        pb.CreateOrderResponse
      ),
      createSeasonOrder: new PbMessageHandler(
        this.createSeasonOrder,
        pb.CreateSeasonOrderRequest,
        pb.CreateSeasonOrderResponse
      ),
      createOrderPaymentIntent: new PbMessageHandler(
        this.createOrderPaymentIntent,
        pb.CreateOrderPaymentIntentRequest,
        pb.CreateOrderPaymentIntentResponse
      ),
      createSeasonOrderPaymentIntent: new PbMessageHandler(
        this.createSeasonOrderPaymentIntent,
        pb.CreateSeasonOrderPaymentIntentRequest,
        pb.CreateOrderPaymentIntentResponse
      ),
      scanOrder: new PbMessageHandler(
        this.scanOrder,
        pb.ScanOrderRequest,
        pb.ScanOrderResponse
      ),
      sendOrderReceiptEmail: new PbMessageHandler(
        this.sendOrderReceiptEmail,
        pb.SendOrderReceiptEmailRequest,
        pb.SendOrderReceiptEmailResponse
      ),
      sendOrderRefundEmail: new PbMessageHandler(
        this.sendOrderRefundEmail,
        pb.SendOrderRefundEmailRequest,
        pb.SendOrderRefundEmailResponse
      ),
      resendOrderRefundEmail: new PbMessageHandler(
        this.resendOrderRefundEmail,
        pb.SendOrderRefundEmailRequest,
        pb.SendOrderRefundEmailResponse
      ),
      sendOrderQRCodeEmail: new PbMessageHandler(
        this.sendOrderQRCodeEmail,
        pb.SendOrderQRCodeEmailRequest,
        pb.SendOrderQRCodeEmailResponse
      ),
      sendSeasonOrderReceiptEmail: new PbMessageHandler(
        this.sendSeasonOrderReceiptEmail,
        pb.SendOrderQRCodeEmailRequest,
        pb.SendOrderQRCodeEmailResponse
      ),
      refundOrder: new PbMessageHandler(
        this.refundOrder,
        pb.RefundOrderRequest,
        pb.RefundOrderResponse
      ),
      cancelOrder: new PbMessageHandler(
        this.cancelOrder,
        pb.CancelOrderRequest,
        pb.CancelOrderResponse
      ),
      refundEventOrders: new PbMessageHandler(
        this.refundEventOrders,
        pb.RefundEventOrdersRequest,
        pb.RefundEventOrdersResponse
      ),
      generateOrderReport: new PbMessageHandler(
        this.generateOrderReport,
        pb.GenerateOrderReportRequest,
        pb.GenerateOrderReportResponse
      ),
      generateActivityReport: new PbMessageHandler(
        this.generateActivityReport,
        pb.GenerateOrderReportRequest,
        pb.GenerateOrderReportResponse
      ),
      emailTotalEOrderReport: new PbMessageHandler(
        this.emailTotalEOrderReport,
        pb.GenerateOrderReportRequest,
        pb.GenerateOrderReportResponse
      ),
      queryOrders: new PbMessageHandler(
        this.queryOrders,
        pb.QueryOrdersRequest,
        pb.QueryOrdersResponse
      ),
      findOrderById: new PbMessageHandler(
        this.findOrderById,
        pb.FindOrderByIdRequest,
        pb.FindOrderByIdResponse
      ),
      findOrderByEventId: new PbMessageHandler(
        this.findOrderByEventId,
        pb.FindOrderByEventIdRequest,
        pb.FindOrderByEventIdResponse,
      ),
      eventOrderCount: new PbMessageHandler(
        this.eventOrderCount,
        pb.FindOrderByEventIdRequest,
        pb.FindEventOrderCountResponse,
      ),
      findOrderByFeeId: new PbMessageHandler(
        this.findOrderByFeeId,
        pb.FindOrderByFeeIdRequest,
        pb.FindOrderByIdResponse
      ),
      findOrderByEmail: new PbMessageHandler(
        this.findOrderByEmail,
        pb.FindOrderByEmailRequest,
        pb.FindOrderByEmailResponse
      ),
      queryOrderAnalytics: new PbMessageHandler(
        this.queryOrderAnalytics,
        pb.QueryOrderAnalyticsRequest,
        pb.QueryOrderAnalyticsResponse
      ),
      breakApartOrder: new PbMessageHandler(
        this.breakApartOrder,
        pb.BreakApartOrderRequest,
        pb.BreakApartOrderResponse
      ), breakApartSeasonOrder: new PbMessageHandler(
        this.breakApartSeasonOrder,
        pb.BreakApartOrderRequest,
        pb.BreakApartSeasonOrderResponse
      ), multipleBreakApartOrder: new PbMessageHandler(
        this.multipleBreakApartOrder,
        pb.MultipleBreakApartOrderRequest,
        pb.MultipleBreakApartOrderResponse
      ), multipleBreakApartSeasonOrder: new PbMessageHandler(
        this.multipleBreakApartSeasonOrder,
        pb.MultipleBreakApartOrderRequest,
        pb.MultipleBreakApartOrderResponse
      ), batchPrintBreakApartOrder: new PbMessageHandler(
        this.batchPrintBreakApartOrder,
        pb.MultipleBreakApartOrderRequest,
        pb.MultipleBreakApartOrderResponse
      ),
      ordersChargeUpdate: new PbMessageHandler(
        this.ordersChargeUpdate,
        pb.OrdersChargeUpdateRequest,
        pb.OrdersChargeUpdateResponse
      ),
      getPromoUsed: new PbMessageHandler(
        this.getPromoUsed,
        pb.GetPromoUsedRequest,
        pb.GetPromoUsedResponse
      ),
      orderQRCodeEmailOnDay: new PbMessageHandler(
        this.orderQRCodeEmailOnDay,
        pb.SendOrderQRCodeEmailRequest,
        pb.SendOrderQRCodeEmailResponse
      ),
      updateOrder: new PbMessageHandler(
        this.updateOrder,
        pb.UpdateOrderRequest,
        pb.UpdateOrderResponse
      ),
      updateGuestOrder: new PbMessageHandler(
        this.updateGuestOrder,
        pb.UpdateGuestOrderRequest,
        pb.UpdateOrderResponse
      ),
    });
  }

  private async orderEntities(
    spanContext: string,
    orderId: string
  ): Promise<IOrderEntities> {
    const span = tracer.startSpan("orderEntities", spanContext);

    try {
      /**
       * Retrieve the order from storage
       * Here we retry up to 100 times if the query fails
       * The query can fail because the order we are querying for
       * may not have had time to sync to slave mongo nodes
       * if the order was just created
       */
      let order: IOrder;
      let count = 0;
      try {
        while ((!order || !order.orgId) && count < 20) {
          this.logger.info(`Order Entities Retry count is ${count}`);
          count++;
          order = await this.storage.findById(span, orderId);
          await wait(50);
        }
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw e;
      }

      if (!order || !order.orgId) {
        throw new Error(`Failed to retrieve order with id ${orderId}`);
      }

      /*
       * Find the org
       */
      const findOrgRequest = pb.FindOrganizationRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
      });

      let findOrgResponse: pb.FindOrganizationResponse;

      try {
        findOrgResponse = await this.proxy.organizationService.findOrganization(
          findOrgRequest
        );
      } catch (e) {
        console.log("Error::", e)
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order organization: ${e.message}`);
      }

      const { organization } = findOrgResponse;

      /*
       * Find the user
       */
      const findUserRequest = pb.FindUserByIdRequest.create({
        spanContext: span.context().toString(),
        userId: order.userId,
      });

      let findUserResponse: pb.FindUserByIdResponse;

      try {
        findUserResponse = await this.proxy.userService.findUserById(
          findUserRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order user: ${e.message}`);
      }

      const { user } = findUserResponse;
      /*
       * Find the event
       */
      const findEventRequest = pb.FindEventByIdRequest.create({
        spanContext: span.context().toString(),
        eventId: order.eventId,
      });



      let findEventResponse: pb.FindEventByIdResponse;

      try {
        findEventResponse = await this.proxy.eventService.findEventById(
          findEventRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order event: ${e.message}`);
      }

      const { event } = findEventResponse;



      const findSeasonRequest = pb.FindEventByIdRequest.create({
        spanContext: span.context().toString(),
        seasonId: order.seasonId,
      });



      let findSeasonResponse: pb.FindEventByIdResponse;

      try {
        findSeasonResponse = await this.proxy.seasonService.findSeasonById(
          findSeasonRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order event: ${e.message}`);
      }

      const { season } = findSeasonResponse;
      /*
       * Find the venues
       */
      const queryVenuesRequest = pb.QueryVenuesRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
        query: {
          venueIds: EventUtil.venueIds(event ? event : season),
        },
        pagination: {},
      });

      let queryVenuesResponse: pb.QueryVenuesResponse;

      try {
        queryVenuesResponse = await this.proxy.venueService.queryVenues(
          queryVenuesRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order venues: ${e.message}`);
      }

      const { venues } = queryVenuesResponse;

      /*
       * Find the artists
       */
      const queryArtistsRequest = pb.QueryArtistsRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
        query: {
          artistIds: EventUtil.artistIds(event ? event : season),
        },
        pagination: {},
      });

      let queryArtistsResponse: pb.QueryArtistsResponse;

      try {
        queryArtistsResponse = await this.proxy.artistService.queryArtists(
          queryArtistsRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order artists: ${e.message}`);
      }

      const { artists } = queryArtistsResponse;

      /**
       * List the fees
       */
      // const listFeesRequest = new pb.ListFeesByIdRequest.create({
      //   spanContext: span.context().toString(),
      //   orgId: order.orgId,
      //   feeIds: order.feeIds,
      // });

      // let listFeesResponse: pb.ListEventFeesResponse;
      // try {
      //   listFeesResponse = await this.proxy.feeService.listFeesById(
      //     listFeesRequest
      //   );
      //   if (listFeesResponse.status !== pb.StatusCode.OK) {
      //     throw new Error("Failed to fetch order fees.");
      //   }
      // } catch (e) {
      //   this.logger.error(`orderEntities - error: ${e.message}`);
      //   throw new Error(`Failed to fetch order fees: ${e.message}`);
      // }

      const { fees } = order;

      const entities: IOrderEntities = {
        order,
        organization,
        user,
        event,
        season,
        venues,
        artists,
        fees,
      };

      return entities;
    } catch (e) {
      this.logger.error(`orderEntities last catch error ${e.message}`);
      throw e;
    }
  }

  private async seasonOrderEntities(
    spanContext: string,
    orderId: string
  ): Promise<IOrderEntities> {
    const span = tracer.startSpan("seasonOrderEntities", spanContext);
    try {
      /**
       * Retrieve the order from storage
       * Here we retry up to 100 times if the query fails
       * The query can fail because the order we are querying for
       * may not have had time to sync to slave mongo nodes
       * if the order was just created
       */
      let order: IOrder;
      let count = 0;
      try {
        while ((!order || !order.orgId) && count < 20) {
          this.logger.info(`Order Entities Retry count is ${count}`);
          count++;
          order = await this.storage.findById(span, orderId);
          await wait(50);
        }
      } catch (e) {
        this.logger.error(`seasonOrderEntities - error: ${e.message}`);
        throw e;
      }

      if (!order || !order.orgId) {
        throw new Error(`Failed to retrieve order with id ${orderId}`);
      }
      const listEventRequest = new pb.ListEventFeesRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
        seasonId: order.seasonId,
      });

      let ListEventsResponse: pb.ListEventsResponse;
      try {
        ListEventsResponse = await this.proxy.eventService.listEventBySeasonId(
          listEventRequest
        );
      } catch (e) {
        // errorSpan(span, e);
        throw e;
      }
      let events = ListEventsResponse.events;

      /*
       * Find the org
       */
      const findOrgRequest = pb.FindOrganizationRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
      });

      let findOrgResponse: pb.FindOrganizationResponse;

      try {
        findOrgResponse = await this.proxy.organizationService.findOrganization(
          findOrgRequest
        );
      } catch (e) {
        this.logger.error(`seasonOrderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order organization: ${e.message}`);
      }

      const { organization } = findOrgResponse;

      /*
       * Find the user
       */

      const findUserRequest = pb.FindUserByIdRequest.create({
        spanContext: span.context().toString(),
        userId: order.userId,
      });

      let findUserResponse: pb.FindUserByIdResponse;

      try {
        findUserResponse = await this.proxy.userService.findUserById(
          findUserRequest
        );
      } catch (e) {
        this.logger.error(`seasonOrderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order user: ${e.message}`);
      }

      const { user } = findUserResponse;
      /*
       * Find the Season
       */
      const findSeasonRequest = pb.FindEventByIdRequest.create({
        spanContext: span.context().toString(),
        seasonId: order.seasonId,
      });

      let findSeasonResponse: pb.FindSeasonByIdResponse;

      try {
        findSeasonResponse = await this.proxy.seasonService.findSeasonById(
          findSeasonRequest
        );
      } catch (e) {
        this.logger.error(`seasonOrderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order season: ${e.message}`);
      }

      const { season } = findSeasonResponse;

      /*
       * Find the venues
       */
      const queryVenuesRequest = pb.QueryVenuesRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
        query: {
          venueIds: EventUtil.venueIds(season),
        },
        pagination: {},
      });

      let queryVenuesResponse: pb.QueryVenuesResponse;

      try {
        queryVenuesResponse = await this.proxy.venueService.queryVenues(
          queryVenuesRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order venues: ${e.message}`);
      }

      const { venues } = queryVenuesResponse;

      /*
       * Find the artists
       */
      const queryArtistsRequest = pb.QueryArtistsRequest.create({
        spanContext: span.context().toString(),
        orgId: order.orgId,
        query: {
          artistIds: EventUtil.artistIds(season),
        },
        pagination: {},
      });

      let queryArtistsResponse: pb.QueryArtistsResponse;

      try {
        queryArtistsResponse = await this.proxy.artistService.queryArtists(
          queryArtistsRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order artists: ${e.message}`);
      }

      const { artists } = queryArtistsResponse;

      /**
       * List the fees
       */
      // const listFeesRequest = new pb.ListFeesByIdRequest.create({
      //   spanContext: span.context().toString(),
      //   orgId: order.orgId,
      //   feeIds: order.feeIds,
      // });

      // let listFeesResponse: pb.ListEventFeesResponse;
      // try {
      //   listFeesResponse = await this.proxy.feeService.listFeesById(
      //     listFeesRequest
      //   );
      //   if (listFeesResponse.status !== pb.StatusCode.OK) {
      //     throw new Error("Failed to fetch order fees.");
      //   }
      // } catch (e) {
      //   this.logger.error(`seasonOrderEntities - error: ${e.message}`);
      //   throw new Error(`Failed to fetch order fees: ${e.message}`);
      // }

      const { fees } = order;

      const entities: ISeasonOrderEntities = {
        order,
        organization,
        user,
        season,
        venues,
        artists,
        fees,
        events,
      };

      return entities;
    } catch (e) {
      this.logger.error(`seasonOrderEntities last catch error ${e.message}`);
      throw e;
    }
  }

  private async orderSummary(
    spanContext: string,
    order: IOrder,
    fees,
    full: boolean = true
  ): Promise<any> {

    const span = tracer.startSpan("orderSummary", spanContext);
    const allTickets = order.tickets.map(ticket => ticket)


    const tickets = order.tickets?.reduce((cur, next: any) => {
      if (cur.hasOwnProperty(next.ticketTypeId)) {
        cur[next.ticketTypeId].isMemberIdValid = next.isMemberIdValid;
        cur[next.ticketTypeId].teiMemberId = next.teiMemberId;
        cur[next.ticketTypeId].guestTicket = next.guestTicket;
        cur[next.ticketTypeId].count++;
        if (next.refund && next.refund.refunded == false)
          cur[next.ticketTypeId].values =
            Number(cur[next.ticketTypeId].values) + Number(next.values);
        cur[next.ticketTypeId].description = next.description;
        cur[next.ticketTypeId].dayIds = next.dayIds;

        if (next.scan[0].scanned) cur[next.ticketTypeId].scannedCount++;
        if (next.refund && next.refund.refunded == true)
          cur[next.ticketTypeId].refund++;
      } else {
        cur[next.ticketTypeId] = {
          isMemberIdValid: next?.isMemberIdValid,
          teiMemberId: next.teiMemberId,
          guestTicket: next.guestTicket,
          description: next.description,
          dayIds: next.dayIds,
          typeId: next.ticketTypeId,
          name: next.name,
          values:
            next.refund && next.refund.refunded == false ? next.values : 0,
          price: OrderUtil.ticketTypeTotal(order, next.ticketTypeId),
          count: 1,
          refund: next.refund && next.refund.refunded == true ? 1 : 0,
          scannedCount: next.scan[0].scanned ? 1 : 0,
          seats: OrderUtil.ticketTypeSeats(order, next.ticketTypeId),
          discount: order?.discountAmount
        };
      }
      return cur;
    }, {});

    const upgrades = order.upgrades?.reduce((cur, next) => {
      if (cur.hasOwnProperty(next.upgradeId)) {
        cur[next.upgradeId].count++;
        if (next.scan[0]?.scanned) cur[next.upgradeId].scannedCount++;
      } else {
        cur[next.upgradeId] = {
          typeId: next.upgradeId,
          name: next.name,
          price: OrderUtil.upgradeTypeTotal(order, next.upgradeId),
          count: 1,
          scannedCount: next.scan[0]?.scanned ? 1 : 0,
        };
      }
      return cur;
    }, {});

    const ticketsItems: IOrderSummaryItem[] = Object.keys(tickets).map(
      (k: string): IOrderSummaryItem => tickets[k]
    );

    const upgradeItems: IOrderSummaryItem[] = Object.keys(upgrades).map(
      (k: string): IOrderSummaryItem => upgrades[k]
    );

    const ticketsScanned = order?.tickets?.reduce((cur, next) => {
      return next.scan[0].scanned ? cur + 1 : 0;
    }, 0);

    const totalTickets = order?.tickets?.length;

    const upgradesScanned = order?.upgrades?.reduce((cur, next) => {
      return next?.scan?.scanned ? cur + 1 : 0;
    }, 0);

    const refundedItems = order?.tickets?.reduce((cur, next) => {
      return next?.refund && next?.refund?.refunded == true ? cur + 1 : cur;
    }, 0);


    const upgradeScanned = [] as any;
    order.upgrades.map((a: any) =>
      a?.scan[0]?.scanned === true && upgradeScanned.push(a?.scan?.startsAt)
    )
    const totalScannedCount = [] as any;
    order.tickets.map((a: any) =>
      a?.scan.map(
        (b) => b.scanned === true && totalScannedCount.push(b.startsAt)
      )
    );
    const scannedOrderItemsCount: number =
      totalScannedCount.length + upgradeScanned.length;

    const totalUpgrades = order?.upgrades?.length;

    const selloutFee = fees?.reduce((cur, next) => {
      return next.appliedBy === FeeAppliedByEnum.Sellout ? cur + parseInt(next.amount) : cur
    }, 0);

    const promoterFee = fees?.reduce((cur, next) => {
      return next.name != "Sales tax" && next.appliedBy === FeeAppliedByEnum.Organization ? cur + parseInt(next?.amount) : cur
    }, 0);


    const stripeFee = fees?.reduce((cur, next) => {
      return next.appliedBy === FeeAppliedByEnum.Stripe ? cur + parseInt(next.amount) : cur
    }, 0);

    const salesTaxFee = fees?.reduce((cur, next) => {
      return next.name === "Sales tax" ? cur + parseInt(next.amount) : cur
    }, 0);

    // const ticketTotal = order.tickets.reduce(
    //   (cur, ticket) => cur + ticket.price,
    //   0
    // );


    // const upgradeTotal = order.upgrades.reduce(
    //   (cur, upgrade) => cur + upgrade.price,
    //   0
    // );
    // console.log("++++>>>>>>/ fees", fees)
    // const totalFee = fees.reduce(
    //   (cur, fee) => cur + parseInt(fee.amount),
    //   0
    // );

    // const ticketupgarde = ticketTotal + upgradeTotal
    // const discountOrder = order?.discountAmount

    // const orderDiscountTotal = ticketupgarde - discountOrder

    // console.log(orderDiscountTotal)
    // console.log("++++>>>>>>", ticketTotal, upgradeTotal, totalFee)
    // const orderSubtotal =
    //   orderDiscountTotal + promoterFee;
    // console.log("++++",orderSubtotal)
    // return Math.round(orderSubtotal);
    // console.log(orderSubtotal)


    const orderTotalDub = OrderUtil?.orderTotal(order, fees) || 0;
    // const orderTotalDub = order?.payments[0]?.amount || 0;
    // const discountOrder = order?.discountAmount

    const orderTotalWithRefund = OrderUtil?.orderTotalWithRefund(order, fees) || 0;
    // const orderTotalWithRefund = order?.payments[0]?.amount || 0;

    //  let  discount= order?.payments[0]?.discount || 0
    // const orderTotalDub =  order.eventId ? OrderUtil.orderTotalExport(order, fees) : OrderUtil.orderTotal(order, fees);
    // const stripeFeesExport = order.eventId ? OrderUtil.stripeFeesExport(order, fees) : OrderUtil.stripeFees(order, fees);;
    // const orderTotalWithRefund =  order.eventId ? OrderUtil.orderExportTotalWithRefund(order, fees) : OrderUtil.orderTotalWithRefund(order, fees);


    // const orderExportTotalWithRefund = OrderUtil.orderExportTotalWithRefund(order, fees);
    // const stripeFeesExport = order.eventId ? OrderUtil.stripeFeesExport(order, fees) : OrderUtil.stripeFees(order, fees);
    // const orderTotalWithRefund = order.eventId ? OrderUtil.orderExportTotalWithRefund(order, fees) : OrderUtil.orderTotalWithRefund(order, fees);

    const summary: any = {
      // guestFees: guestFees,
      // total: guestFees + stripeFeeAmount + OrderUtil.orderTotal(order, fees),
      // orderTotalWithRefund: OrderUtil.orderTotalWithRefund(order, fees),
      // orderTotalWithRefund: OrderUtil.orderExportTotalWithRefund(order, fees),
      total: orderTotalDub || 0,
      orderTotalWithRefund: orderTotalWithRefund || 0,
      subtotal: OrderUtil?.orderSubtotal(order) - order?.payments[0].discount || 0,
      discount: order?.discountAmount || 0,

      // discount: OrderUtil?.discountAmount(order) || 0,
      // selloutFee: OrderUtil.selloutFees(order, fees),
      // stripeFee: OrderUtil.stripeFees(order, fees) + stripeFeeAmount,
      // stripeFee: OrderUtil.stripeFeesExport(order, fees),
      // stripeFee: stripeFeesExport,
      // promoterFee: OrderUtil.promoterFees(order, fees),
      salesTaxFee: salesTaxFee || 0,
      selloutFee: selloutFee || 0,
      stripeFee: stripeFee || 0,
      promoterFee: promoterFee || 0,
      tickets: ticketsItems || 0,
      upgrades: upgradeItems || 0,
      allTickets: allTickets || 0,
      ticketsScanned: ticketsScanned || 0,
      totalTickets: totalTickets || 0,
      upgradesScanned: upgradesScanned || 0,
      totalUpgrades: totalUpgrades || 0,
      state: order?.state || 0,
      refundedItems: refundedItems || 0,
      scannedOrderItemsCount: scannedOrderItemsCount || 0,
      createdAt: order?.createdAt || 0,
    };

    if (full) {
      let orderEntities: IOrderEntities;
      try {
        orderEntities = await this.orderEntities(span, order._id);
      } catch (e) {
        this.logger.error(`orderSummary - error: ${JSON.stringify(e)}`);
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return null;
      }

      const { organization, user, event, season, venues, artists } = orderEntities;

      summary.orgName = organization.orgName;
      summary.userFirstName = user.firstName;
      summary.userLastName = user.lastName;
      summary.userEmail = user.email;
      summary.userPhoneNumber = user.phoneNumber;
      summary.eventName = season ? season.name : event.name;
      summary.venueNames = venues.map((v) => v.name);
      summary.artistNames = artists.map((a) => a.name);
    }

    return summary;
  }

  private async orderSummaryRefunded(
    spanContext: string,
    order: IOrder,
    fees,
    full: boolean = true
  ): Promise<any> {
    const span = tracer.startSpan("orderSummaryRefunded", spanContext);
    const tickets = order.tickets.reduce((cur = {}, next) => {
      if (next && next.refund && next.refund.refunded == false) {
        if (cur && cur.hasOwnProperty(next.ticketTypeId)) {
          let priceValue = next.origionalPrice ? next.origionalPrice : next.price
          // cur[next.ticketTypeId].isMemberIdValid = next.isMemberIdValid;
          cur[next.ticketTypeId].teiMemberId = next.teiMemberId;
          cur[next.ticketTypeId].guestTicket = next.guestTicket;
          cur[next.ticketTypeId].count++;
          cur[next.ticketTypeId].values =
            Number(cur[next.ticketTypeId].values) + Number(next.values);
          cur[next.ticketTypeId].description = next.description;
          cur[next.ticketTypeId].dayIds = next.dayIds;
          if (next.scan[0].scanned) cur[next.ticketTypeId].scannedCount++;
          cur[next.ticketTypeId].price = cur[next.ticketTypeId].origionalPrice
            ? cur[next.ticketTypeId].origionalPrice + priceValue
            : priceValue;
          cur[next.ticketTypeId].seats
            ? cur[next.ticketTypeId].seats.push(next.seat)
            : (cur[next.ticketTypeId].seats = [next.seat]);
        } else {
          cur[next.ticketTypeId] = {
            teiMemberId: next.teiMemberId,
            guestTicket: next.guestTicket,
            values: next.values,
            description: next.description,
            dayIds: next.dayIds,
            typeId: next.ticketTypeId,
            name: next.name,
            // price: next.origionalPrice,
            price: next.origionalPrice ? next.origionalPrice : next.price,
            count: 1,
            refund: 1,
            scannedCount: next.scan[0].scanned ? 1 : 0,
            seats: [next.seat],
          };
        }
        return cur;
      }
    }, {});

    const upgrades = order.upgrades.reduce((cur = {}, next) => {
      if (next && next.refund && next.refund.refunded == false) {
        if (cur.hasOwnProperty(next.upgradeId)) {
          cur[next.upgradeId].count++;
          if (next.scan.scanned) cur[next.upgradeId].scannedCount++;
          cur[next.upgradeId].price = cur[next.upgradeId].price
            ? cur[next.upgradeId].price + next.price
            : next.price;
        } else {
          cur[next.upgradeId] = {
            typeId: next.upgradeId,
            name: next.name,
            price: next.price, //OrderUtil.upgradeTypeTotal(order, next.upgradeId),
            count: 1,
            scannedCount: next.scan.scanned ? 1 : 0,
          };
        }
        return cur;
      }
    }, {});







    const ticketsItems: IOrderSummaryItem[] =
      tickets &&
      Object.keys(tickets).map((k: string): IOrderSummaryItem => tickets[k]);

    const upgradeItems: IOrderSummaryItem[] =
      upgrades &&
      Object.keys(upgrades).map((k: string): IOrderSummaryItem => upgrades[k]);

    const ticketsScanned = order?.tickets?.reduce((cur, next) => {
      return next?.scan[0].scanned ? cur + 1 : 0;
    }, 0);
    const totalTickets = order?.tickets?.length;

    const upgradesScanned = order?.upgrades?.reduce((cur, next) => {
      return next?.scan?.scanned ? cur + 1 : 0;
    }, 0);

    const refundedItems = order?.tickets?.reduce((cur, next) => {
      return next?.refund && next?.refund?.refunded == true ? cur + 1 : cur;
    }, 0);

    const totalUpgrades = order?.upgrades?.length;

    let orderTotalWithRefund = OrderUtil?.orderTotalWithRefund(order, fees) || 0;

    let subtotal = OrderUtil?.orderSubtotal(order) - order?.payments[0]?.discount || 0;

    let discount = order?.discountAmount || 0


    const selloutFee = fees?.reduce((cur, next) => {
      return next.appliedBy === FeeAppliedByEnum.Sellout ? cur + parseInt(next?.amount) : cur
    }, 0);

    const promoterFee = fees?.reduce((cur, next) => {
      return next.name != "Sales tax" && next.appliedBy === FeeAppliedByEnum.Organization ? cur + parseInt(next?.amount) : cur
    }, 0);


    const stripeFee = fees?.reduce((cur, next) => {
      return next.appliedBy === FeeAppliedByEnum.Stripe ? cur + parseInt(next?.amount) : cur
    }, 0);

    const salesTaxFee = fees?.reduce((cur, next) => {
      return next.name === "Sales tax" ? cur + parseInt(next?.amount) : cur
    }, 0);

    // let selloutFee = OrderUtil.selloutFees(order, fees) || 0;
    // let stripeFee = OrderUtil.stripeFees(order, fees) || 0;
    // let promoterFee = OrderUtil.promoterFees(order, fees) || 0;
    // let total = OrderUtil.orderTotal(order, fees) || 0;
    let total = order?.payments[0]?.amount || 0;

    const summary: any = {
      total: total || 0,
      orderTotalWithRefund: orderTotalWithRefund || 0,
      salesTaxFee: salesTaxFee || 0,
      subtotal: subtotal || 0,
      discount: discount || 0,
      selloutFee: selloutFee || 0,
      stripeFee: stripeFee || 0,
      promoterFee: promoterFee || 0,
      tickets: ticketsItems ? ticketsItems : [] || 0,
      upgrades: upgradeItems ? upgradeItems : [] || 0,
      ticketsScanned: ticketsScanned || 0,
      totalTickets: totalTickets || 0,
      upgradesScanned: upgradesScanned || 0,
      totalUpgrades: totalUpgrades || 0,
      state: order?.state || 0,
      refundedItems: refundedItems || 0,
      createdAt: order?.createdAt || 0,
    };

    if (full) {
      let orderEntities: IOrderEntities;
      try {
        orderEntities = await this.orderEntities(span, order._id);
      } catch (e) {
        this.logger.error(`orderSummary - error: ${JSON.stringify(e)}`);
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return null;
      }

      const { organization, user, event, venues, artists } = orderEntities;

      summary.orgName = organization.orgName;
      summary.userFirstName = user.firstName;
      summary.userLastName = user.lastName;
      summary.userEmail = user.email;
      summary.userPhoneNumber = user.phoneNumber;
      summary.eventName = event.name;
      summary.venueNames = venues.map((v) => v.name);
      summary.artistNames = artists.map((a) => a.name);
    }
    return summary;
  }

  private generateQRCodeAndUpload = async (
    spanContext,
    order: IOrder,
    itemId?: string,
    itemType?: OrderItemTypeEnum
  ): Promise<string> => {
    const span = tracer.startSpan("generateQrCodeAndUpload", spanContext);

    const uniqueId: string = `${uuid4()}.png`;
    // it is important to rename this to orderId for the scan app data parsing
    const { orgId, secretId: orderId } = order;

    const qrCodeObject = {
      orderId,
    };

    // append order item type and id for when order is broken apart into individual tickets
    // with conventional naming
    if (itemId && itemType) {
      const itemTypeIdName =
        itemType === OrderItemTypeEnum.Ticket ? "ticketId" : "upgradeId";
      qrCodeObject[itemTypeIdName] = itemId;
    }

    let qrCodeData;
    try {
      // it is important that this is called orderId for the scan app
      qrCodeData = await QRCode.toDataURL(JSON.stringify(qrCodeObject));
    } catch (e) {
      throw e;
    }

    const image = qrCodeData.split("data:image/png;base64,")[1];
    const file = {
      file: Buffer.from(image, "base64"),
      filename: uniqueId,
      mimetype: "image/png",
      encoding: "base64",
    };

    const uploadFileRequest = pb.UploadFileRequest.create({
      spanContext: span.context().toString(),
      orgId,
      files: [file],
      // Gzipping must be turned off for QR codes
      // otherise Plivo MMS will not work
      gzip: false,
    });

    let uploadFileResponse: pb.UploadFileResponse;
    try {
      uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
        uploadFileRequest
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    const { url } = uploadFileResponse.files[0];

    span.finish();
    return url;
  };

  private validateCreateOrderParameters = async (
    spanContext: string,
    params: ICreateOrderParams
  ): Promise<IEvent> => {
    const span = tracer.startSpan("validateCreateOrderParameters", spanContext);
    const { orgId, eventId, tickets, upgrades, channel, promotionCode, parentSeasonOrderId, discountCode, userId } =
      params;

    const isBoxOffice = channel === OrderChannelEnum.BoxOffice;

    /**
     * Retrieve the event
     */
    const findEventRequest = pb.FindEventByIdRequest.create({
      spanContext: span.context().toString(),
      eventId,
    });

    let findEventResponse: pb.FindEventResponse;

    try {
      findEventResponse = await this.proxy.eventService.findEventById(
        findEventRequest
      );
      if (!findEventResponse.event) {
        throw new Error(`Event ${eventId} does not exist.`);
      }
    } catch (e) {
      throw e;
    }

    const { event } = findEventResponse;


    const queryOrdersRequest = pb.QueryOrdersRequest.create({
      spanContext: span.context().toString(),
      query: {
        eventIds: [eventId],
        // state:{ $ne: "Refunded"}
        // userIds:[userId]
      },
    });

    let queryOrderResponse: pb.QueryOrdersResponse;

    try {
      queryOrderResponse = await this.proxy.orderService.queryOrders(queryOrdersRequest);
    } catch (e) {
      throw e;
    }

    const { orders } = queryOrderResponse;
    const usedCode = orders.filter((order) => order?.discountCode?.toLowerCase() === discountCode?.toLowerCase() && order?.userId === userId && order.state !== OrderStateEnum.Refunded && order.state !== OrderItemStateEnum.Canceled);

    const usedCode1 = orders.filter((order) => order?.promotionCode === promotionCode && order?.userId === userId);




    try {
      /**
       * Make sure the order orgId matches the event orgId
       */
      if (event.orgId !== orgId) {
        new Error("Invalid organization ID");
      }

      const {
        promotions,
        schedule: { ticketsAt, ticketsEndAt },
      } = event;

      /*
       * Make sure the promotion code is valid
       */
      if (promotionCode) {
        const promotion = promotions.find(
          (promotion) => promotion?.code?.toLowerCase() === promotionCode?.toLowerCase()
        );

        if (!promotion) {
          throw new Error("Invalid promotion code.");
        }

        if (!promotion.active) {
          throw new Error(
            "The promotion code you entered is no longer active."
          );
        }

        if (promotion.remainingQty <= 0) {
          throw new Error(
            `The promotion code you entered is no longer available.`
          );
        }

        if (promotion?.useLimit <= usedCode1.length && userId) {
          throw new Error(
            "This promo code has already been used by this account."
          );

        }
        // if (promotion.remainingQty < tickets.length) {
        //    throw new Error(`Can only order ${promotion.remainingQty} tickets with this promotion.`);
        // }
      }

      let promotionsCode = event.promotions.find((promo) => promo?.code?.toLowerCase() == discountCode?.toLowerCase());
      if (promotionsCode?.useLimit <= usedCode.length && userId) {
        throw new Error(
          "This discount code has already been used by this account."
        );

      }

      /*
       * Make sure the event is on sale
       * unless it's a box office user
       * creating the order
       */
      const now = Time.now();
      if (!isBoxOffice && !parentSeasonOrderId) {
        if (now < ticketsAt && !promotionCode) {
          throw new Error(`This event is not yet on sale.`);
        }

        if (now > ticketsEndAt) {
          throw new Error("This event is no longer on sale.");
        }
      }

      /**
       * Make sure the event is not sold out
       * Make sure the purchase qty is not over
       * the purchase limit
       */
      const ticketTypesByTicketTypeId = OrderUtil.ticketCountsByTicketTypeId({
        tickets,
      });
      const remainingQtyByTicketTypes =
        EventUtil.remainingQtyByTicketTypes(event);
      // const purchaseLimitByTicketTypes =
      //   EventUtil.purchaseLimitByTicketTypes(event);
      const disabledTicketTypeIds = event.ticketTypes
        .filter((ticketType) => !ticketType.visible)
        .map((ticketType) => ticketType._id);

      Object.keys(ticketTypesByTicketTypeId).forEach((ticketTypeId) => {
        if (disabledTicketTypeIds.includes(ticketTypeId) && !isBoxOffice) {
          throw new Error(
            "One or more selected ticket types is disbaled. Please try again or contact support."
          );
        }

        const purchaseQty = ticketTypesByTicketTypeId[ticketTypeId];
        const remainingQty = remainingQtyByTicketTypes[ticketTypeId];
        // const purchaseLimit = purchaseLimitByTicketTypes[ticketTypeId];
        if (purchaseQty > remainingQty) {
          const ticketType = EventUtil.ticketType(event, ticketTypeId);
          const { name } = ticketType;
          throw new Error(
            `Cannot purchase ${purchaseQty} ${name} tickets, only ${remainingQty} remain.`
          );
        }

        // if (purchaseQty > purchaseLimit && !isBoxOffice) {
        //   const ticketType = EventUtil.ticketType(event, ticketTypeId);
        //   const { name } = ticketType;
        //   throw new Error(
        //     `Cannot purchase ${purchaseQty} ${name} tickets, purchase limit is ${purchaseLimit}.`
        //   );
        // }
      });

      /**
       * Make sure event upgrades are
       * viable to purchase.
       */
      const upgradesByUpgradeId = OrderUtil.upgradeCountsByUpgradeId({
        upgrades,
      });
      const remainingQtyByUpgrades = EventUtil.remainingQtyByUpgrades(event);
      // const purchaseLimitByUpgrades = EventUtil.purchaseLimitByUpgrades(event);
      const disabledUpgradeIds = event.upgrades
        .filter((upgrade) => !upgrade.visible)
        .map((upgrade) => upgrade._id);

      Object.keys(upgradesByUpgradeId).forEach((upgradeId) => {
        if (disabledUpgradeIds.includes(upgradeId) && !isBoxOffice) {
          throw new Error(
            "One or more selected upgrades is disbaled. Please try again or contact support."
          );
        }

        const purchaseQty = upgradesByUpgradeId[upgradeId];
        const remainingQty = remainingQtyByUpgrades[upgradeId];
        // const purchaseLimit = purchaseLimitByUpgrades[upgradeId];
        if (purchaseQty > remainingQty) {
          const upgrade = EventUtil.upgrade(event, upgradeId);
          const { name } = upgrade;
          throw new Error(
            `Cannot purchase ${purchaseQty} ${name} upgrades, only ${remainingQty} remain.`
          );
        }

        // if (purchaseQty > purchaseLimit && !isBoxOffice) {
        //   const upgrade = EventUtil.upgrade(event, upgradeId);
        //   const { name } = upgrade;
        //   throw new Error(
        //     `Cannot purchase ${purchaseQty} ${name} upgrades, purchase limit is ${purchaseLimit}.`
        //   );
        // }
      });
    } catch (e) {
      throw e;
    }

    return event;
  };

  private validateCreateSeasonOrderParameters = async (
    spanContext: string,
    params: ICreateOrderParams
  ): Promise<ISeason> => {
    const span = tracer.startSpan(
      "validateCreateSeasonOrderParameters",
      spanContext
    );
    const {
      orgId,
      seasonId,
      tickets,
      upgrades,
      channel,
      // eventIds,
      promotionCode,
    } = params;

    const isBoxOffice = channel === OrderChannelEnum.BoxOffice;

    /**
     * Retrieve the season
     */
    const findSeasonRequest = pb.FindSeasonByIdRequest.create({
      spanContext: span.context().toString(),
      seasonId,
    });

    let findSeasonResponse: pb.FindSeasonResponse;

    try {
      findSeasonResponse = await this.proxy.seasonService.findSeasonById(
        findSeasonRequest
      );
      if (!findSeasonResponse.season) {
        throw new Error(`Season ${seasonId} does not exist.`);
      }
    } catch (e) {
      throw e;
    }

    const { season } = findSeasonResponse;

    try {
      /**
       * Make sure the order orgId matches the season orgId
       */
      if (season.orgId !== orgId) {
        new Error("Invalid organization ID");
      }

      const {
        promotions,
        schedule: { ticketsAt, ticketsEndAt },
      } = season;

      /*
       * Make sure the promotion code is valid
       */
      if (promotionCode) {
        const promotion = promotions.find(
          (promotion) => promotion.code === promotionCode
        );

        if (!promotion) {
          throw new Error("Invalid promotion code.");
        }

        if (!promotion.active) {
          throw new Error(
            "The promotion code you entered is no longer active."
          );
        }

        if (promotion.remainingQty <= 0) {
          throw new Error(
            `The promotion code you entered is no longer available.`
          );
        }

        // if (promotion.remainingQty < tickets.length) {
        //    throw new Error(`Can only order ${promotion.remainingQty} tickets with this promotion.`);
        // }
      }

      /*
       * Make sure the season is on sale
       * unless it's a box office user
       * creating the order
       */
      const now = Time.now();
      if (!isBoxOffice) {
        if (now < ticketsAt && !promotionCode) {
          throw new Error(`This season is not yet on sale.`);
        }

        if (now > ticketsEndAt) {
          throw new Error("This season is no longer on sale.");
        }
      }

      /**
       * Make sure the season is not sold out
       * Make sure the purchase qty is not over
       * the purchase limit
       */
      const ticketTypesByTicketTypeId = OrderUtil.ticketCountsByTicketTypeId({
        tickets,
      });
      const remainingQtyByTicketTypes =
        SeasonUtil.remainingQtyByTicketTypes(season);
      // const purchaseLimitByTicketTypes =
      //   SeasonUtil.purchaseLimitByTicketTypes(season);
      const disabledTicketTypeIds = season.ticketTypes
        .filter((ticketType) => !ticketType.visible)
        .map((ticketType) => ticketType._id);

      Object.keys(ticketTypesByTicketTypeId).forEach((ticketTypeId) => {
        if (disabledTicketTypeIds.includes(ticketTypeId) && !isBoxOffice) {
          throw new Error(
            "One or more selected ticket types is disbaled. Please try again or contact support."
          );
        }

        const purchaseQty = ticketTypesByTicketTypeId[ticketTypeId];
        const remainingQty = remainingQtyByTicketTypes[ticketTypeId];
        // const purchaseLimit = purchaseLimitByTicketTypes[ticketTypeId];

        if (purchaseQty > remainingQty) {
          const ticketType = SeasonUtil.ticketType(season, ticketTypeId);
          const { name } = ticketType;
          throw new Error(
            `Cannot purchase ${purchaseQty} ${name} tickets, only ${remainingQty} remain.`
          );
        }

        // if (purchaseQty > purchaseLimit && !isBoxOffice) {
        //   const ticketType = SeasonUtil.ticketType(season, ticketTypeId);
        //   const { name } = ticketType;
        //   throw new Error(
        //     `Cannot purchase ${purchaseQty} ${name} tickets, purchase limit is ${purchaseLimit}.`
        //   );
        // }
      });

      /**
       * Make sure event upgrades are
       * viable to purchase.
       */
      //   const eventIds = SeasonUtil.
      const upgradesByUpgradeId = OrderUtil.upgradeCountsByUpgradeId({
        upgrades,
      });
      const remainingQtyByUpgrades = EventUtil.remainingQtyByUpgrades(season);
      // const purchaseLimitByUpgrades = EventUtil.purchaseLimitByUpgrades(season);
      const disabledUpgradeIds = season.upgrades
        .filter((upgrade) => !upgrade.visible)
        .map((upgrade) => upgrade._id);

      Object.keys(upgradesByUpgradeId).forEach((upgradeId) => {
        if (disabledUpgradeIds.includes(upgradeId) && !isBoxOffice) {
          throw new Error(
            "One or more selected upgrades is disbaled. Please try again or contact support."
          );
        }

        const purchaseQty = upgradesByUpgradeId[upgradeId];
        const remainingQty = remainingQtyByUpgrades[upgradeId];
        // const purchaseLimit = purchaseLimitByUpgrades[upgradeId];

        if (purchaseQty > remainingQty) {
          const upgrade = EventUtil.upgrade(season, upgradeId);
          const { name } = upgrade;
          throw new Error(
            `Cannot purchase ${purchaseQty} ${name} upgrades, only ${remainingQty} remain.`
          );
        }

        // if (purchaseQty > purchaseLimit && !isBoxOffice) {
        //   const upgrade = EventUtil.upgrade(season, upgradeId);
        //   const { name } = upgrade;
        //   throw new Error(
        //     `Cannot purchase ${purchaseQty} ${name} upgrades, purchase limit is ${purchaseLimit}.`
        //   );
        // }
      });
    } catch (e) {
      throw e;
    }

    return season;
  };

  public ticketRestriction = async (
    request: pb.TicketRestrictionRequest
  ): Promise<pb.TicketRestrictionResponse> => {
    const span = tracer.startSpan("ticketRestriction", request.spanContext);
    const response: pb.TicketRestrictionResponse = pb.TicketRestrictionResponse.create();
    /**
     * Validate the request
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      query: Joi.object().keys({
        eventId: Joi.string().optional().allow(''),
        seasonId: Joi.string().optional().allow(''),
        teiMemberId: Joi.array().items(Joi.string()).default([]),
      }),
    });
    const validation = schema.validate(request);

    const {
      query
    }: {
      query: ITicketRestriction;
    } = validation.value;

    if (validation.error) {
      this.logger.error(
        `ticketRestriction - error: ${JSON.stringify(validation.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }

    // let ticketRestriction: ITicketRestriction;
    /**
    * Get the order
    */

    let order: IOrder[];
    try {
      order = await this.storage.findOrderById(span, query.eventId, query.seasonId, query.teiMemberId);
      //     
      let objMemeberIds = {};
      let objValidMemeberIds = {};
      query.teiMemberId.map(teiMId => {
        objMemeberIds[teiMId] = 0,
          objValidMemeberIds[teiMId] = false
      })

      for (let resOdr of order) {
        for (let res of resOdr.tickets) {
          if (res.teiMemberId && query.teiMemberId.includes(res.teiMemberId)) {
            if (res.guestTicket) {
              objMemeberIds[res.teiMemberId] = (objMemeberIds[res.teiMemberId] || 0) + 1
            } else {
              objValidMemeberIds[res.teiMemberId] = true
            }
          }
        }
      }

      let totalGuestTicketCount = [];
      for (const memberId in objMemeberIds) {
        totalGuestTicketCount.push({
          teiMemberId: memberId,
          count: objMemeberIds[memberId],
          inValid: objValidMemeberIds[memberId]
        })
      }

      // for (let resOdr of order) {
      //         for (let res of resOdr.tickets) {
      //           if (res.teiMemberId && query.teiMemberId.includes(res.teiMemberId)) {
      //             objMemeberIds[res.teiMemberId] = true
      //             // objMemeberIds.push(res.teiMemberId)
      //           }
      //         }
      //       }
      //       let validMemIds = [];
      //       let invalidMemIds = [];
      //       for (let prop in objMemeberIds) {
      //         if (!objMemeberIds[prop]) {
      //           validMemIds.push(prop)
      //         } else {
      //           invalidMemIds.push(prop)
      //         }
      //       }
      // =======
      response.status = pb.StatusCode.OK;
      response.eventId = query.eventId;
      response.seasonId = query.seasonId;
      response.guestTicketCounts = totalGuestTicketCount;
      // response.teiMemberId = validMemIds;
      // response.invalidTeiMemberIds = invalidMemIds;
      return response
    } catch (e) {
      0.
      this.logger.error(`ticketRestriction - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

  }

  public createOrder = async (
    request: pb.CreateOrderRequest
  ): Promise<pb.CreateOrderResponse> => {
    const span = tracer.startSpan("createOrder", request.spanContext);
    const response: pb.CreateOrderResponse = pb.CreateOrderResponse.create();
    /**
     * Validate the request
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().required(),
      params: Joi.object().keys({
        userId: Joi.string().optional().allow(''),
        orgId: Joi.string().required(),
        eventId: Joi.string().required(),
        tickets: Joi.array().optional().default([]),
        upgrades: Joi.array().optional().default([]),
        type: Joi.string().default(OrderTypeEnum.Paid),
        channel: Joi.string().default(OrderChannelEnum.Online),
        promotionCode: Joi.string()
          .allow("", null)
          .empty(["", null])
          .default(null),
        discountCode: Joi.string()
          .allow("", null)
          .empty(["", null])
          .default(null),
        customFields: Joi.array(),
        paymentMethodType: Joi.string().required(),
        paymentIntentId: Joi.string().optional().allow(""),
        holdToken: Joi.string().optional(),
        ipAddress: Joi.string(),
        hidden: Joi.boolean().default(false),
        parentSeasonOrderId: Joi.string().optional(),
        discountAmount: Joi.number().allow("", null)
          .empty(["", null])
          .default(null),
      }),
    });
    const validation = schema.validate(request);

    const {
      requestorId,
      params
    }: {
      requestorId: string;
      params: ICreateOrderParams & { ipAddress: string };
    } = validation.value;

    if (validation.error) {
      this.logger.error(
        `createOrder - error: ${JSON.stringify(validation.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }

    let event: IEvent;
    try {
      event = await this.validateCreateOrderParameters(span, params);
    } catch (e) {
      this.logger.error(`createOrder - error 1: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }


    let {
      userId,
      orgId,
      eventId,
      tickets,
      upgrades,
      type,
      channel,
      promotionCode,
      discountCode,
      customFields,
      paymentMethodType,
      paymentIntentId,
      holdToken,
      ipAddress,
      hidden,
      parentSeasonOrderId = '',
      discountAmount
    } = params;

    const promotionsCode = event?.promotions.filter((promo) => promo?.code?.toLowerCase() === discountCode?.toLowerCase());
    if (promotionsCode.length != 0) {
      discountCode = promotionsCode[0]?.code || ""
    }
    if (promotionsCode.length != 0) {
      tickets = tickets.map(ticket => {
        if (promotionsCode && promotionsCode[0].discountType === EventPromotionDiscountTypeEnum.Flat && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerTicket) {
          if (promotionsCode[0]?.ticketTypeIds.length == 0) {
            const discountValue = Number(promotionsCode[0].discountValue);
            const originalPrice = ticket.price;
            const discountedPrice = originalPrice - discountValue;
            return {
              ...ticket,
              price: discountedPrice
            };
          } else {
            if (promotionsCode && promotionsCode[0].ticketTypeIds.includes(ticket?.ticketTypeId)) {
              const discountValue = Number(promotionsCode[0].discountValue);
              const originalPrice = ticket.price;
              const discountedPrice = originalPrice - discountValue;
              return {
                ...ticket,
                price: discountedPrice
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
        if (promotionsCode && promotionsCode[0].discountType === EventPromotionDiscountTypeEnum.Percent && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerTicket) {
          if (promotionsCode[0]?.ticketTypeIds.length == 0) {
            const discountValue = Number(promotionsCode[0].discountValue);
            const percentTicketValue = (ticket.origionalPrice * discountValue) / 100
            const originalPrice = ticket.price;
            const discountPercentPrice = originalPrice - percentTicketValue
            // const discountedPrice = originalPrice
            // console.log("percentTicketValue", percentTicketValue);

            return {
              ...ticket,
              price: discountPercentPrice
            };
          } else {
            if (promotionsCode[0]?.ticketTypeIds.includes(ticket?.ticketTypeId)) {
              const discountValue = Number(promotionsCode[0].discountValue);
              const percentTicketValue = (ticket.origionalPrice * discountValue) / 100
              const originalPrice = ticket.price;
              const discountPercentPrice = originalPrice - percentTicketValue
              // const discountedPrice = originalPrice
              // console.log("percentTicketValue", percentTicketValue);

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


    const discountFeeFlatPerOrderAmt = promotionsCode?.reduce(
      (cur: number, promotion: any) => {
        if (
          promotionsCode?.length &&
          promotionsCode[0].discountType === EventPromotionDiscountTypeEnum.Flat &&
          promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder
        ) {
          const value = cur + promotion.discountValue;
          return value;
        }
        return cur;
      },
      0
    );
    const ticketTotal = tickets.reduce((cur, ticket) => cur + ticket.price, 0);
    const upgradeTotal = upgrades.reduce(
      (cur, upgrade) => cur + upgrade.price,
      0
    );
    const totalTicketUpgrade = ticketTotal + upgradeTotal;

    const discountFeePercentPerOrderAmt = promotionsCode?.reduce(
      (cur: number, promotion: any) => {
        if (
          promotionsCode?.length &&
          promotionsCode[0].discountType === EventPromotionDiscountTypeEnum.Percent &&
          promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder
        ) {
          const value = cur + (totalTicketUpgrade * promotion.discountValue) / 100;
          return value;
        }
        return cur;
      },
      0
    );

    // console.log("Amt percent per order",discountFeePercentPerOrderAmt)


    // console.log("Amt flat per order", discountFeeFlatPerOrderAmt)

    // if (
    //   promotionsCode?.length &&
    //   promotionsCode[0]?.discountType === "Flat" &&
    //   promotionsCode[0]?.appliesTo === "Per Order"
    // ) {
    //   const data = tickets.length + upgrades.length;
    //   const discountValue = Number(promotionsCode[0]?.discountValue);
    //   console.log(data, "ticketsForOrder");
    //   const newData = discountValue / data;

    //   console.log(newData);

    //   tickets.forEach((ticket) => {
    //     ticket.price -= newData;
    //   }

    //   )
    //   upgrades.forEach((upgrade) => {
    //     upgrade.price -= newData;
    //   }
    //   )

    // }
    // if (
    //   promotionsCode?.length &&
    //   promotionsCode[0].discountType === "Percent" &&
    //   promotionsCode[0].appliesTo === "Per Order"
    // ) {
    //   const data = tickets.length + upgrades.length;
    //   const discountValue = Number(promotionsCode[0].discountValue);
    //   // console.log(data, "ticketsForOrder");
    //   const newData = (data * discountValue) / 100;

    //   console.log(newData);

    //   tickets.forEach((ticket) => {
    //     ticket.price -= newData;
    //   }

    //   )
    //   upgrades.forEach((upgrade) => {
    //     upgrade.price -= newData;
    //   }
    //   )

    // }


    // if (
    //   event?.promotions?.length &&
    //   event?.promotions[0].discountType === "Flat" &&
    //   event?.promotions[0].appliesTo === "Per Order"
    // ) {
    //   const data = tickets.length + upgrades.length;
    //   const discountValue = Number(event?.promotions[0].discountValue);
    //   console.log(data, "ticketsForOrder");
    //   const newData = discountValue / data;

    //   console.log(newData);

    //   tickets.forEach((ticket)=> {
    //     ticket.price -= newData;
    //   }

    // )
    // upgrades.forEach((upgrade)=> {
    //   upgrade.price -= newData;
    // }
    // )



    // console.log(tickets); // Updated 'tickets' array with modified prices



    /**
     * Create venueIds and artistIds arrays
     * to save on the order object
     * from the retrieved event object
     */
    const venueIds = EventUtil.venueIds(event);
    const artistIds = EventUtil.artistIds(event);
    let dayIds = [];
    if (tickets.length != 0) {
      tickets.map((ticket) => {
        let scan = [];
        // dayIds = ticket.dayIds.filter(day => !dayIds.includes(day))
        if (!ticket.dayIds || ticket.dayIds.length == 0) {
          if (!dayIds.includes(event.schedule.startsAt)) {
            dayIds.push(event.schedule.startsAt);
          }
          scan.push({
            scanned: false,
            scannedAt: 0,
            scannedBy: "",
            startsAt: event.schedule.startsAt,
          });
        } else {
          ticket.dayIds.map((day) => {
            if (!dayIds.includes(day)) {
              dayIds.push(day);
            }
            scan.push({
              scanned: false,
              scannedAt: 0,
              scannedBy: "",
              startsAt: parseInt(day),
            });
          });
        }
        return (ticket.scan = scan);
      });
    } else {
      if (!dayIds.includes(event.schedule.startsAt)) {
        dayIds.push(event.schedule.startsAt);
      }

    }

    /**
     * Initalize these values to [] for all orders
     * If the order is a comp, they will stay [].
     * If the order is not a comp, they will be populated below
     */
    let fees = [];
    let feeIds = [];

    /**
     * Only apply fees to order types that are paid
     */
    if (type === OrderTypeEnum.Paid) {
      const listFeesRequest = pb.ListEventFeesRequest.create({
        spanContext: span.context().toString(),
        orgId,
        eventId,
      });

      let listFeesResponse: pb.ListEventFeesResponse;
      try {
        listFeesResponse = await this.proxy.feeService.listEventFees(
          listFeesRequest
        );
        if (listFeesResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            "Failed to fetch event fees. Please try again or contact support."
          );
        }
      } catch (e) {
        this.logger.error(`createOrder - error 3: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message:
              "Failed create order fees. Please try again or contact support.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      fees = listFeesResponse.fees;
      fees = fees.filter((fee: IFee) => {
        if (!fee?.paymentMethods || fee?.paymentMethods?.length == 0) {
          return true
        } else if (fee?.paymentMethods?.includes(paymentMethodType as any)) {
          return true
        } else {
          return false
        }
      })

      feeIds = fees.map((f) => f._id);

    }

    let address: IAddress = {};

    /**
     * Gecode the IP Address
     */
    try {
      const res = await IPStack.gecodeIPAddress(ipAddress);
      const { city, region_code, zip, country_code, latitude, longitude } = res;

      address = {
        address1: null,
        address2: null,
        city: city,
        state: region_code,
        zip: zip,
        country: country_code,
        lat: latitude,
        lng: longitude,
      };
    } catch (e) {
      this.logger.error(e);
      span.setTag("error", true);
      span.log({ errors: e.message });
    }
    if (tickets.length != 0) {
      /**
     * Book seats in Seats.IO, if needed
     */
      if (event.seatingChartKey && !hidden) {
        try {
          // A hold token is required to book seats
          if (!holdToken) {
            throw new Error(
              "Your order has timed out. Please refresh the page and start again."
            );
          }

          // All tickets must have a value for seat
          if (tickets.find((ticket) => !ticket.seat)) {
            throw new Error("Please select seats for all selected tickets.");
          }

          const bookSeatsRequest = pb.BookSeatsRequest.create({
            spanContext: span.context().toString(),
            orgId: orgId,
            eventId: eventId,
            holdToken: holdToken,
            seats: tickets.map((ticket) => ticket.seat),
          });

          let bookSeatsResponse: pb.bookSeatsResponse;

          bookSeatsResponse = await this.proxy.seatingService.bookSeats(
            bookSeatsRequest
          );

          if (bookSeatsResponse.status !== pb.StatusCode.OK) {
            throw new Error(bookSeatsResponse.errors[0].message);
          }
        } catch (e) {
          console.error(e);
          this.logger.error(`createOrder - error 4: ${e.message}`);
          response.status = pb.StatusCode.BAD_REQUEST;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: e.message,
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
    }



    /**
     * Create order attributes
     */
    const eventName = event.name;
    const now = Time.now();
    const attributes: IOrder = {
      userId,
      orgId,
      eventId,
      eventName,
      venueIds,
      artistIds,
      feeIds,
      fees: fees as IFee[],
      tickets: tickets as IOrderTicket[],
      upgrades: upgrades as IOrderUpgrade[],
      type,
      tax: 0,
      channel,
      createdAt: now,
      createdBy: requestorId,
      promotionCode: promotionCode || null,
      discountCode: discountCode || null,
      ipAddress,
      address,
      customFields,
      payments: [],
      hidden,
      // discountAmount:discountAmount || null,
      parentSeasonOrderId,
      discountAmount

    };

    /*
     * Inital these values to 0 for all orders
     * If the order is a comp, they will stay 0.
     * If the order is not a comp, they will be populated below
     */
    let paymentTotal = 0;
    let transferAmount = 0;
    let feeAmount = 0;

    let payment: IPayment = {
      _id: shortid.generate(),
      paymentIntentId,
      amount: paymentTotal,
      transferAmount,
      feeAmount,
      feeIds,
      tax: 0,
      createdAt: now,
      createdBy: requestorId,
      promotionCode: promotionCode || null,
      discountCode: discountCode || null,
      paymentMethodType,
      discount: 0
    };

    /**
     * Only capture payment intents for paid orders
     */
    let paymentCalucatorParams = {
      tickets,
      upgrades,
      fees,
      paymentMethodType,
      promotions: promotionsCode[0]?.appliesTo === EventPromotionAppliesToEnum.PerOrder ? promotionsCode : []
      // promotions:promotionsCode
      // promotions: event?.promotions || []
    };
    if (payment) {
      // payment.amount = PaymentUtil.calculatePaymentTotal(
      //   paymentCalucatorParams
      // );

      const findOrgRequest = pb.FindOrganizationRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
      });

      let findOrgResponse: pb.FindOrganizationResponse;

      try {
        findOrgResponse = await this.proxy.organizationService.findOrganization(
          findOrgRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order organization: ${e.message}`);
      }

      const { organization } = findOrgResponse;

      event.fees = fees;
      event.organization = organization;
      // let guestFees = PaymentUtil.calculateGuestFee(
      //   tickets as any,
      //   event as any
      // );



      // payment.amount = PaymentUtil.calculatePaymentTotal(
      //   paymentCalucatorParams
      // ) + guestFees;
      payment.amount = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).total || 0);

      payment.transferAmount = Math.round((payment.amount - PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).totalFees) || 0);


      // payment.transferAmount =
      //   payment.amount -
      //   PaymentUtil.calculateProcessingFee(paymentCalucatorParams);
      // payment.feeAmount = PaymentUtil.calculatePlatformFee(
      //   paymentCalucatorParams
      // );
      // payment.tax = await PaymentUtil.calculateTaxFee(paymentCalucatorParams);

      payment.feeAmount = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).selloutFees || 0);
      payment.tax = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).salesTax || 0);
      payment.discount = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).discountAmount || 0);

    }

    let tax = fees.filter((fee) => {
      if (fee.name.toLowerCase() === "sales tax") {
        return fee.name;
      }
    });
    attributes.tax = tax.length > 0 ? tax[0].value : 0;
    let chargeId;
    if (
      (paymentMethodType !== PaymentMethodTypeEnum.Cash && paymentMethodType !== PaymentMethodTypeEnum.Check) &&
      paymentMethodType !== PaymentMethodTypeEnum.None
    ) {
      if (!hidden) {
        const captureStripePaymentIntentRequest =
          pb.CaptureStripePaymentIntentRequest.create({
            spanContext: span.context().toString(),
            orgId,
            paymentIntentId,
          });
        let captureStripePaymentIntentResponse: pb.CaptureStripePaymentIntentResponse;
        try {
          captureStripePaymentIntentResponse =
            await this.proxy.stripeService.captureStripePaymentIntent(
              captureStripePaymentIntentRequest
            );
          chargeId = captureStripePaymentIntentResponse.chargeId;
          if (captureStripePaymentIntentResponse.status !== pb.StatusCode.OK) {
            throw new Error(
              "Unable to create payment intent. Please contact support."
            );
          }
        } catch (e) {
          this.logger.error(`createOrder - error 5: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: e.message,
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
    }
    /**
     * Save the payment on the order
     */
    attributes.payments = [payment];
    attributes.stripeChargeId = chargeId;
    /**
     * Assign states
     */
    attributes.state = OrderStateEnum.Active;
    attributes.tickets = attributes.tickets.map((ticket) => {
      ticket.paymentId = payment._id;
      ticket.state = OrderItemStateEnum.Active;
      return ticket;
    });
    attributes.upgrades = attributes.upgrades.map((upgrade) => {
      upgrade.paymentId = payment._id;
      upgrade.state = OrderItemStateEnum.Active;
      return upgrade;
    });

    const discountOrder =

      Math.round(
        discountFeeFlatPerOrderAmt || 0 + discountFeePercentPerOrderAmt || 0) || 0;

    let newSubtotal = OrderUtil.orderSubtotal(attributes);
    let subtotal = (newSubtotal - discountOrder)

    // let promoterFees = OrderUtil.promoterFees(attributes, fees);
    let promoterFees = [];
    let selloutFees = [];
    let salesTaxFees = [];
    let stripeFees = [];

    fees.map(item => {
      item.amount = 0;
      if (item.appliedBy === FeeAppliedByEnum.Stripe) {
        stripeFees.push(item)
      } else if (item.appliedBy === FeeAppliedByEnum.Sellout) {
        selloutFees.push(item)
      } else {
        if (item.name === "Sales tax") {
          salesTaxFees.push(item)
        } else {
          promoterFees.push(item)
        }
      }
    })

    const ticketFeesPromotersPercent = fees.filter(
      (f) =>
        f.appliedTo === FeeAppliedToEnum.Ticket &&
        f.appliedBy == FeeAppliedByEnum.Organization &&
        f.type === FeeTypeEnum.Percent
    );

    // Promoter Fee
    // let promoCodeAdd = 0;

    // promoterFees.map(promo => {
    //   // promo.amount = OrderUtil.promoterFees(attributes, [promo])
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
    let promoCodeAdd = 0;
    let promoterFeePercentPerOrder11 = 0;
    promoterFees.map(promo => {
      // if(promo.
      if (promo.type === FeeTypeEnum.Percent && promo.appliedTo === FeeAppliedToEnum.Ticket && promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {
        const promoterFeePercentPerTicketTotal = tickets.reduce((cur, ticket) => {
          let mainPrice = ticket.price;
          ticket.price = ticket.origionalPrice;
          return (
            cur +
            ticketFeesPromotersPercent.reduce((cur, fee) => {
              const value = cur + applyTicketFee(ticket, fee);
              ticket.price = mainPrice;
              return value;
            }, 0)
          );
        }, 0);
        // console.log(promoterFeePercentPerTicketTotal)
        promo.amount = promoterFeePercentPerTicketTotal;
        ""
      } else if (promo.type === FeeTypeEnum.Percent && promo.appliedTo === FeeAppliedToEnum.Order && promotionsCode.length != 0 && promotionsCode[0]?.appliesTo === EventPromotionAppliesToEnum.PerOrder) {
        promoterFeePercentPerOrder11 = promoterOrderFees.reduce((acc, fee) => {
          if (fee.type == FeeTypeEnum.Percent) {
            return acc + getFeeAmount(fee, subtotal);
          }
          console.log(promoterFeePercentPerOrder11)
          return acc;
        }, 0);

        promo.amount = Math.round(promoterFeePercentPerOrder11)

      } else {
        promo.amount = OrderUtil.promoterFees(attributes, [promo])
      }




      promoCodeAdd += (Math.round((promo.amount) * 100) / 100) || 0
    })
    // Order SubTotal With Promoter
    let orderSubTotalWithPromoter = subtotal + promoCodeAdd;

    // Sales Tax
    let salesTaxAmount = 0;
    salesTaxFees.map((item) => {
      let amount = (orderSubTotalWithPromoter * item.value) / 100;
      salesTaxAmount = Math.round(amount);
      item.amount = salesTaxAmount;
    });

    // Promoter Total
    let promoterTotal = orderSubTotalWithPromoter + salesTaxAmount;

    // Sellout Fee
    function getFeeAmount(fee, amt) {
      if (fee.type === FeeTypeEnum.Percent) {
        let percent = amt * (fee.value / 100);
        return (Math.round((percent) * 100) / 100) || 0;
      }
      if (fee.type === FeeTypeEnum.Flat) {
        return fee.value;
      }
    }
    function applyTicketFee(
      ticket,
      fee
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
          let percent = (ticket.price * fee.value) / 100;
          return (Math.round((percent) * 100) / 100) || 0;
        }
      } else {
        return 0;
      }

      return 0;
    }

    let selloutOrderFee = 0;
    for (let index = 0; index < selloutFees.length; index++) {
      const sellout = selloutFees[index];
      if (sellout.appliedTo === FeeAppliedToEnum.Order) {
        sellout.amount = Math.round(getFeeAmount(sellout, promoterTotal));
        selloutOrderFee += Math.round(sellout.amount) || 0;
      }
    }
    let selloutFeesAmt = 0;
    for (let index = 0; index < selloutFees.length; index++) {
      let selloutFee = selloutFees[index];
      if (selloutFee.appliedTo === FeeAppliedToEnum.Ticket) {
        let selloutFeeArr = [selloutFee];
        const selloutFeeFlatPerTicketAmt = attributes.tickets.reduce((cur: number, ticket: any) => {

          return (
            cur +
            selloutFeeArr.reduce((cur: number, fee: IFee) => {
              if (fee.filters.includes(FeeFiltersEnum.GuestTicket) && !ticket.guestTicket) {
                return cur
              }
              if (fee.type == FeeTypeEnum.Flat) {
                const value = cur + applyTicketFee(ticket, fee);
                return value;
              }
              return cur
            }, 0)
          );
        }, 0);
        selloutFee.amount = Math.round(selloutFeeFlatPerTicketAmt);
        selloutFeesAmt += Math.round(selloutFee.amount) || 0;
      }
    }

    function applyUpgradeFee(
      upgrade,
      fee,
    ): number {
      const minFee = fee.minAppliedToPrice || 0;
      const maxFee = fee.maxAppliedToPrice || Infinity;

      if (minFee <= upgrade.price && upgrade.price <= maxFee) {
        if (fee.type === FeeTypeEnum.Flat) {
          return fee.value;
        }
        if (fee.type === FeeTypeEnum.Percent) {
          let percent = (upgrade.price * fee.value) / 100;
          return (Math.round((percent) * 100) / 100) || 0;
        }
      } else {
        return 0;
      }

      return 0;
    }
    for (let index = 0; index < selloutFees.length; index++) {
      let selloutUpgradeFee = selloutFees[index];
      if (selloutUpgradeFee.appliedTo === FeeAppliedToEnum.Upgrade) {
        let selloutUpgardeFeeArr = [selloutUpgradeFee];
        const selloutFeeFlatPerUpgardeAmt = attributes.upgrades.reduce((cur: number, upgrade: any) => {
          return (
            cur +
            selloutUpgardeFeeArr.reduce((cur, fee) => {
              const value = cur + applyUpgradeFee(upgrade, fee);
              return value;
            }, 0)
          );
        }, 0);
        selloutUpgradeFee.amount = Math.round(selloutFeeFlatPerUpgardeAmt);
        selloutFeesAmt += Math.round(selloutUpgradeFee.amount) || 0;
      }
    }
    for (let index = 0; index < promoterFees.length; index++) {
      let promoterUpgradeFee = promoterFees[index];
      if (promoterUpgradeFee.appliedTo === FeeAppliedToEnum.Upgrade) {
        let promoterUpgardeFeeArr = [promoterUpgradeFee];
        const promoterFeeFlatPerUpgardeAmt = attributes.upgrades.reduce((cur: number, upgrade: any) => {
          return (
            cur +
            promoterUpgardeFeeArr.reduce((cur, fee) => {
              const value = cur + applyUpgradeFee(upgrade, fee);
              return value;
            }, 0)
          );
        }, 0);
        promoterUpgradeFee.amount = Math.round(promoterFeeFlatPerUpgardeAmt);
        promoCodeAdd += Math.round(promoterUpgradeFee.amount) || 0;
      }
    }
    let selloutFee = Math.round(selloutOrderFee + selloutFeesAmt);

    // Pre Stripe Total
    let preStripeTotal = promoterTotal + selloutFee;

    //Stripe Total Fee
    let stripeTotalFee = 0;
    let stripeFeeFlat = stripeFees.find(fee => fee.type == FeeTypeEnum.Flat)?.value || 0
    let stripeFeePercentage = stripeFees.find(fee => fee.type == FeeTypeEnum.Percent)?.value || 0
    const totalWithStripeFlatFee = preStripeTotal + stripeFeeFlat
    stripeTotalFee = Math.round((totalWithStripeFlatFee / (1 - (stripeFeePercentage / 100)) - preStripeTotal))


    // if (attributes.payments[0].paymentMethodType === PaymentMethodTypeEnum.Cash || attributes.payments[0].paymentMethodType === PaymentMethodTypeEnum.Check) {
    //   for (let item of stripeFees) {
    //     item.amount = 0;
    //   }
    // } else {
    //   stripeFees.map((item) => {
    //     if (item.type == FeeTypeEnum.Flat) {
    //       item.amount = item.value || 0;
    //     } else {
    //       item.amount = Math.round((((stripeTotalFee - stripeFeeFlat) * 100) / 100) || 0)
    //     }
    //   });
    // }
    stripeFees.map((item) => {
      if (item.type == FeeTypeEnum.Flat) {
        item.amount = item.value || 0;
      } else {
        item.amount = Math.round((((stripeTotalFee - stripeFeeFlat) * 100) / 100) || 0)
      }
    });

    attributes.fees = fees;
    /**
     * Save the new order to storage
     */
    let order: IOrder;
    try {
      order = await this.storage.createOrder(span, attributes);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`createOrder - error 6: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Order creation was unsuccessful. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e });
      span.finish();
      return response;
    }

    if (order.userId != null && order.userId != '') {
      /**
       * Send the order receipt
       */
      if (EventUtil.shouldSendOrderReceipt(event) && !hidden) {
        const sendReceipt = async () => {
          const span1 = tracer.startSpan("createOrder.sendReceipt", span);
          const sendOrderReceiptEmailRequest =
            pb.SendOrderReceiptEmailRequest.create({
              spanContext: span.context().toString(),
              orderId: order._id.toString(),
            });
          try {
            await this.proxy.orderService.sendOrderReceiptEmail(
              sendOrderReceiptEmailRequest
            );
          } catch (e) {
            this.logger.error(
              `createOrder - error 7 - orderId: ${order._id}: ${e.message}`
            );
            span1.setTag("error", true);
            span1.log({ errors: e.message });
          }
        };
        sendReceipt();
      }

      /**
       * Send the order QR Code
       */
      // if (EventUtil.qrCodeEmailAt(event) <= Time.now()) {

      if (EventUtil.qrCodeEmailAt(event) <= Time.now()) {
        if (!hidden && EventUtil.qrCodeEmailAt(event) <= Time.now()) {
          const sendQRCode = async () => {
            const span1 = tracer.startSpan("createOrder.sendQRCode", span);
            const sendOrderQRCodeEmailRequest =
              pb.SendOrderQRCodeEmailRequest.create({
                spanContext: span.context().toString(),
                orderId: order._id.toString(),
              });
            try {
              const res = await this.proxy.orderService.sendOrderQRCodeEmail(
                sendOrderQRCodeEmailRequest
              );
              this.logger.info(res);
            } catch (e) {
              this.logger.error(
                `createOrder - error 8 - orderId: ${order._id}: ${e.message}`
              );
              span1.setTag("error", true);
              span1.log({ errors: e.message });
              span1.finish();
            }
          };
          sendQRCode(); // send qr code function
        }

        const span2 = tracer.startSpan("createOrder.createTask", span);

        /**
        * Add check for start event timing is less then 8Hrs
        */

        const sendDayOfShowEvent = (endTime) => {
          let startTime = Time.now();
          const totalSeconds = endTime - startTime;
          const days = Math.floor(totalSeconds / 86400);
          const hours = Math.floor((totalSeconds % 86400) / 3600);
          if (days <= 0 && hours < 8) {
            return false
          }
          return true
        }

        /**
         * Create multiple event task for day of show.
         */

        dayIds.map((item) => {
          if (sendDayOfShowEvent(item)) {
            const createTaskRequest = pb.CreateTaskRequest.create({
              spanContext: span.context().toString(),
              task: [
                {
                  orderId: order._id.toString(),
                  taskType: "TicketOnDayofEvent",
                  // executeAt: event?.schedule ? event.schedule.startsAt - 43200 : Time.now(),
                  executeAt: item ? item - 28800 : Time.now(),
                  // executeAt: EventUtil.qrCodeEmailAt(event),
                  userId,
                  orgId,
                  eventId,
                  venueIds,
                  artistIds,
                },
              ],
            });
            try {
              const res = this.proxy.taskService.createTask(createTaskRequest);
              this.logger.info(res);
            } catch (e) {
              this.logger.error(
                `createOrder - error 9 - orderId: ${order._id}: ${e.message}`
              );
              span2.setTag("error", true);
              span2.log({ errors: e.message });
              span2.finish();
            }
          }
        });
      }
    }
    /**
   * Broadcast order creation
   */
    const orderCreatedNotication = pb.Broadcast.OrderCreatedNotification.create(
      {
        spanContext: span.context().toString(),
        order: pb.Order.fromObject(order),
      }
    );

    try {
      await this.proxy.broadcast.orderCreated(orderCreatedNotication);
    } catch (e) {
      this.logger.error(`createOrder - error 9: ${e.message}`);
      span.setTag("error", true);
      span.log({ errors: e.message });
    }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
      event: "ORDER_CREATED",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
        eventName: event.name,
        orderType: order.type,
        orderTotal: paymentTotal,
        orderTotalFormatted: Price.output(paymentTotal),
        ticketCount: order.tickets.length,
        upgradeCount: order.upgrades.length,
      },
    });

    span.finish();
    return response;
  };

  public createSeasonOrder = async (
    request: pb.CreateSeasonOrderRequest
  ): Promise<pb.CreateSeasonOrderResponse> => {
    const span = tracer.startSpan("createSeasonOrder", request.spanContext);
    const response: pb.CreateSeasonOrderResponse =
      pb.CreateSeasonOrderResponse.create();
    /**
     * Validate the request
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().required(),
      params: Joi.object().keys({
        userId: Joi.string().optional().allow(''),
        orgId: Joi.string().required(),
        seasonId: Joi.string().required(),
        tickets: Joi.array().optional().default([]),
        upgrades: Joi.array().optional().default([]),
        type: Joi.string().default(OrderTypeEnum.Paid),
        channel: Joi.string().default(OrderChannelEnum.Online),
        promotionCode: Joi.string()
          .allow("", null)
          .empty(["", null])
          .default(null),
        customFields: Joi.array(),
        paymentMethodType: Joi.string().required(),
        paymentIntentId: Joi.string().optional().allow(""),
        holdToken: Joi.string().optional(),
        ipAddress: Joi.string(),
        // eventIds: Joi.array()
      }),
    });

    const validation = schema.validate(request);

    const {
      requestorId,
      params,
    }: {
      requestorId: string;
      params: ICreateSeasonOrderParams & { ipAddress: string };
    } = validation.value;

    if (validation.error) {
      this.logger.error(
        `createSeasonOrder - error: ${JSON.stringify(validation.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }

    let season: any;
    try {
      season = await this.validateCreateSeasonOrderParameters(span, params);
    } catch (e) {
      this.logger.error(`createSeasonOrder - error 1: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let {
      userId,
      orgId,
      seasonId,
      tickets,
      upgrades,
      type,
      channel,
      promotionCode,
      customFields,
      paymentMethodType,
      paymentIntentId,
      holdToken,
      ipAddress,
      // eventIds
    } = params;

    /**
     * Create venueIds and artistIds arrays
     * to save on the order object
     * from the retrieved event object
     */

    const venueIds = SeasonUtil.venueIds(season);
    const artistIds = SeasonUtil.artistIds(season);
    let dayIds = [];
    tickets.map((ticket) => {
      let scan = [];
      // dayIds = ticket.dayIds.filter(day => !dayIds.includes(day))
      if (!ticket.dayIds || ticket.dayIds.length == 0) {
        if (!dayIds.includes(season.schedule.startsAt)) {
          dayIds.push(season.schedule.startsAt);
        }
        scan.push({
          scanned: false,
          scannedAt: 0,
          scannedBy: "",
          startsAt: season.schedule.startsAt,
        });
      } else {
        ticket.dayIds.map((day) => {
          if (!dayIds.includes(day)) {
            dayIds.push(day);
          }
          scan.push({
            scanned: false,
            scannedAt: 0,
            scannedBy: "",
            startsAt: parseInt(day),
          });
        });
      }
      return (ticket.scan = scan);
    });


    /**
     * Initalize these values to [] for all orders
     * If the order is a comp, they will stay [].
     * If the order is not a comp, they will be populated below
     */
    let fees = [];
    let feeIds = [];

    /**
     * Only apply fees to order types that are paid
     */
    if (type === OrderTypeEnum.Paid) {
      const listFeesRequest = pb.ListEventFeesRequest.create({
        spanContext: span.context().toString(),
        orgId,
        seasonId,
      });

      let listFeesResponse: pb.ListEventFeesResponse;
      try {
        listFeesResponse = await this.proxy.feeService.listEventFees(
          listFeesRequest
        );
        if (listFeesResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            "Failed to fetch event fees. Please try again or contact support."
          );
        }
      } catch (e) {
        this.logger.error(`createSeasonOrder - error 3: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message:
              "Failed create order fees. Please try again or contact support.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      fees = listFeesResponse.fees;
      fees = fees.filter((fee: IFee) => {
        if (!fee?.paymentMethods || fee?.paymentMethods?.length == 0) {
          return true
        } else if (fee?.paymentMethods?.includes(paymentMethodType as any)) {
          return true
        } else {
          return false
        }
      })
      feeIds = fees.map((f) => f._id);
    }

    let address: IAddress = {};

    /**
     * Gecode the IP Address8DrMwKnFLJ
     */
    try {
      const res = await IPStack.gecodeIPAddress(ipAddress);
      const { city, region_code, zip, country_code, latitude, longitude } = res;

      address = {
        address1: null,
        address2: null,
        city: city,
        state: region_code,
        zip: zip,
        country: country_code,
        lat: latitude,
        lng: longitude,
      };
    } catch (e) {
      this.logger.error(e);
      span.setTag("error", true);
      span.log({ errors: e.message });
    }

    /**
     * Book seats in Seats.IO, if needed
     */
    if (season.seatingChartKey) {
      try {
        // A hold token is required to book seats
        if (!holdToken) {
          throw new Error(
            "Your order has timed out. Please refresh the page and start again."
          );
        }
        // All tickets must have a value for seat
        if (tickets.find((ticket) => !ticket.seat)) {
          throw new Error("Please select seats for all selected tickets.");
        }
        const bookSeatsRequest = pb.BookSeasonSeatsRequest.create({
          spanContext: span.context().toString(),
          orgId: orgId,
          seasonId: seasonId,
          // eventIds: eventIds,
          holdToken: holdToken,
          seats: tickets.map((ticket) => ticket.seat),
        });

        let bookSeatsResponse: pb.bookSeatsResponse;

        bookSeatsResponse = await this.proxy.seatingService.bookSeasonSeats(
          bookSeatsRequest
        );

        if (bookSeatsResponse.status !== pb.StatusCode.OK) {
          throw new Error(bookSeatsResponse.errors[0].message);
        }
      } catch (e) {
        console.error(e);
        this.logger.error(`createSeasonOrder - error 4: ${e.message}`);
        response.status = pb.StatusCode.BAD_REQUEST;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }


    /**
     * Create order attributes
     */
    const eventName = season.name;
    const now = Time.now();
    const attributes: IOrder = {
      userId,
      orgId,
      seasonId,
      eventName,
      venueIds,
      artistIds,
      feeIds,
      tickets: tickets as IOrderTicket[],
      upgrades: upgrades as IOrderUpgrade[],
      fees: fees as IFee[],
      type,
      tax: 0,
      channel,
      createdAt: now,
      createdBy: requestorId,
      promotionCode: promotionCode || null,
      ipAddress,
      address,
      customFields,
      payments: [],
      discountAmount: 0
    };

    /*
     * Inital these values to 0 for all orders
     * If the order is a comp, they will stay 0.
     * If the order is not a comp, they will be populated below
     */
    let paymentTotal = 0;
    let transferAmount = 0;
    let feeAmount = 0;

    let payment: IPayment = {
      _id: shortid.generate(),
      paymentIntentId,
      amount: paymentTotal,
      transferAmount,
      feeAmount,
      feeIds,
      tax: 0,
      createdAt: now,
      createdBy: requestorId,
      promotionCode: promotionCode || null,
      paymentMethodType,
      discount: 0
    };

    /**
     * Only capture payment intents for paid orders
     */
    const paymentCalucatorParams = {
      tickets,
      upgrades,
      fees,
      paymentMethodType,
    };
    if (payment) {
      const findOrgRequest = pb.FindOrganizationRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
      });

      let findOrgResponse: pb.FindOrganizationResponse;

      try {
        findOrgResponse = await this.proxy.organizationService.findOrganization(
          findOrgRequest
        );
      } catch (e) {
        this.logger.error(`orderEntities - error: ${e.message}`);
        throw new Error(`Failed to fetch order organization: ${e.message}`);
      }

      const { organization } = findOrgResponse;

      season.fees = fees;
      season.organization = organization;
      // let guestFees = PaymentUtil.calculateGuestFee(
      //   tickets as any,
      //   season as any
      // );

      // payment.amount = PaymentUtil.calculatePaymentTotal(
      //   paymentCalucatorParams
      // ) + guestFees;

      // payment.amount = PaymentUtil.calculatePaymentTotal(
      //   paymentCalucatorParams
      // );
      // payment.transferAmount =
      //   payment.amount -
      //   PaymentUtil.calculateProcessingFee(paymentCalucatorParams);

      // payment.feeAmount = PaymentUtil.calculatePlatformFee(
      //   paymentCalucatorParams
      // );

      // payment.tax = await PaymentUtil.calculateTaxFee(paymentCalucatorParams);
      payment.amount = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).total || 0);
      payment.transferAmount = Math.round((payment.amount - PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).totalFees) || 0);
      payment.feeAmount = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).selloutFee || 0);
      payment.tax = Math.round(PaymentUtil.calculatePaymentTotal(
        paymentCalucatorParams
      ).salesTax || 0);
    }

    let tax = fees.filter((fee) => {
      if (fee.name.toLowerCase() === "sales tax") {
        return fee.name;
      }
    });
    attributes.tax = tax.length > 0 ? tax[0].value : 0;
    let chargeId;
    if (
      (paymentMethodType !== PaymentMethodTypeEnum.Cash && paymentMethodType !== PaymentMethodTypeEnum.Check) &&
      paymentMethodType !== PaymentMethodTypeEnum.None
    ) {
      const captureStripePaymentIntentRequest =
        pb.CaptureStripePaymentIntentRequest.create({
          spanContext: span.context().toString(),
          orgId,
          paymentIntentId,
        });
      let captureStripePaymentIntentResponse: pb.CaptureStripePaymentIntentResponse;

      try {
        captureStripePaymentIntentResponse =
          await this.proxy.stripeService.captureStripePaymentIntent(
            captureStripePaymentIntentRequest
          );
        chargeId = captureStripePaymentIntentResponse.chargeId;
        if (captureStripePaymentIntentResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            "Unable to create payment intent. Please contact support."
          );
        }
      } catch (e) {
        this.logger.error(`createOrder - error 5: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    /**
     * Save the payment on the order
     */
    attributes.payments = [payment];
    attributes.stripeChargeId = chargeId;
    /**
     * Assign states
     */
    attributes.state = OrderStateEnum.Active;
    attributes.tickets = attributes.tickets.map((ticket) => {
      ticket.paymentId = payment._id;
      ticket.state = OrderItemStateEnum.Active;
      return ticket;
    });
    attributes.upgrades = attributes.upgrades.map((upgrade) => {
      upgrade.paymentId = payment._id;
      upgrade.state = OrderItemStateEnum.Active;
      return upgrade;
    });

    let subtotal = OrderUtil.orderSubtotal(attributes);
    // let promoterFees = OrderUtil.promoterFees(attributes, fees);
    let promoterFees = [];
    let selloutFees = [];
    let salesTaxFees = [];
    let stripeFees = [];

    fees.map(item => {
      item.amount = 0;
      if (item.appliedBy === FeeAppliedByEnum.Stripe) {
        stripeFees.push(item)
      } else if (item.appliedBy === FeeAppliedByEnum.Sellout) {
        selloutFees.push(item)
      } else {
        if (item.name === "Sales tax") {
          salesTaxFees.push(item)
        } else {
          promoterFees.push(item)
        }
      }
    })
    // Promoter Fee
    let promoCodeAdd = 0;
    promoterFees.map(promo => {
      promo.amount = OrderUtil.promoterFees(attributes, [promo])
      promoCodeAdd += (Math.round((promo.amount) * 100) / 100) || 0
    })

    // Order SubTotal With Promoter
    let orderSubTotalWithPromoter = subtotal + promoCodeAdd;

    // Sales Tax
    let salesTaxAmount = 0;
    salesTaxFees.map((item) => {
      let amount = (orderSubTotalWithPromoter * item.value) / 100;
      salesTaxAmount += (Math.round((amount) * 100) / 100);
      item.amount = salesTaxAmount;
    });
    // Promoter Total
    let promoterTotal = orderSubTotalWithPromoter + salesTaxAmount;


    // Sellout Fee
    function getFeeAmount(fee, amt) {
      if (fee.type === FeeTypeEnum.Percent) {
        let percent = amt * (fee.value / 100);
        return (Math.round((percent) * 100) / 100) || 0;
      }
      if (fee.type === FeeTypeEnum.Flat) {
        return fee.value;
      }
    }
    function applyTicketFee(
      ticket,
      fee
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
          let percent = (ticket.price * fee.value) / 100;
          return (Math.round((percent) * 100) / 100) || 0;
        }
      } else {
        return 0;
      }

      return 0;
    }

    let selloutOrderFee = 0;
    for (let index = 0; index < selloutFees.length; index++) {
      const sellout = selloutFees[index];
      if (sellout.appliedTo === FeeAppliedToEnum.Order) {
        sellout.amount = Math.round(getFeeAmount(sellout, promoterTotal));
        selloutOrderFee += Math.round(sellout.amount) || 0;
      }
    }
    let selloutFeesAmt = 0;
    for (let index = 0; index < selloutFees.length; index++) {
      let selloutFee = selloutFees[index];
      if (selloutFee.appliedTo === FeeAppliedToEnum.Ticket) {
        let selloutFeeArr = [selloutFee];
        const selloutFeeFlatPerTicketAmt = attributes.tickets.reduce((cur: number, ticket: any) => {

          return (
            cur +
            selloutFeeArr.reduce((cur: number, fee: IFee) => {
              if (fee.filters.includes(FeeFiltersEnum.GuestTicket) && !ticket.guestTicket) {
                return cur
              }
              if (fee.type == FeeTypeEnum.Flat) {
                const value = cur + applyTicketFee(ticket, fee);
                return value;
              }
              return cur
            }, 0)
          );
        }, 0);
        selloutFee.amount = Math.round(selloutFeeFlatPerTicketAmt);
        selloutFeesAmt += Math.round(selloutFee.amount) || 0;
      }
    }

    function applyUpgradeFee(
      upgrade,
      fee,
    ): number {
      const minFee = fee.minAppliedToPrice || 0;
      const maxFee = fee.maxAppliedToPrice || Infinity;

      if (minFee <= upgrade.price && upgrade.price <= maxFee) {
        if (fee.type === FeeTypeEnum.Flat) {
          return fee.value;
        }
        if (fee.type === FeeTypeEnum.Percent) {
          let percent = (upgrade.price * fee.value) / 100;
          return (Math.round((percent) * 100) / 100) || 0;
        }
      } else {
        return 0;
      }

      return 0;
    }
    for (let index = 0; index < selloutFees.length; index++) {
      let selloutUpgradeFee = selloutFees[index];
      if (selloutUpgradeFee.appliedTo === FeeAppliedToEnum.Upgrade) {
        let selloutUpgardeFeeArr = [selloutUpgradeFee];
        const selloutFeeFlatPerUpgardeAmt = attributes.upgrades.reduce((cur: number, upgrade: any) => {
          return (
            cur +
            selloutUpgardeFeeArr.reduce((cur, fee) => {
              const value = cur + applyUpgradeFee(upgrade, fee);
              return value;
            }, 0)
          );
        }, 0);
        selloutUpgradeFee.amount = Math.round(selloutFeeFlatPerUpgardeAmt);
        selloutFeesAmt += Math.round(selloutUpgradeFee.amount) || 0;
      }
    }
    for (let index = 0; index < promoterFees.length; index++) {
      let promoterUpgradeFee = promoterFees[index];
      if (promoterUpgradeFee.appliedTo === FeeAppliedToEnum.Upgrade) {
        let promoterUpgardeFeeArr = [promoterUpgradeFee];
        const promoterFeeFlatPerUpgardeAmt = attributes.upgrades.reduce((cur: number, upgrade: any) => {
          return (
            cur +
            promoterUpgardeFeeArr.reduce((cur, fee) => {
              const value = cur + applyUpgradeFee(upgrade, fee);
              return value;
            }, 0)
          );
        }, 0);
        promoterUpgradeFee.amount = Math.round(promoterFeeFlatPerUpgardeAmt);
        promoCodeAdd += Math.round(promoterUpgradeFee.amount) || 0;
      }
    }
    let selloutFee = Math.round(selloutOrderFee + selloutFeesAmt);

    // Pre Stripe Total
    let preStripeTotal = promoterTotal + selloutFee;

    //Stripe Total Fee
    let stripeTotalFee = 0;
    let stripeFeeFlat = stripeFees.find(fee => fee.type == FeeTypeEnum.Flat)?.value || 0
    let stripeFeePercentage = stripeFees.find(fee => fee.type == FeeTypeEnum.Percent)?.value || 0
    stripeTotalFee = (preStripeTotal + (stripeFeeFlat)) / (1 - (stripeFeePercentage / 100)) - preStripeTotal

    if (attributes.payments[0].paymentMethodType === PaymentMethodTypeEnum.Cash || attributes.payments[0].paymentMethodType === PaymentMethodTypeEnum.Check) {
      for (let item of stripeFees) {
        item.amount = 0;
      }
    } else {
      stripeFees.map((item) => {
        if (item.type == FeeTypeEnum.Flat) {
          item.amount = item.value || 0;
        } else {
          item.amount = parseFloat((Math.round((stripeTotalFee - stripeFeeFlat) * 100) / 100).toFixed()) || 0;

        }
      });
    }

    attributes.fees = fees;

    /**
     * Save the new order to storage
     * 
     */
    let order: IOrder;
    try {
      order = await this.storage.createOrder(span, attributes);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`createSeasonOrder - error 6: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message:
            "Season Order creation was unsuccessful. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e });
      span.finish();
      return response;
    }

    const listEventRequest = new pb.ListEventFeesRequest.create({
      spanContext: span.context().toString(),
      orgId: order.orgId,
      seasonId: order.seasonId,
    });

    let ListEventsResponse: pb.ListEventsResponse;
    try {
      ListEventsResponse = await this.proxy.eventService.listEventBySeasonId(
        listEventRequest
      );
    } catch (e) {
      // errorSpan(span, e);
      throw e;
    }
    let events = ListEventsResponse.events;

    for (let event of events) {
      params.eventId = event._id;
      params.paymentIntentId = "";
      params.type = OrderTypeEnum.Complimentary;
      params.hidden = true;
      params.parentSeasonOrderId = order._id;

      let eventTickets = [];
      if (event.ticketTypes && params.tickets) {
        params.tickets.map((item) => {
          const found = event.ticketTypes.find((x) => x.name === item.name);
          if (found) {
            let ticketObj = {
              dayIds: [],
              description: found.description,
              name: found.name,
              // price: 1000,
              rollFees: false,
              seat: item.seat,
              ticketTypeId: found._id,
              ticketTierId: found?.tiers[0]._id,
              price: 0,
              teiMemberId: item.teiMemberId,
              teiMemberInfo: item.teiMemberInfo,
              guestTicket: item.guestTicket

            };
            eventTickets.push(ticketObj);
          }
          return item;
        });
      }

      params.tickets = eventTickets;
      params.promotionCode = "";
      const request = pb.CreateOrderRequest.create({
        spanContext: span.context().toString(),
        requestorId: userId,
        params
      });

      try {
        await this.proxy.orderService.createOrder(request);
      } catch (e) {
        this.logger.error(`createSeasonOrder - error 9: ${e.message}`);
      }
    }

    /**
     * Send the order receipt
     */
    //       if (SeasonUtil.shouldSendOrderReceipt(season)) {

    const sendQRCode = async () => {
      const span1 = tracer.startSpan("createSeasonOrder.sendQRCode", span);
      const sendOrderQRCodeEmailRequest = pb.SendOrderQRCodeEmailRequest.create(
        {
          spanContext: span.context().toString(),
          orderId: order._id.toString(),
        }
      );
      try {
        const res = await this.proxy.orderService.sendSeasonOrderReceiptEmail(
          sendOrderQRCodeEmailRequest
        );
        this.logger.info(res);
      } catch (e) {
        this.logger.error(
          `createOrder - error 8 - orderId: ${order._id}: ${e.message}`
        );
        span1.setTag("error", true);
        span1.log({ errors: e.message });
        span1.finish();
      }
    };
    sendQRCode(); // send qr code function
    // }

    /**
     * Broadcast order creation
     */
    const orderCreatedNotication = pb.Broadcast.OrderCreatedNotification.create(
      {
        spanContext: span.context().toString(),
        order: pb.Order.fromObject(order),
      }
    );

    try {
      await this.proxy.broadcast.orderSeasonCreated(orderCreatedNotication);
    } catch (e) {
      this.logger.error(`createSeasonOrder - error 9: ${e.message}`);
      span.setTag("error", true);
      span.log({ errors: e.message });
    }

    // Track
    this.segment.track({
      userId: order.userId,
      event: "ORDER_CREATED",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
        eventName: season.name,
        orderType: order.type,
        orderTotal: paymentTotal,
        orderTotalFormatted: Price.output(paymentTotal),
        ticketCount: order.tickets.length,
        upgradeCount: order.upgrades.length,
      },
    });

    span.finish();
    return response;
  };

  public createOrderPaymentIntent = async (
    request: pb.CreateOrderPaymentIntentRequest
  ): Promise<pb.CreateOrderPaymentIntentResponse> => {
    const span = tracer.startSpan(
      "createOrderPaymentIntent",
      request.spanContext
    );
    const response: pb.CreateOrderPaymentIntentResponse =
      pb.CreateOrderPaymentIntentResponse.create();

    /**
     * Validate the request
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().required(),
      params: Joi.object().keys({
        userId: Joi.string().optional().allow(''),
        orgId: Joi.string().required(),
        eventId: Joi.string().required(),
        tickets: Joi.array().optional().default([]),
        channel: Joi.string().default(OrderChannelEnum.Online),
        upgrades: Joi.array().optional().default([]),
        promotionCode: Joi.string()
          .allow("", null)
          .empty(["", null])
          .default(null),
        discountCode: Joi.string()
          .allow("", null)
          .empty(["", null])
          .default(null),
        paymentMethodType: Joi.string().required(),
        paymentMethodId: Joi.string().optional().allow(""),
        stalePaymentIntentId: Joi.string().optional().allow(""),
        discount: Joi.number().optional().allow("")

      }),
    });

    const validation = schema.validate(request);

    const { params, requestorId } = validation.value;

    if (validation.error) {
      this.logger.error(
        `createOrderPaymentIntent - error: ${JSON.stringify(validation.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }

    let event: IEvent;
    try {
      event = await this.validateCreateOrderParameters(span, params);
    } catch (e) {
      this.logger.error(`createOrderPaymentIntent - error 1: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const {
      // userId,
      orgId,
      eventId,
      tickets,
      upgrades,
      paymentMethodType,
      paymentMethodId,
      stalePaymentIntentId,
      discountCode
    } = params;




    /**
     * Retrieve fees
     */
    let fees = [];
    const listFeesRequest = pb.ListEventFeesRequest.create({
      spanContext: span.context().toString(),
      orgId,
      eventId,
    });

    let listFeesResponse: pb.ListEventFeesResponse;
    try {
      listFeesResponse = await this.proxy.feeService.listEventFees(
        listFeesRequest
      );
      if (listFeesResponse.status !== pb.StatusCode.OK) {
        throw new Error(
          "Failed to fetch event fees. Please try again or contact support."
        );
      }
    } catch (e) {
      this.logger.error(`createOrderPaymentIntent - error 3: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message:
            "Failed create order fees. Please try again or contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    fees = listFeesResponse.fees;
    const promotionsCode = event?.promotions.filter((promo) => promo?.code?.toLowerCase() === discountCode?.toLowerCase());

    const paymentCalucatorParams = {
      tickets,
      upgrades,
      fees,
      paymentMethodType,
      promotions: promotionsCode
    };

    let payment = Math.round(PaymentUtil.calculatePaymentTotal(
      paymentCalucatorParams
    ).total || 0);
    const paymentAmount = Number(Math.round(payment).toFixed(2));


    // let discount = Math.round(PaymentUtil.calculatePaymentTotal(
    //   paymentCalucatorParams
    // ).discountAmount || 0);


    // const transferAmount =
    //   paymentAmount -
    //   PaymentUtil.calculateProcessingFee(paymentCalucatorParams);
    // const feeAmount = PaymentUtil.calculatePlatformFee(paymentCalucatorParams);

    let transferAmount = Math.round((paymentAmount - PaymentUtil.calculatePaymentTotal(
      paymentCalucatorParams
    ).totalFees) || 0);
    transferAmount = Number(Math.round(transferAmount).toFixed(2));
    const feeAmount = Math.round(PaymentUtil.calculatePaymentTotal(
      paymentCalucatorParams
    ).selloutFees || 0);

    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId: orgId,
    });

    let findOrgResponse: pb.FindOrganizationResponse;

    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(
        findOrgRequest
      );
    } catch (e) {
      this.logger.error(`orderEntities - error: ${e.message}`);
      throw new Error(`Failed to fetch order organization: ${e.message}`);
    }

    const { organization } = findOrgResponse;

    event.fees = fees;
    event.organization = organization;
    // let guestFees = PaymentUtil.calculateGuestFee(
    //   tickets as any,
    //   event as any
    // );


    /**
     * Create Stripe Payment Intent
     */
    const createStripePaymentIntentRequest = pb.CreateStripePaymentIntentRequest.create({
      spanContext: span.context().toString(),
      orgId,
      userId: params.userId ? params.userId : requestorId,
      amount: paymentAmount,
      // amount: paymentAmount + guestFees,
      transferAmount,
      feeAmount,
      description: `${event.name.toUpperCase()}`,
      currency: "usd",
      paymentMethodId,
    });

    let createStripePaymentIntentResponse: pb.CreateStripePaymentIntentResponse;

    try {
      createStripePaymentIntentResponse =
        await this.proxy.stripeService.createStripePaymentIntent(
          createStripePaymentIntentRequest
        );

      if (createStripePaymentIntentResponse.status !== pb.StatusCode.OK) {
        throw new Error(
          "Unable to create payment intent. Please contact support."
        );
      }
    } catch (e) {
      this.logger.error(`createOrderPaymentIntent - error 5: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Cancel Stale Payment Intent
     */
    if (stalePaymentIntentId) {
      async function cancelStalePaymentIntent() {
        const cancelStripePaymentIntentRequest =
          pb.CancelStripePaymentIntentRequest.create({
            spanContext: span.context().toString(),
            paymentIntentId: stalePaymentIntentId,
          });

        let cancelStripePaymentIntentResponse: pb.CancelStripePaymentIntentResponse;

        try {
          cancelStripePaymentIntentResponse =
            await this.proxy.stripeService.createStripePaymentIntent(
              cancelStripePaymentIntentRequest
            );

          if (cancelStripePaymentIntentResponse.status !== pb.StatusCode.OK) {
            throw new Error(
              "Unable to cancel stale payment intent. Please contact support."
            );
          }
        } catch (e) {
          this.logger.error(`createOrderPaymentIntent - error 6: ${e.message}`);
          span.setTag("error", true);
          span.log({ errors: e.message });
        }
      }
      cancelStalePaymentIntent();
    }

    /**
     * Return the paymentIntent
     */
    const { paymentIntentId, clientSecret, ephemeralKey } = createStripePaymentIntentResponse;
    response.paymentIntentId = paymentIntentId;
    response.clientSecret = clientSecret;
    response.ephemeralKey = ephemeralKey;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public createSeasonOrderPaymentIntent = async (
    request: pb.CreateSeasonOrderPaymentIntentRequest
  ): Promise<pb.CreateOrderPaymentIntent> => {
    const span = tracer.startSpan(
      "createSeasonOrderPaymentIntent",
      request.spanContext
    );
    const response: pb.CreateOrderPaymentIntentResponse =
      pb.CreateOrderPaymentIntentResponse.create();
    /**
     * Validate the request
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().required(),
      params: Joi.object().keys({
        userId: Joi.string().optional().allow(''),
        orgId: Joi.string().required(),
        seasonId: Joi.string().required(),
        tickets: Joi.array().optional(),
        channel: Joi.string().default(OrderChannelEnum.Online),
        upgrades: Joi.array().optional().default([]),
        promotionCode: Joi.string()
          .allow("", null)
          .empty(["", null])
          .default(null),
        paymentMethodType: Joi.string().required(),
        paymentMethodId: Joi.string().optional().allow(""),
        stalePaymentIntentId: Joi.string().optional().allow(""),
      }),
    });

    const validation = schema.validate(request);

    const { params, requestorId } = validation.value;

    if (validation.error) {
      this.logger.error(
        `createSeasonOrderPaymentIntent - error: ${JSON.stringify(
          validation.error
        )}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }

    let season: ISeason;
    try {
      season = await this.validateCreateSeasonOrderParameters(span, params);
    } catch (e) {
      this.logger.error(
        `createSeasonOrderPaymentIntent - error 1: ${e.message}`
      );
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const {
      // userId,
      orgId,
      // eventId,
      seasonId,
      tickets,
      upgrades,
      paymentMethodType,
      paymentMethodId,
      stalePaymentIntentId,
    } = params;

    /**
     * Retrieve fees
     */
    let fees = [];
    const listFeesRequest = pb.ListEventFeesRequest.create({
      spanContext: span.context().toString(),
      orgId,
      seasonId,
    });

    let listFeesResponse: pb.ListEventFeesResponse;
    try {
      listFeesResponse = await this.proxy.feeService.listEventFees(
        listFeesRequest
      );
      if (listFeesResponse.status !== pb.StatusCode.OK) {
        throw new Error(
          "Failed to fetch event fees. Please try again or contact support."
        );
      }
    } catch (e) {
      this.logger.error(`createOrderPaymentIntent - error 3: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message:
            "Failed create order fees. Please try again or contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    fees = listFeesResponse.fees;

    const paymentCalucatorParams = {
      tickets,
      upgrades,
      fees,
      paymentMethodType
    };
    let payment = Math.round(PaymentUtil.calculatePaymentTotal(
      paymentCalucatorParams
    ).total || 0);

    const paymentAmount = Number(Math.round(payment).toFixed(2));

    // const transferAmount =
    //   paymentAmount -
    //   PaymentUtil.calculateProcessingFee(paymentCalucatorParams);
    // const feeAmount = PaymentUtil.calculatePlatformFee(paymentCalucatorParams);

    const transferAmount = Math.round((paymentAmount - PaymentUtil.calculatePaymentTotal(
      paymentCalucatorParams
    ).totalFees) || 0);
    const feeAmount = Math.round(PaymentUtil.calculatePaymentTotal(
      paymentCalucatorParams
    ).selloutFees || 0);

    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId: orgId,
    });

    let findOrgResponse: pb.FindOrganizationResponse;

    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(
        findOrgRequest
      );
    } catch (e) {
      this.logger.error(`orderEntities - error: ${e.message}`);
      throw new Error(`Failed to fetch order organization: ${e.message}`);
    }

    const { organization } = findOrgResponse;

    season.fees = fees;
    season.organization = organization;

    /**
     * Create Stripe Payment Intent
     */
    const createStripePaymentIntentRequest =
      pb.CreateStripePaymentIntentRequest.create({
        spanContext: span.context().toString(),
        orgId,
        userId: requestorId,
        amount: paymentAmount,
        transferAmount,
        feeAmount,
        description: `${season.name.toUpperCase()}`,
        currency: "usd",
        paymentMethodId,
      });

    let createStripePaymentIntentResponse: pb.CreateStripePaymentIntentResponse;

    try {
      createStripePaymentIntentResponse =
        await this.proxy.stripeService.createStripePaymentIntent(
          createStripePaymentIntentRequest
        );

      if (createStripePaymentIntentResponse.status !== pb.StatusCode.OK) {
        throw new Error(
          "Unable to create payment intent. Please contact support."
        );
      }
    } catch (e) {
      this.logger.error(`createOrderPaymentIntent - error 5: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Cancel Stale Payment Intent
     */
    if (stalePaymentIntentId) {
      async function cancelStalePaymentIntent() {
        const cancelStripePaymentIntentRequest =
          pb.CancelStripePaymentIntentRequest.create({
            spanContext: span.context().toString(),
            paymentIntentId: stalePaymentIntentId,
          });

        let cancelStripePaymentIntentResponse: pb.CancelStripePaymentIntentResponse;

        try {
          cancelStripePaymentIntentResponse =
            await this.proxy.stripeService.createStripePaymentIntent(
              cancelStripePaymentIntentRequest
            );

          if (cancelStripePaymentIntentResponse.status !== pb.StatusCode.OK) {
            throw new Error(
              "Unable to cancel stale payment intent. Please contact support."
            );
          }
        } catch (e) {
          this.logger.error(`createOrderPaymentIntent - error 6: ${e.message}`);
          span.setTag("error", true);
          span.log({ errors: e.message });
        }
      }
      cancelStalePaymentIntent();
    }

    /**
     * Return the paymentIntent
     */
    const { paymentIntentId, clientSecret, ephemeralKey
    } = createStripePaymentIntentResponse;
    response.paymentIntentId = paymentIntentId;
    response.clientSecret = clientSecret;
    response.ephemeralKey = ephemeralKey;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public scanOrder = async (
    request: pb.ScanOrderRequest
  ): Promise<pb.ScanOrderResponse> => {
    const span = tracer.startSpan("scanOrder", request.spanContext);
    const response: pb.ScanOrderResponse = pb.ScanOrderResponse.create();
    /**
     * Validate the scan parameters
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
      ticketIds: Joi.array().default([]).optional(),
      upgradeIds: Joi.array().default([]).optional(),
      scannedBy: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`scanOrder - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId, ticketIds, upgradeIds, scannedBy } = params.value;

    let orderEntities: IOrderEntities;

    try {
      orderEntities = await this.orderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`sendOrderReceiptEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const {
      venues: [venue],
    } = orderEntities;
    const timezone =
      venue && venue.address && venue.address.timezone
        ? venue.address.timezone
        : "America/Denver";

    /**
     * Retrieve the order from storage
     */

    let order: IOrder;
    try {
      order = await this.storage.findById(span, orderId);
      if (!order || !order._id) {
        throw new Error("This order does not exist.");
      }
    } catch (e) {
      this.logger.error(`scanOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Scan the order tickets
     * Throw an error if any ticket has
     * already been scanned
     */
    try {
      // const timezone = order && order.address && order.address.timezone ? order.address.timezone : 'America/Denver';

      order.tickets = order.tickets.map((ticket): IOrderTicket => {
        if (ticketIds.includes(ticket._id.toString())) {
          if (!OrderUtil.ticketIsScannable(ticket)) {
            throw new Error(
              "This ticket has been already been scanned, refunded, transferred, or sold."
            );
          }

          if (ticket.scan[0] && !ticket.scan[0].startsAt) {
            ticket.scan[0].scanned = true;
            ticket.scan[0].scannedAt = Time.now();
            ticket.scan[0].scannedBy = scannedBy;
          } else {
            ticket.scan.map((element) => {
              let timeNow = Time.format(Time.now(), "ddd, MMM Do", timezone);
              let startsAt = Time.format(
                element.startsAt,
                "ddd, MMM Do",
                timezone
              );
              if (timeNow == startsAt) {
                element.scanned = true;
                element.scannedAt = Time.now();
                element.scannedBy = scannedBy;
                element.startsAt;
              }
            });
          }
          return ticket;
        } else {
          return ticket;
        }
      });
    } catch (e) {
      this.logger.error(`scanOrder - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Scan the order upgrades
     * Throw an error if any ticket has
     * already been scanned
     */
    try {
      order.upgrades = order.upgrades.map((upgrade): IOrderUpgrade => {
        if (upgradeIds.includes(upgrade._id.toString())) {
          if (!OrderUtil.upgradeIsScannable(upgrade)) {
            throw new Error(
              "This upgrade has been already been scanned, refunded, transferred, or sold."
            );
          }

          upgrade.scan.scanned = true;
          upgrade.scan.scannedAt = Time.now();
          upgrade.scan.scannedBy = scannedBy;
          return upgrade;
        } else {
          return upgrade;
        }
      });
    } catch (e) {
      this.logger.error(`scanOrder - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Save the order to storage
     */
    try {
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`scanOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: scannedBy },
      event: "ORDER_SCANNED",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
        orderType: order.type,
        ticketCount: ticketIds.length,
        upgradeCount: upgradeIds.length,
      },
    });

    span.finish();
    return response;
  };

  public sendOrderReceiptEmail = async (
    request: pb.SendOrderReceiptEmailRequest
  ): Promise<pb.SendOrderReceiptEmailResponse> => {
    const span = tracer.startSpan("sendOrderReceiptEmail", request.spanContext);
    let response: pb.SendOrderReceiptEmailResponse =
      pb.SendOrderReceiptEmailResponse.create();

    /**
     * Validate Request Paramaters
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
      requestorId: Joi.string().optional()
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `sendOrderReceiptEmail - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId, requestorId } = params.value;

    let orderEntities: IOrderEntities;

    try {
      orderEntities = await this.orderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`sendOrderReceiptEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let {
      order,
      organization,
      user,
      event,
      venues: [venue],
      fees,
    } = orderEntities;

    /**
     * Send the order receipt
     */

    let qrCodeUrl;
    try {
      qrCodeUrl = await this.generateQRCodeAndUpload(
        span.context().toString(),
        order
      );
    } catch (e) {
      this.logger.error("FAILED TO GENERATE QR CODE");
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to generate order QR code. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    order.qrCodeUrl = qrCodeUrl;
    try {
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to save order QR Code. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { address } = organization;
    const address1 = `${address.address1} ${address.address2}`;
    const address2 = `${address.city}, ${address.state} ${address.zip}`;

    const performanceSchedules = event?.performances.reduce(
      (cur, next) => {
        if (next.schedule.length == 1) {
          cur.doorsAt.push(next.schedule[0].doorsAt);
          cur.startsAt.push(next.schedule[0].startsAt);
          cur.endsAt.push(next.schedule[0].endsAt);
        } else {
          next.schedule.map((sdl) => {
            cur.doorsAt.push(sdl.doorsAt);
            cur.startsAt.push(sdl.startsAt);
            cur.endsAt.push(sdl.endsAt);
          });
        }
        return cur;
      },
      {
        doorsAt: [],
        startsAt: [],
        endsAt: [],
      }
    );

    const venuePosterImageUrl = venue.imageUrls[0];
    const venueAddress1 = `${venue.address.address1} ${venue.address.address2}`;
    const venueAddress2 = `${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
    const timezone =
      venue && venue.address && venue.address.timezone
        ? venue.address.timezone
        : "America/Denver";
    const doorsAt = Math.min(...performanceSchedules?.doorsAt);
    const startsAt = Math.min(...performanceSchedules?.startsAt);
    const qrCodeAt = EventUtil.qrCodeEmailAt(event);
    const cityState = `${venue.address.city}, ${venue.address.state}`;
    const orderSummary = await this.orderSummaryRefunded(
      span,
      order,
      fees,
      false
    );
    // const { tickets, upgrades } = orderSummary;
    const { tickets, upgrades } = orderSummary;
    let ticketValue = 0;
    // let feewithoutTax = fees.filter(fee => fee.name != 'Sales tax')
    // const totalParams = {
    //   tickets: order.tickets,
    //   upgrades: order.upgrades,
    //   fees: fees,
    //   paymentMethodType: order?.payments && order?.payments[0]?.paymentMethodType ? order?.payments[0]?.paymentMethodType : ""
    // };


    // const nonRefundedTicket = order.tickets.filter(
    //   (ticket) => ticket.refund.refunded == false
    // );
    const refundedTicket = order.tickets.filter(
      (ticket) => ticket?.refund?.refunded == true
    );
    if (order.tickets.length != 0) {
      if (refundedTicket.length == order.tickets.length) {
        const sendRefundEmail = async () => {
          const span1 = tracer.startSpan("refundOrder.sendRefundEmail", span);
          const sendOrderRefundEmailRequest =
            pb.SendOrderRefundEmailRequest.create({
              spanContext: span.context().toString(),
              orderId: order._id.toString(),
            });
          try {
            response = await this.proxy.orderService.sendOrderRefundEmail(
              sendOrderRefundEmailRequest
            );
            response.status = pb.StatusCode.OK;
            this.logger.info(response);
          } catch (e) {
            this.logger.error(
              `refundOrder - orderId: ${order._id}: ${e.message}`
            );
            span1.setTag("error", true);
            span1.log({ errors: e.message });
            span1.finish();
          }
        };
        await sendRefundEmail();
      }
    }


    // let taxFees = await PaymentUtil.calculateFee(totalParams);
    // let sub = 0;

    // let feewithoutTax = fees.filter(fee => fee.name != 'Sales tax')
    // const totalParams = {
    //    tickets: order.tickets,
    //    upgrades: order.upgrades,
    //    fees: fees,
    //    paymentMethodType: order.payments[0].paymentMethodType
    // };
    // let taxFees = await PaymentUtil.calculateFee(totalParams);

    let dayIds = [];
    let dayIdsTime = [];
    let dayIdsTimeCalendar = [];
    const perfomancesArray = performanceSchedules.startsAt.map(
      (date, index) => {
        return {
          startsAt: date,
          endsAt: performanceSchedules.endsAt[index],
          doorsAt: performanceSchedules.doorsAt[index],
        };
      }
    );
    dayIdsTime = perfomancesArray.filter(
      (start, index) => !dayIds.includes(start.startsAt)
    );
    if (tickets.length === 0) {
      dayIdsTimeCalendar.push({
        startsAt: performanceSchedules.startsAt[0],
        endsAt: performanceSchedules.endsAt[0],
        doorsAt: performanceSchedules.doorsAt[0],
      });
    }
    const ticketItems = tickets.map((item) => {
      let orderItem: any = {
        name: `${item.count} x ${item.name}`,
        price:
          order.type === OrderTypeEnum.RSVP
            ? `$${Price.output(item.values, true, true)}`
            : `$${Price.output(item.price, true, true)}`,
        description: item.description,
        type: order.type === OrderTypeEnum.RSVP ? "reservation" : "order",
        teiMemberId: item.teiMemberId ? item.teiMemberId : "",
        guestTicket: item.guestTicket ? item.guestTicket : ""
      };
      const timeZone = address?.timezone ? address?.timezone : "America/Denver";
      const days = item.dayIds
        .map((day) =>
          Time.format(day, "MMM Do", timeZone).replace("Section", "")
        )
        .filter(Boolean)
        .join(", ");

      if (
        event.performances[0].schedule &&
        event.performances[0].schedule.length > 0
      ) {
        if (days) orderItem.days = days;
      }

      dayIds = item.dayIds.filter((day) => !dayIds.includes(day));

      dayIdsTimeCalendar = perfomancesArray.filter((start, index) => item.dayIds.includes(start.startsAt.toString()));

      if (dayIds.length == 0) {
        dayIdsTimeCalendar.push({
          startsAt: performanceSchedules.startsAt[0],
          endsAt: performanceSchedules.endsAt[0],
          doorsAt: performanceSchedules.doorsAt[0],
        });
      }

      // let   dayIdsTime1 = perfomancesArray.filter((start, index) => !dayIds.includes(start.startsAt));
      const seats = item.seats
        .map((seat) => seat.replace("Section", ""))
        .filter(Boolean)
        .join(", ");
      if (seats) orderItem.seats = seats;
      ticketValue = ticketValue + parseInt(item.values);
      // sub += item.price;
      return orderItem;
    });

    const upgradeItems = upgrades.map((item) => {
      // sub += item.price;
      return {
        name: `${item.count} x ${item.name}`,
        price: `$${Price.output(item.price, true, true)}`,
      };
    });

    let orderItems = [...ticketItems, ...upgradeItems];
    // const orderTotal = `$${Price.output(orderSummary.total as number)}`;
    // let tax = parseFloat(
    //   (
    //     (Price.output(sub as number) * (order?.tax ? order.tax : 0)) /
    //     100
    //   ).toFixed(2)
    // );
    // const taxOld = parseFloat((Price.output(orderSummary.subtotal as number) * (order?.tax ? order.tax : 0) / 100).toFixed(2));


    // let tax = Price.output(orderSummary.salesTaxFee as number);
    // let taxFees1 = (orderSummary.selloutFee + orderSummary.stripeFee + orderSummary.promoterFee) - orderSummary.salesTaxFee;

    let taxFees1;
    let tax = Price.output(orderSummary.salesTaxFee as number, true, true) || 0;
    if (order.payments[0].paymentMethodType !== PaymentMethodTypeEnum.Cash || order.payments[0].paymentMethodType !== PaymentMethodTypeEnum.Check) {
      taxFees1 = (orderSummary.selloutFee + orderSummary.stripeFee + orderSummary.promoterFee) + orderSummary.salesTaxFee;
    } else {
      taxFees1 = (orderSummary.selloutFee + orderSummary.promoterFee) + orderSummary.salesTaxFee;
    }
    let taxFees2 = parseFloat((Math.round((taxFees1) * 100) / 100).toFixed(2)) || 0
    let totalTaxFees = Price.output(taxFees2 as number);
    let orderTax = `$${tax}`;
    // const feestotal = (Price.output((orderSummary.total as number) - (orderSummary.subtotal as number)) - taxOld11);
    event.fees = fees;
    event.organization = organization;
    // let guestFees = PaymentUtil.calculateGuestFee(
    //   nonRefundedTicket as any,
    //   event as any
    // );
    // let guestFeesAmount = Price.output(guestFees as number);
    let feesTotal = totalTaxFees;
    // let orderFees = `$${(feestotal + guestFeesAmount).toFixed(2)}`;
    let orderFees = `$${parseFloat(feesTotal).toFixed(2)}`;
    let promoterFee = `$${Price.output(orderSummary.promoterFee as number, true, true)}`;
    let processingFee = `$${Price.output(
      (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number), true, true
    )}`;

    // let orderSubtotal = `$${Price.output(sub as number, true, true)}`;
    let orderSubtotal = `$${Price.output(
      (orderSummary.subtotal as number) + (orderSummary.promoterFee as number), true, true
    )}`;

    let orderTotal = `$${Price.output((orderSummary.total as number), true, true)}`;;


    let discount = `$${Price.output((order?.discountAmount as number), true, true)}`;;

    // console.log(discount)

    // `$${((sub as number) / 100) + Number(totalTaxFees)}`;



    // let orderTotal = `$${(((Price.output(sub as number) + tax) as number) + ((feestotal + guestFeesAmount) as number)).toFixed(2)
    //   }`;

    // let orderTotal = `$${Price.output(((Price.output(sub as number) + tax) as number) + ((feestotal) as number),true)}`;
    // let orderTotal = `$${(((Price.output(sub as number) + Number(tax))) + Number(feestotal))}`;
    if (order.type === OrderTypeEnum.RSVP) {
      // orderTotal = `$${Price.output(0 as number).toFixed(2)}}`;
      orderTotal = `$${Price.output(ticketValue as number, true, true)}`;
      // tax = parseFloat(
      //   (
      //     (Price.output(ticketValue as number) * (order?.tax ? order.tax : 0)) /
      //     100
      //   ).toFixed(2)
      // );
      // orderTax = `$${tax.toFixed(2)}`;
      // orderFees = `$${(
      //   Price.output((ticketValue as number) - (ticketValue as number)) - tax
      // ).toFixed(2)}`;
      orderSubtotal = `$${Price.output(ticketValue as number, true, true)}`;
    }


    // orderSummary.total = Number(orderSummary.total) + Number(guestFees);
    // =======
    //       const orderTotal = `$${Price.output(orderSummary.total as number)}`;
    //       const tax = parseFloat((Price.output(orderSummary.subtotal as number) * (order?.tax ? order.tax : 0) / 100).toFixed(2));
    //       const orderTax = `$${tax.toFixed(2)}`;
    //       const orderFees = `$${(Price.output((orderSummary.total as number) - (orderSummary.subtotal as number)) - tax).toFixed(2)}`;
    //       const orderSubtotal = `$${Price.output(orderSummary.subtotal as number)}`;
    // >>>>>>> staging
    const sendOrderReceiptRequest = pb.QueueOrderReceiptEmailRequest.create({
      spanContext: span.context().toString(),
      toAddress: user.email || order.email,
      firstName: user.firstName || "Guest",
      eventName: event.name,
      orgName: organization.orgName,
      eventSubtitle: event.subtitle,
      venueName: venue.name,
      eventDate: Time.format(
        event.schedule.startsAt,
        "ddd, MMM Do",
        timezone
      ),
      eventStart: event.schedule.startsAt,
      eventEnd: event.schedule.endsAt,
      doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
      showAt: Time.formatTimeOfDay(startsAt, timezone),
      qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
      confirmationCode: order._id.toString(),
      orgEmail: organization.email,
      orgPhoneNumber: organization.phoneNumber,
      orgAddress1: address1,
      orgAddress2: address2,
      eventPosterImageUrl: event.posterImageUrl,
      cityState,
      orgLogoUrl: organization.orgLogoUrl,
      orderItems,
      discount,
      orderTotal,
      orderFees,
      promoterFee,
      processingFee,
      orderTax: orderTax,
      orderSubtotal,
      venuePosterImageUrl,
      venueAddress1,
      venueAddress2,
      timezone,
      isRSVP: order.type === OrderTypeEnum.RSVP,
      dayIdsTime,
      dayIdsTimeCalendar,
      ticketDeliveryType: event.ticketDeliveryType,
      physicalDeliveryInstructions: event.physicalDeliveryInstructions

    });
    const sendOrderQRCodeEmailRequest =
      pb.QueueOrderQRCodeEmailRequest.create({
        spanContext: span.context().toString(),
        toAddress: user.email || order.email,
        firstName: user.firstName || "Guest",
        eventName: event.name,
        orgName: organization.orgName,
        eventSubtitle: event.subtitle,
        venueName: venue.name,
        eventDate: Time.format(
          event.schedule.startsAt,
          "ddd, MMM Do",
          timezone
        ),
        eventStart: event.schedule.startsAt,
        eventEnd: event.schedule.endsAt,
        doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
        showAt: Time.formatTimeOfDay(startsAt, timezone),
        qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
        confirmationCode: order._id.toString(),
        orgEmail: organization.email,
        orgPhoneNumber: organization.phoneNumber,
        orgAddress1: address1,
        orgAddress2: address2,
        eventPosterImageUrl: event.posterImageUrl,
        cityState,
        orgLogoUrl: organization.orgLogoUrl,
        orderItems,
        orderTotal,
        discount,
        orderTax: orderTax,
        orderFees,
        orderSubtotal,
        qrCodeUrl: order.qrCodeUrl,
        venuePosterImageUrl,
        venueAddress1,
        venueAddress2,
        timezone,
        isRSVP: order.type === OrderTypeEnum.RSVP,
        dayIdsTime,
        dayIdsTimeCalendar,
        ticketDeliveryType: event.ticketDeliveryType,
        physicalDeliveryInstructions: event.physicalDeliveryInstructions,
        promoterFee,
        processingFee
      });
    if (order.tickets.length != 0) {
      if (Boolean(user.email || order.email) && refundedTicket.length != order.tickets.length) {
        try {
          if (qrCodeAt <= Time.now())
            await this.proxy.emailService.queueOrderQRCodeEmail(
              sendOrderQRCodeEmailRequest
            );
          else
            await this.proxy.emailService.queueOrderReceiptEmail(
              sendOrderReceiptRequest
            );
          response.status = pb.StatusCode.OK;
        } catch (e) {
          this.logger.error(`sendOrderReceiptEmail - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: e.message,
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
    } else {
      if (Boolean(user.email || order.email)) {
        try {
          if (qrCodeAt <= Time.now())
            await this.proxy.emailService.queueOrderQRCodeEmail(
              sendOrderQRCodeEmailRequest
            );
          else
            await this.proxy.emailService.queueOrderReceiptEmail(
              sendOrderReceiptRequest
            );
          response.status = pb.StatusCode.OK;
        } catch (e) {
          this.logger.error(`sendOrderReceiptEmail - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: e.message,
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
    }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
      event: "ORDER_RECEIPT_SENT",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
      },
    });
    span.finish();
    return response;
  };

  public sendOrderQRCodeEmail = async (
    request: pb.SendOrderQRCodeEmailRequest
  ): Promise<pb.SendOrderQRCodeEmailResponse> => {
    const span = tracer.startSpan("sendOrderQRCodeEmail", request.spanContext);
    const response: pb.SendOrderQRCodeEmailResponse =
      pb.SendOrderQRCodeEmailResponse.create();

    /**
     * Validate Request Paramaters
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
      requestorId: Joi.string().optional()
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `sendOrderQRCodeEmail - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId, requestorId } = params.value;

    let orderEntities: IOrderEntities;

    try {
      orderEntities = await this.orderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let {
      order,
      organization,
      user,
      event,
      venues: [venue],
      fees,
    } = orderEntities;

    /**
     * Generate the QR Code
     */

    // secret id may already be generated from breakApartOrder()
    if (!order.secretId) {
      order.secretId = uuid4() + uuid4();
    }
    let qrCodeUrl;

    try {
      qrCodeUrl = await this.generateQRCodeAndUpload(
        span.context().toString(),
        order
      );
    } catch (e) {
      this.logger.error("FAILED TO GENERATE QR CODE");
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to generate order QR code. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    order.qrCodeUrl = qrCodeUrl;
    try {
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to save order QR Code. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Send the order QR Code
     */
    const { address } = organization;
    const address1 = `${address.address1} ${address.address2}`;
    const address2 = `${address.city}, ${address.state} ${address.zip}`;

    // const performanceSchedules = event.performances.reduce((cur, next) => {
    //    cur.doorsAt.push(next.schedule.doorsAt);
    //    cur.startsAt.push(next.schedule.startsAt);
    //    return cur;
    // }, {
    //    doorsAt: [],
    //    startsAt: [],
    // });
    const performanceSchedules = event.performances.reduce(
      (cur, next) => {
        if (next.schedule.length == 1) {
          cur.doorsAt.push(next.schedule[0].doorsAt);
          cur.startsAt.push(next.schedule[0].startsAt);
          cur.endsAt.push(next.schedule[0].endsAt);
        } else {
          next.schedule.map((sdl) => {
            cur.doorsAt.push(sdl.doorsAt);
            cur.startsAt.push(sdl.startsAt);
            cur.endsAt.push(sdl.endsAt);
          });
        }
        return cur;
      },
      {
        doorsAt: [],
        startsAt: [],
        endsAt: [],
      }
    );

    const venuePosterImageUrl = venue.imageUrls[0];
    const venueAddress1 = `${venue.address.address1} ${venue.address.address2}`;
    const venueAddress2 = `${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
    const timezone =
      venue && venue.address && venue.address.timezone
        ? venue.address.timezone
        : "America/Denver";
    const doorsAt = Math.min(...performanceSchedules.doorsAt);
    const startsAt = Math.min(...performanceSchedules.startsAt);
    const qrCodeAt = EventUtil.qrCodeEmailAt(event);
    const cityState = `${venue.address.city}, ${venue.address.state}`;

    /**
     * Get the order summary
     */
    let orderSummary: IOrderSummary;
    try {
      orderSummary = await this.orderSummary(span, order, fees, false);
      if (!Boolean(orderSummary)) {
        throw new Error("Failed to retrieve order summary");
      }
    } catch (e) {
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    // const { tickets, upgrades, allTickets = [] } = orderSummary;
    const { tickets, upgrades } = orderSummary;

    let ticketValue = 0;
    let dayIds = [];
    let dayIdsTime = [];
    let dayIdsTimeCalendar = [];
    const perfomancesArray = performanceSchedules.startsAt.map(
      (date, index) => {
        return {
          startsAt: date,
          endsAt: performanceSchedules.endsAt[index],
          doorsAt: performanceSchedules.doorsAt[index],
        };
      }
    );

    dayIdsTime = perfomancesArray.filter(
      (start, index) => !dayIds.includes(start.startsAt)
    );
    if (tickets.length === 0) {
      dayIdsTimeCalendar.push({
        startsAt: performanceSchedules.startsAt[0],
        endsAt: performanceSchedules.endsAt[0],
        doorsAt: performanceSchedules.doorsAt[0],
      });
    }
    const ticketItems = tickets.map((item) => {
      let orderItem: any = {
        name: `${item.count} x ${item.name}`,
        price:
          order.type === OrderTypeEnum.RSVP
            ? `$${Price.output(item.values, true, true)}`
            : `$${Price.output(item.price, true, true)}`,
        description: item.description,
        type: order.type === OrderTypeEnum.RSVP ? "reservation" : "order",
      };

      const timeZone = address?.timezone ? address?.timezone : "America/Denver";
      const days = item.dayIds
        .map((day) =>
          Time.format(day, "MMM Do", timeZone).replace("Section", "")
        )
        .filter(Boolean)
        .join(", ");

      if (
        event.performances[0].schedule &&
        event.performances[0].schedule.length > 0
      ) {
        if (days) orderItem.days = days;
      }
      dayIds = item.dayIds.filter((day) => !dayIds.includes(day));

      dayIdsTimeCalendar = perfomancesArray.filter((start, index) =>
        item.dayIds.includes(start.startsAt.toString())
      );

      if (dayIds.length == 0) {
        dayIdsTimeCalendar.push({
          startsAt: performanceSchedules.startsAt[0],
          endsAt: performanceSchedules.endsAt[0],
          doorsAt: performanceSchedules.doorsAt[0],
        });
      }

      const seats = item.seats
        .map((seat) => seat.replace("Section", ""))
        .filter(Boolean)
        .join(", ");
      if (seats) orderItem.seats = seats;
      ticketValue = Number(ticketValue) + Number(item.values);
      return orderItem;
    });

    const upgradeItems = upgrades.map((item) => {
      return {
        name: `${item.count} x ${item.name}`,
        price: `$${Price.output(item.price, true, true)}`,
      };
    });

    event.fees = fees;
    event.organization = organization;


    // let guestFees = PaymentUtil.calculateGuestFee(
    //   allTickets as any,
    //   event as any
    // );

    const orderItems = [...ticketItems, ...upgradeItems];
    //  orderSummary.total = Number(orderSummary.total);

    // orderSummary.total = Number(orderSummary.total) + Number(guestFees);
    let orderTotal = `$${Price.output(order.payments[0].amount as number, true, true)}`;
    let taxFees1 = Price.output(orderSummary.salesTaxFee as number);
    let tax = parseFloat((Math.round((taxFees1) * 100) / 100).toFixed(2)) || 0;
    let promoterFee = `$${Price.output(orderSummary.promoterFee as number, true, true)}`;
    let processingFee = `$${Price.output(
      (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number), true, true
    )}`;
    let orderTax = `$${tax.toFixed(2)}`;
    let orderFees = `$${(
      Price.output(
        (orderSummary.total as number) - (orderSummary.subtotal as number)
      ) - tax
    ).toFixed(2)}`;
    // let orderSubtotal = `$${Price.output(
    //   orderSummary.subtotal as number, true, true
    // )}`;
    let orderSubtotal = `$${Price.output(
      (orderSummary.subtotal as number) + (orderSummary.promoterFee as number), true, true
    )}`;

    let discount = `$${Price.output((order?.discountAmount as number), true, true)}`;;

    /**
     * Send the QR Code email
     */

    if (order.type === OrderTypeEnum.RSVP) {
      orderTotal = `$${Price.output(ticketValue as number, true, true)}`;
      // tax = parseFloat(
      //   (
      //     (Price.output(ticketValue as number) * (order?.tax ? order.tax : 0)) /
      //     100
      //   ).toFixed(2)
      // );
      // orderTax = `$${tax.toFixed(2)}`;
      // orderFees = `$${(
      //   Price.output((ticketValue as number) - (ticketValue as number)) - tax
      // ).toFixed(2)}`;
      orderSubtotal = `$${Price.output(ticketValue as number, true, true)}`;
    }


    // guestFees



    // let guestTicketFees = event?.fees.filter(
    //   (fee: IFee) =>
    //     fee.filters && fee.filters[0] === FeeFiltersEnum.GuestTicket
    // );


    // let guestFeesValue = guestTicketFees && guestTicketFees[0]?.value;
    // let guestMembers = allTickets.filter((a: any) => !a.isMemberIdValid).length;

    // let guestFees = (guestFeesValue as number) * guestMembers;
    //  guestTicketFees.length > 0 && event.organization.isTegIntegration
    //   ? guestFees
    //   : 0;


    if (Boolean(user.email || order.email)) {
      const sendOrderQRCodeEmailRequest =
        pb.QueueOrderQRCodeEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: user.email || order.email,
          firstName: user.firstName || "Guest",
          eventName: event.name,
          orgName: organization.orgName,
          eventSubtitle: event.subtitle,
          venueName: venue.name,
          eventDate: Time.format(
            event.schedule.startsAt,
            "ddd, MMM Do",
            timezone
          ),
          eventStart: event.schedule.startsAt,
          eventEnd: event.schedule.endsAt,
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
          confirmationCode: order._id.toString(),
          orgEmail: organization.email,
          orgPhoneNumber: organization.phoneNumber,
          orgAddress1: address1,
          orgAddress2: address2,
          eventPosterImageUrl: event.posterImageUrl,
          cityState,
          orgLogoUrl: organization.orgLogoUrl,
          orderItems,
          orderTotal,
          discount,
          orderTax: orderTax,
          orderFees,
          promoterFee,
          processingFee,
          orderSubtotal,
          qrCodeUrl: order.qrCodeUrl,
          venuePosterImageUrl,
          venueAddress1,
          venueAddress2,
          timezone,
          isRSVP: order.type === OrderTypeEnum.RSVP,
          dayIdsTime,
          dayIdsTimeCalendar,
          ticketDeliveryType: event.ticketDeliveryType,
          physicalDeliveryInstructions: event.physicalDeliveryInstructions
        });
      try {
        await this.proxy.emailService.queueOrderQRCodeEmail(
          sendOrderQRCodeEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    /**
     * Send the QR Code SMS
     */
    const sendOrderQRCodeSMSRequest = pb.SendPlivoMMSRequest.create({
      spanContext: span.context().toString(),
      phoneNumber: user.phoneNumber || 'N/A',
      message: `Here are your tickets to ${event.name}`,
      mediaUrl: qrCodeUrl,
    });

    try {
      if (event?.ticketDeliveryType !== EventTicketDelivery.Physical) {
        await this.proxy.plivoService.sendPlivoMMS(sendOrderQRCodeSMSRequest);
      }

      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
      event: "ORDER_QR_CODE_SENT",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
      },
    });

    span.finish();
    return response;
  };

  public sendSeasonOrderReceiptEmail = async (
    request: pb.SendOrderQRCodeEmailRequest
  ): Promise<pb.SendOrderQRCodeEmailResponse> => {
    const span = tracer.startSpan(
      "sendSeasonOrderReceiptEmail",
      request.spanContext
    );
    const response: pb.SendOrderQRCodeEmailResponse =
      pb.SendOrderQRCodeEmailResponse.create();

    /**
     * Validate Request Paramaters
     */

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().optional(),
      orderId: Joi.string().required(),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `sendSeasonOrderReceiptEmail - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId, requestorId } = params.value;
    let orderEntities: ISeasonOrderEntities;
    try {
      orderEntities = await this.seasonOrderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`sendSeasonOrderReceiptEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let {
      order,
      organization,
      user,
      season,
      venues: [venue],
      fees,
      events,
    } = orderEntities;

    // secret id may already be generated from breakApartOrder()
    if (!order.secretId) {
      order.secretId = uuid4() + uuid4();
    }

    let qrCodeUrl;

    try {
      qrCodeUrl = await this.generateQRCodeAndUpload(
        span.context().toString(),
        order
      );
    } catch (e) {
      this.logger.error("FAILED TO GENERATE QR CODE");
      this.logger.error(`sendSeasonOrderReceiptEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to generate order QR code. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    order.qrCodeUrl = qrCodeUrl;

    try {
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`sendSeasonOrderReceiptEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to save order QR Code. Please contact support.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Send the order QR Code
     */
    const { address } = organization;
    const address1 = `${address.address1} ${address.address2}`;
    const address2 = `${address.city}, ${address.state} ${address.zip}`;

    // const performanceSchedules = event.performances.reduce((cur, next) => {
    //    cur.doorsAt.push(next.schedule.doorsAt);
    //    cur.startsAt.push(next.schedule.startsAt);
    //    return cur;
    // }, {
    //    doorsAt: [],
    //    startsAt: [],
    // });
    const performanceSchedules = season.performances.reduce(
      (cur, next) => {
        if (next.schedule.length == 1) {
          cur.doorsAt.push(next.schedule[0].doorsAt);
          cur.startsAt.push(next.schedule[0].startsAt);
          cur.endsAt.push(next.schedule[0].endsAt);
        } else {
          next.schedule.map((sdl) => {
            cur.doorsAt.push(sdl.doorsAt);
            cur.startsAt.push(sdl.startsAt);
            cur.endsAt.push(sdl.endsAt);
          });
        }
        return cur;
      },
      {
        doorsAt: [],
        startsAt: [],
        endsAt: [],
      }
    );

    const venuePosterImageUrl = venue.imageUrls[0];
    const venueAddress1 = `${venue.address.address1} ${venue.address.address2}`;
    const venueAddress2 = `${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
    const timezone =
      venue && venue.address && venue.address.timezone
        ? venue.address.timezone
        : "America/Denver";
    const doorsAt = Math.min(...performanceSchedules.doorsAt);
    const startsAt = Math.min(...performanceSchedules.startsAt);
    const qrCodeAt = EventUtil.qrCodeEmailAt(season);
    const cityState = `${venue.address.city}, ${venue.address.state}`;

    /**
     * Get the order summary
     */

    let orderSummary: IOrderSummary;
    try {
      orderSummary = await this.orderSummary(span, order, fees, false);
      if (!Boolean(orderSummary)) {
        throw new Error("Failed to retrieve order summary");
      }
    } catch (e) {
      this.logger.error(`sendSeasonOrderReceiptEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    // const { tickets, upgrades, allTickets } = orderSummary;
    const { tickets, upgrades } = orderSummary;

    let ticketValue = 0;
    let dayIds = [];
    let dayIdsTime = [];
    let dayIdsTimeCalendar = [];
    const ticketItems = tickets.map((item) => {
      let orderItem: any = {
        name: `${item.count} x ${item.name}`,
        price:
          order.type === OrderTypeEnum.RSVP
            ? `$${Price.output(item.values, true, true)
            }`
            : `$${Price.output(item.price, true, true)}`,
        description: item.description,
        type: order.type === OrderTypeEnum.RSVP ? "reservation" : "order",
      };

      const timeZone = address?.timezone ? address?.timezone : "America/Denver";
      const days = item.dayIds
        .map((day) =>
          Time.format(day, "MMM Do", timeZone).replace("Section", "")
        )
        .filter(Boolean)
        .join(", ");

      if (
        season.performances[0].schedule &&
        season.performances[0].schedule.length > 0
      ) {
        if (days) orderItem.days = days;
      }
      dayIds = item.dayIds.filter((day) => !dayIds.includes(day));

      const perfomancesArray = performanceSchedules.startsAt.map(
        (date, index) => {
          return {
            startsAt: date,
            endsAt: performanceSchedules.endsAt[index],
            doorsAt: performanceSchedules.doorsAt[index],
          };
        }
      );

      dayIdsTime = perfomancesArray.filter(
        (start, index) => !dayIds.includes(start.startsAt)
      );

      dayIdsTimeCalendar = perfomancesArray.filter((start, index) =>
        item.dayIds.includes(start.startsAt.toString())
      );

      if (dayIds.length == 0) {
        dayIdsTimeCalendar.push({
          startsAt: performanceSchedules.startsAt[0],
          endsAt: performanceSchedules.endsAt[0],
          doorsAt: performanceSchedules.doorsAt[0],
        });
      }

      const seats = item.seats
        .map((seat) => seat.replace("Section", ""))
        .filter(Boolean)
        .join(", ");
      if (seats) orderItem.seats = seats;
      ticketValue = Number(ticketValue) + Number(item.values);
      return orderItem;
    });

    const upgradeItems = upgrades.map((item) => {
      return {
        name: `${item.count} x ${item.name}`,
        price: `$${Price.output(item.price, true, true)}`,
      };
    });

    const orderItems = [...ticketItems, ...upgradeItems];

    season.fees = fees;
    season.organization = organization;


    // let guestFees = PaymentUtil.calculateGuestFee(
    //   allTickets as any,
    //   season as any
    // );

    // orderSummary.total = Number(orderSummary.total) + Number(guestFees);

    orderSummary.total = Number(orderSummary.total);

    let orderTotal = `$${Price.output(orderSummary.total as number, true, true)}`;
    let tax = parseFloat(
      (
        (Price.output(orderSummary.subtotal as number) *
          (order?.tax ? order.tax : 0)) /
        100
      ).toFixed(2)
    );
    let orderTax = `$${tax.toFixed(2)}`;
    let orderFees = `$${(
      Price.output(
        (orderSummary.total as number) - (orderSummary.subtotal as number)
      ) - tax
    ).toFixed(2)}`;
    // let orderSubtotal = `$${Price.output(
    //   orderSummary.subtotal as number, true, true
    // )}`;
    let promoterFee = `$${Price.output(orderSummary.promoterFee as number, true, true)}`;
    let processingFee = `$${Price.output(
      (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number), true, true
    )}`;
    let orderSubtotal = `$${Price.output(
      (orderSummary.subtotal as number) + (orderSummary.promoterFee as number), true, true
    )}`;




    /**
     * Send the QR Code email
     */


    if (order.type === OrderTypeEnum.RSVP) {

      // orderTotal = `$${Price.output(ticketValue as number, true)}`;
      orderTotal = `$${Price.output(0 as number, true, true)}`;
      // tax = parseFloat(
      //   (
      //     (Price.output(ticketValue as number) * (order?.tax ? order.tax : 0)) /
      //     100
      //   ).toFixed(2)
      // );
      // orderTax = `$${tax.toFixed(2)}`;
      // orderFees = `$${(
      //   Price.output((ticketValue as number) - (ticketValue as number)) - tax
      // ).toFixed(2)}`;
      orderSubtotal = `$${Price.output(ticketValue as number, true, true)}`;
    }

    // findSeasonById

    if (Boolean(user.email)) {
      const sendOrderQRCodeEmailRequest =
        pb.QueueSeasonOrderReceiptEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: user.email || order.email,
          firstName: user.firstName || "Guest",
          eventName: season.name,
          orgName: organization.orgName,
          eventSubtitle: season.subtitle,
          venueName: venue.name,
          eventDate: Time.format(
            season.schedule.startsAt,
            "ddd, MMM Do",
            timezone
          ),
          eventStart: season.schedule.startsAt,
          eventEnd: season.schedule.endsAt,
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
          confirmationCode: order._id.toString(),
          orgEmail: organization.email,
          orgPhoneNumber: organization.phoneNumber,
          orgAddress1: address1,
          orgAddress2: address2,
          eventPosterImageUrl: season.posterImageUrl,
          cityState,
          orgLogoUrl: organization.orgLogoUrl,
          orderItems,
          orderTotal,
          orderTax: orderTax,
          orderFees,
          orderSubtotal,
          qrCodeUrl: order.qrCodeUrl,
          venuePosterImageUrl,
          venueAddress1,
          venueAddress2,
          timezone,
          isRSVP: order.type === OrderTypeEnum.RSVP,
          dayIdsTime,
          dayIdsTimeCalendar,
          events,
          promoterFee,
          processingFee
        });

      try {
        await this.proxy.emailService.queueSeasonOrderReceiptEmail(
          sendOrderQRCodeEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    /**
     * Send the QR Code SMS
     */
    // const sendOrderQRCodeSMSRequest = pb.SendPlivoMMSRequest.create({
    //    spanContext: span.context().toString(),
    //    phoneNumber: user.phoneNumber,
    //    message: `Here are your tickets to ${season.name}`,
    //    mediaUrl: qrCodeUrl,
    // });

    // try {
    //    await this.proxy.plivoService.sendPlivoMMS(sendOrderQRCodeSMSRequest);
    //    response.status = pb.StatusCode.OK;
    // } catch (e) {
    //    this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
    //    response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
    //    response.errors = [pb.Error.create({
    //       key: 'Error',
    //       message: e.message,
    //    })];
    //    span.setTag('error', true);
    //    span.log({ errors: e.message });
    //    span.finish();
    //    return response;
    // }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
      event: "ORDER_QR_CODE_SENT",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
      },
    });

    span.finish();
    return response;
  };

  public orderQRCodeEmailOnDay = async (
    request: pb.SendOrderQRCodeEmailRequest
  ): Promise<pb.SendOrderQRCodeEmailResponse> => {
    const span = tracer.startSpan("orderQRCodeEmailOnDay", request.spanContext);
    const response: pb.SendOrderQRCodeEmailResponse =
      pb.SendOrderQRCodeEmailResponse.create();

    /**
     * Validate Request Paramaters
     */

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
      requestorId: Joi.string().optional()
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `orderQRCodeEmailOnDay - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId, requestorId } = params.value;

    let orderEntities: IOrderEntities;

    try {
      orderEntities = await this.orderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`orderQRCodeEmailOnDay - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    let {
      order,
      organization,
      user,
      event,
      venues: [venue],
      fees,
    } = orderEntities;
    if (event && event.cancel == false) {
      /**
       * Generate the QR Code
       */

      // secret id may already be generated from breakApartOrder()
      if (!order.secretId) {
        order.secretId = uuid4() + uuid4();
      }
      /**
       * Send the order QR Code
       */
      const { address } = organization;
      const address1 = `${address.address1} ${address.address2}`;
      const address2 = `${address.city}, ${address.state} ${address.zip}`;

      // const performanceSchedules = event.performances.reduce((cur, next) => {
      //    cur.doorsAt.push(next.schedule.doorsAt);
      //    cur.startsAt.push(next.schedule.startsAt);
      //    return cur;
      // }, {
      //    doorsAt: [],
      //    startsAt: [],
      // });
      const performanceSchedules = event.performances.reduce(
        (cur, next) => {
          if (next.schedule.length == 1) {
            cur.doorsAt.push(next.schedule[0].doorsAt);
            cur.startsAt.push(next.schedule[0].startsAt);
            cur.endsAt.push(next.schedule[0].endsAt);
          } else {
            next.schedule.map((sdl) => {
              cur.doorsAt.push(sdl.doorsAt);
              cur.startsAt.push(sdl.startsAt);
              cur.endsAt.push(sdl.endsAt);
            });
          }
          return cur;
        },
        {
          doorsAt: [],
          startsAt: [],
          endsAt: [],
        }
      );

      const venuePosterImageUrl = venue.imageUrls[0];
      const venueAddress1 = `${venue.address.address1} ${venue.address.address2}`;
      const venueAddress2 = `${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
      const timezone =
        venue && venue.address && venue.address.timezone
          ? venue.address.timezone
          : "America/Denver";
      const doorsAt = Math.min(...performanceSchedules.doorsAt);
      const startsAt = Math.min(...performanceSchedules.startsAt);
      const qrCodeAt = EventUtil.qrCodeEmailAt(event);
      const cityState = `${venue.address.city}, ${venue.address.state}`;

      /**
       * Get the order summary
       */
      let orderSummary: IOrderSummary;

      try {
        orderSummary = await this.orderSummaryRefunded(
          span,
          order,
          fees,
          false
        );
        if (!Boolean(orderSummary)) {
          throw new Error("Failed to retrieve order summary");
        }
      } catch (e) {
        this.logger.error(`orderQRCodeEmailOnDay - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      if (orderSummary && orderSummary.state != OrderStateEnum.Refunded) {
        // const { tickets, upgrades, allTickets } = orderSummary;
        const { tickets, upgrades } = orderSummary;

        let totalPrice = 0;
        let dayIds = [];
        let dayIdsTime = [];
        let ticketValue = 0;
        let dayIdsTimeCalendar = [];

        const perfomancesArray = performanceSchedules.startsAt.map(
          (date, index) => {
            return {
              startsAt: date,
              endsAt: performanceSchedules.endsAt[index],
              doorsAt: performanceSchedules.doorsAt[index],
            };
          }
        );

        dayIdsTime = perfomancesArray.filter(
          (start, index) => !dayIds.includes(start.startsAt)
        );
        if (tickets.length == 0) {
          if (dayIds.length == 0) {
            dayIdsTimeCalendar.push({
              startsAt: performanceSchedules.startsAt[0],
              endsAt: performanceSchedules.endsAt[0],
              doorsAt: performanceSchedules.doorsAt[0],
            });
          }
        }
        const ticketItems =
          tickets &&
          tickets.map((item) => {
            // if(item.refund)
            let orderItem: any = {
              name: `${item.count} x ${item.name}`,
              price:
                order.type === OrderTypeEnum.RSVP
                  ? `$${Price.output(item.values, true, true)}`
                  : `$${Price.output(item.price, true, true)}`,
              description: item.description,
              type: order.type === OrderTypeEnum.RSVP ? "reservation" : "order",
            };
            const timeZone = address?.timezone
              ? address?.timezone
              : "America/Denver";
            const days = item.dayIds
              .map((day) =>
                Time.format(day, "MMM Do", timeZone).replace("Section", "")
              )
              .filter(Boolean)
              .join(", ");

            if (
              event.performances[0].schedule &&
              event.performances[0].schedule.length > 0
            ) {
              if (days) orderItem.days = days;
            }
            dayIds = item.dayIds.filter((day) => !dayIds.includes(day));

            dayIdsTimeCalendar = perfomancesArray.filter((start, index) =>
              item.dayIds.includes(start.startsAt.toString())
            );

            if (dayIds.length == 0) {
              dayIdsTimeCalendar.push({
                startsAt: performanceSchedules.startsAt[0],
                endsAt: performanceSchedules.endsAt[0],
                doorsAt: performanceSchedules.doorsAt[0],
              });
            }

            const seats = item.seats
              .map((seat) => seat.replace("Section", ""))
              .filter(Boolean)
              .join(", ");
            if (seats) orderItem.seats = seats;
            totalPrice = totalPrice + item.price;
            ticketValue = Number(ticketValue) + Number(item.values);

            return orderItem;
          });

        const upgradeItems =
          upgrades &&
          upgrades.map((item) => {
            totalPrice = totalPrice + item.price;
            return {
              name: `${item.count} x ${item.name}`,
              price: `$${Price.output(item.price)}`,
            };
          });

        let orderItems = [...ticketItems, ...upgradeItems];
        let orderTotal = `$${Price.output(
          orderSummary.orderTotalWithRefund as number
          , true, true)}`;
        let tax = parseFloat(
          (
            (Price.output(orderSummary.subtotal as number) *
              (order?.tax ? order.tax : 0)) /
            100
          ).toFixed(2)
        );

        event.fees = fees;
        event.organization = organization;


        // let guestFees = PaymentUtil.calculateGuestFee(
        //   allTickets as any,
        //   event as any
        // );

        let orderTax = `$${tax.toFixed(2)}`;
        // orderSummary.total = Number(orderSummary.total) + Number(guestFees);
        orderSummary.total = Number(orderSummary.total);
        let orderFees = `$${(
          Price.output(
            (orderSummary.total as number) - (orderSummary.subtotal as number)
          ) - tax
        ).toFixed(2)}`;
        // let orderSubtotal = `$${Price.output(totalPrice as number, true, true)}`;
        let promoterFee = `$${Price.output(orderSummary.promoterFee as number, true, true)}`;
        let processingFee = `$${Price.output(
          (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number), true, true
        )}`;
        let orderSubtotal = `$${Price.output(
          (orderSummary.subtotal as number) + (orderSummary.promoterFee as number), true, true
        )}`;

        if (order.type === OrderTypeEnum.RSVP) {
          // orderTotal = `$${Price.output(0 as number).toFixed(2)}}`;
          orderTotal = `$${Price.output(ticketValue as number, true, true)}`;
          // tax = parseFloat(
          //   (
          //     (Price.output(ticketValue as number) *
          //       (order?.tax ? order.tax : 0)) /
          //     100
          //   ).toFixed(2)
          // );
          // orderTax = `$${tax.toFixed(2)}`;
          // orderFees = `$${(
          //   Price.output((ticketValue as number) - (ticketValue as number)) -
          //   tax
          // ).toFixed(2)}`;
          orderSubtotal = `$${Price.output(ticketValue as number, true, true)}`;
        }
        /**
         * Send the QR Code email
         */
        let sendOrderQRCodeEmailRequest;
        if (Boolean(user.email)) {
          sendOrderQRCodeEmailRequest = pb.QueueOrderQRCodeEmailRequest.create({
            spanContext: span.context().toString(),
            toAddress: user.email || order.email,
            firstName: user.firstName || "Guest",
            eventName: event.name,
            orgName: organization.orgName,
            eventSubtitle: event.subtitle,
            venueName: venue.name,
            eventDate: Time.format(
              event.schedule.startsAt,
              "ddd, MMM Do",
              timezone
            ),
            doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
            showAt: Time.formatTimeOfDay(startsAt, timezone),
            qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
            confirmationCode: order._id.toString(),
            orgEmail: organization.email,
            orgPhoneNumber: organization.phoneNumber,
            orgAddress1: address1,
            orgAddress2: address2,
            eventPosterImageUrl: event.posterImageUrl,
            cityState,
            orgLogoUrl: organization.orgLogoUrl,
            orderItems,
            orderTotal,
            orderTax: orderTax,
            orderFees,
            promoterFee,
            processingFee,
            orderSubtotal,
            qrCodeUrl: order.qrCodeUrl,
            venuePosterImageUrl,
            venueAddress1,
            venueAddress2,
            isRSVP: order.type === OrderTypeEnum.RSVP,
            dayIdsTime,
            dayIdsTimeCalendar,
            ticketDeliveryType: event.ticketDeliveryType,
            physicalDeliveryInstructions: event.physicalDeliveryInstructions,
            timezone
          });
          try {
            await this.proxy.emailService.orderQRCodeEmailOnDay(
              sendOrderQRCodeEmailRequest
            );
            response.status = pb.StatusCode.OK;
          } catch (e) {
            this.logger.error(`orderQRCodeEmailOnDay - error: ${e.message}`);
            response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
            response.errors = [
              pb.Error.create({
                key: "Error",
                message: e.message,
              }),
            ];
            span.setTag("error", true);
            span.log({ errors: e.message });
            span.finish();
            return response;
          }
        }

        /**
         * Send the QR Code SMS
         */

        const sendOrderQRCodeSMSRequest = pb.SendPlivoMMSRequest.create({
          spanContext: span.context().toString(),
          phoneNumber: user.phoneNumber || 'N/A',
          message: `Today is the day! Here are your tickets to ${event.name}`,
          mediaUrl: order.qrCodeUrl,
        });

        try {
          if (event?.ticketDeliveryType !== EventTicketDelivery.Physical) {
            await this.proxy.plivoService.sendPlivoMMS(
              sendOrderQRCodeSMSRequest
            );
          }
          response.status = pb.StatusCode.OK;
        } catch (e) {
          this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
          try {
            
             this.proxy.emailService.orderQRCodeEmailOnDay(
              sendOrderQRCodeEmailRequest
            );
            response.status = pb.StatusCode.OK;
          } catch (e) {
            this.logger.error(`orderQRCodeEmailOnDay - error: ${e.message}`);
            response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
            response.errors = [
              pb.Error.create({
                key: "Error",
                message: e.message,
              }),
            ];
            span.setTag("error", true);
            span.log({ errors: e.message });
            span.finish();
            return response;
          }

          // Track
          this.segment.track({
            ...(order.userId != null && order.userId != '') && { userId: order.userId },
            ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
            event: "ORDER_QR_CODE_SENT",
            properties: {
              orderId: order._id,
              orgId: order.orgId,
              eventId: order.eventId,
            },
          });
        }

      }

      /**
       * Send the QR Code SMS
       */
      const sendOrderQRCodeSMSRequest = pb.SendPlivoMMSRequest.create({
        spanContext: span.context().toString(),
        phoneNumber: user.phoneNumber || "N/A",
        message: `Today is the day! Here are your tickets to ${event.name}`,
        mediaUrl: order.qrCodeUrl,
      });
      try {
        if (event?.ticketDeliveryType !== EventTicketDelivery.Physical) {
          await this.proxy.plivoService.sendPlivoMMS(sendOrderQRCodeSMSRequest);
        }
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderQRCodeEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      // Track
      this.segment.track({
        ...(order.userId != null && order.userId != '') && { userId: order.userId },
        ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
        event: "ORDER_QR_CODE_SENT",
        properties: {
          orderId: order._id,
          orgId: order.orgId,
          eventId: order.eventId,
        },
      });
    }
    span.finish();
    return response;
  };

  public refundOrder = async (
    request: pb.RefundOrderRequest
  ): Promise<pb.RefundOrderResponse> => {
    const span = tracer.startSpan("refundOrder", request.spanContext);
    const response: pb.RefundOrderResponse = pb.RefundOrderResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      orderId: Joi.string().required(),
      refundAmount: Joi.number().optional(),
      ticketIds: Joi.array().items(Joi.string()).default([]),
      upgradeIds: Joi.array().items(Joi.string()).default([]),
      refundedBy: Joi.string().required(),
      refundReason: Joi.optional(),
      processingFee: Joi.optional(),
      eventType: Joi.optional(),
      promoterFee: Joi.optional(),
    });

    const params = schema.validate(request);

    let promo = null;
    let discountPromo = null;
    let ticketTypeIds = [];
    let upgradeTypeIds = [];

    if (params.error) {
      this.logger.error(`refundOrder - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let {
      orgId,
      orderId,
      refundAmount,
      ticketIds,
      upgradeIds,
      refundedBy,
      refundReason,
      processingFee,
      eventType,
      promoterFee
    } = params.value;

    eventType = eventType == "WithoutRefund" ? false : true;
    /**
     * Get the order
     */
    let order: IOrder;
    try {
      order = await this.storage.findById(span, orderId);
    } catch (e) {
      this.logger.error(`refundOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    let intent = order?.payments?.length
      ? order.payments[0].paymentIntentId
      : null;
    if (intent) {
      const stripeRequest = pb.RetrieveStripeChargeByIntentsRequest.create({
        spanContext: span.context().toString(),
        orgId,
        stripeIntentId: intent,
      });
      let stripresponse: pb.RetrieveStripeChargeByIntentsResponse;
      try {
        stripresponse =
          await this.proxy.stripeService.retrieveStripeChargeByIntent(
            stripeRequest
          );
        order.stripeChargeId = stripresponse.stripeChargeId;
      } catch (e) {
        this.logger.error(`retrieveStripeChargeByIntent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }
    const hasCharge = Boolean(order.stripeChargeId);

    /**
     * Make sure the order hasn't already been refunded
     */
    if (order.state === OrderStateEnum.Refunded) {
      this.logger.error(`refundOrder - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "This order has already been canceled.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    // let fees = [];

    if (hasCharge) {
      /**
       * List order fees
       */
      const listFeesRequest = new pb.ListFeesByIdRequest.create({
        spanContext: span.context().toString(),
        orgId,
        feeIds: order.feeIds,
      });

      let listFeesResponse: pb.ListEventFeesResponse;
      try {
        listFeesResponse = await this.proxy.feeService.listFeesById(
          listFeesRequest
        );
        if (listFeesResponse.status !== pb.StatusCode.OK) {
          throw new Error("Failed to fetch order fees.");
        }
      } catch (e) {
        this.logger.error(`refundOrder - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      // fees = listFeesResponse.fees;
    }
    /**
     * If ticketIds or upgradeIds are defined,
     * we are only refunding the amount of the
     * tickets and upgrade
     */
    // if (!refundAmount && (ticketIds.length || upgradeIds.length)) {
    //   // const tickets = order.tickets.filter(ticket => ticketIds.includes(ticket._id.toString()));
    //   // const upgrades = order.upgrades.filter(upgrade => upgradeIds.includes(upgrade._id.toString()));

    //   // The refundAmount is the total cost of the selected tickets and upgrades
    //   // refundAmount = OrderUtil.orderSubtotal({ tickets, upgrades });
    //   refundAmount = 0;
    // }

    /**
     * If no ticketIds or upgradeIds are defined,
     * and the refundAmount is not set, refund the entire order
     */
    /* commented by pooja */
    // if (!refundAmount) {
    //   refundAmount = OrderUtil.orderTotalWithRefund(order, fees);
    // }

    // Checking that order's event has seatingChartKey
    const eventId = order.eventId;
    let promotionsCode = [];
    let seatingChartKey = false;
    const discountAmount = order?.discountAmount;
    let subtotal = OrderUtil.orderSubtotal(order);

    if (eventId) {
      // get event Data
      const findEventByIdRequest = pb.FindEventByIdRequest.create({
        spanContext: span.context().toString(),
        eventId: eventId,
      });

      let findEventByIdResponse = pb.FindEventByIdResponse.create({});
      try {
        findEventByIdResponse = await this.proxy.eventService.findEventById(
          findEventByIdRequest
        );
        if (findEventByIdResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            "Failed to fetch event. Please try again or contact support."
          );
        }
      } catch (e) {
        this.logger.error(`Refund Getting Event - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message:
              "Failed to Refund order. Please try again or contact support.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }



      const { event } = findEventByIdResponse;
      let discountCode = order?.discountCode;
      promotionsCode = event?.promotions.filter((promo) => promo?.code?.toLowerCase() === discountCode?.toLowerCase());

      // console.log(subtotal, discountAmount, promotionsCode)




      // if (
      //   promotionsCode?.length &&
      //   promotionsCode[0]?.discountType === "Flat" &&
      //   promotionsCode[0]?.appliesTo === "Per Order"
      // ) {
      //   const data = tickets.length + upgrades.length;
      //   const discountValue = Number(promotionsCode[0]?.discountValue);
      //   console.log(data, "ticketsForOrder");
      //   const newData = discountValue / data;

      //   console.log(newData);

      //   tickets.forEach((ticket) => {
      //     ticket.price -= newData;
      //   }

      //   )
      //   upgrades.forEach((upgrade) => {
      //     upgrade.price -= newData;
      //   }
      //   )

      // }



      // const promotions = event?.promotions;






      // Event has seatingChartKey then check for its data from seatio
      seatingChartKey = event.seatingChartKey || false;
    }
    /***************** */
    var refundAmountTotal = 0;
    var seats = [];
    /**
     * Update the Tickets
     */
    let ticketType;
    // let tax = order.tax ? order.tax : 0;
    if (ticketIds.length) {
      order.tickets = await Promise.all(
        order.tickets.map((ticket) => {
          if (
            ticketIds.includes(ticket._id.toString()) &&
            (ticket.state == OrderItemStateEnum.Active ||
              ticket.state == OrderItemStateEnum.Canceled)
          ) {
            if (ticket.state == OrderItemStateEnum.Canceled) {
              ticketType = "Canceled";
            }
            // if()
            if (promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {

              let perTicketDiscount = (discountAmount / subtotal) * ticket.price;
              let ticketPrice = ticket.price - perTicketDiscount;
              refundAmountTotal += ticketPrice;

            } else {

              refundAmountTotal += ticket.price;

            }

            // refundAmountTotal += ticket.price + (ticket.price * tax) / 100;
            ticket.state = OrderItemStateEnum.Canceled;

            if (eventType == true) {
              ticket.refund = {
                refunded: true,
                refundedAt: Time.now(),
                refundedBy,
                // refundedAmount: ticket.price + (ticket.price * tax) / 100,
                refundedAmount: ticket.price,
                refundReason: refundReason
              };

              ticketTypeIds.push(ticket.ticketTypeId);
              // event has seatingChartKey then extract tickets with seat
              if (seatingChartKey) {
                if (ticket.seat) {
                  seats.push(ticket.seat);
                }
              }
            }
            return ticket;
          }
          return ticket;
        })
      );
    }
    /**
     * Update the Upgrades
     */
    if (upgradeIds.length) {
      order.upgrades = await Promise.all(
        order.upgrades.map((upgrade) => {
          if (
            upgradeIds.includes(upgrade._id.toString()) &&
            (upgrade.state == OrderItemStateEnum.Active ||
              upgrade.state == OrderItemStateEnum.Canceled)
          ) {

            // refundAmountTotal += upgrade.price
            if (upgrade.state == OrderItemStateEnum.Canceled) {
              ticketType = "Canceled";
            }
            upgrade.state = OrderItemStateEnum.Canceled;
            if (promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {
              let perTicketDiscount = (discountAmount / subtotal) * upgrade.price;
              let upgradePrice = upgrade.price - perTicketDiscount;
              refundAmountTotal += upgradePrice;
            } else {
              refundAmountTotal += upgrade.price;
            }

            // refundAmountTotal += upgrade.price + (upgrade.price * tax) / 100;
            // refundAmountTotal += upgrade.price;
            if (eventType == true) {
              upgrade.refund = {
                refunded: true,
                refundedAt: Time.now(),
                refundedBy,
                // refundedAmount: upgrade.price + (upgrade.price * tax) / 100,
                refundedAmount: upgrade.price,
                refundReason: refundReason,
              };
              upgradeTypeIds.push(upgrade.upgradeId);
            }
            return upgrade;
          }
          return upgrade;
        })
      );
    }

    /**
     * Update the Order
     */
    const allTicketsRefunded = order.tickets.every((ticket) => ticket?.refund?.refunded)
    const allUpgradesRefunded = order.upgrades.every((upgrade) => upgrade?.refund?.refunded);
    let isFullyRefunded = false;
    const summary = await this.orderSummary(span, order, order.fees, true);


    let promoterFeeRefunded = false
    let processingFeeRefunded = false
    order.state = eventType == false ? order.state : OrderStateEnum.PartiallyRefunded;
    if (allTicketsRefunded && allUpgradesRefunded) {
      if (processingFee) {
        promo = order.promotionCode;
        discountPromo = order?.discountCode
        if (eventType == true) {
          order.processingFee.refund.refunded = true;
          order.processingFee.refund.refundReason = refundReason;
          order.processingFee.refund.refundedBy = refundedBy;
          order.processingFee.refund.refundedAt = Time.now();
          order.processingFee.refund.refundedAmount = (summary.selloutFee + summary.stripeFee);

          // order.processingFee.refund.refundedAmount = Price.output((summary.selloutFee + summary.stripeFee), true, false);
          order.processingFee.amount = (summary.selloutFee + summary.stripeFee);
        }
        refundAmountTotal += Number(summary.selloutFee) + Number(summary.stripeFee);
      }
      if (promoterFee) {
        if (eventType) {
          order.promoterFee = {
            refund: {
              refunded: true,
              refundReason: refundReason,
              refundedBy: refundedBy,
              refundedAt: Time.now(),
              refundedAmount: (summary.promoterFee + summary.salesTaxFee)
              // refundedAmount: Price.output((summary.promoterFee + summary.salesTaxFee), true, false)
            },
            amount: (summary.promoterFee + summary.salesTaxFee)
          }
        }

        refundAmountTotal += Number(summary.promoterFee) + Number(summary.salesTaxFee);
      }
      promoterFeeRefunded = order?.promoterFee?.refund?.refunded || false
      processingFeeRefunded = order?.processingFee?.refund?.refunded || false
      if (promoterFeeRefunded && processingFeeRefunded) {
        order.state = OrderStateEnum.Refunded;
      }
    }
    if (order.state == OrderStateEnum.Refunded) {
      isFullyRefunded = true;
    }

    if (hasCharge) {
      /**
       * Make the refund request to the Stripe service
       */
      const refundRequest = pb.RefundStripeChargeRequest.create({
        spanContext: span.context().toString(),
        orgId,
        stripeChargeId: order.stripeChargeId,
        amount: refundAmountTotal,
      });
      let refundResponse: pb.RefundStripeChargeResponse;

      try {
        if (refundAmountTotal > 0 && eventType) {
          // added by pooja
          refundResponse = await this.proxy.stripeService.refundStripeCharge(
            refundRequest
          );
          SaveLogsToFile(
            "OrderService:refundOrder-refundStripeCharge",
            refundResponse
          );
          if (refundResponse.status !== pb.StatusCode.OK) {
            throw new Error(
              "There was an error refunding this order. Please try again or contact support."
            );
          }
        }
      } catch (e) {
        this.logger.error(`refundOrder - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    order.refundReason = refundReason;

    if (eventType == true) {
      order.refundedAmount = order.refundedAmount
        ? order.refundedAmount + refundAmountTotal
        : refundAmountTotal;
    }
    // order.state = eventType == false ? OrderStateEnum.Canceled : order.state
    /**
     * Save the order to storage
     */

    try {
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`refundOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // Release or free tickets which is occupied on cancel
    if (seatingChartKey && seats.length > 0) {
      const releaseSeatsRequest = pb.ReleaseSeatsRequest.create({
        spanContext: span.context().toString(),
        orgId,
        eventId,
        seats,
      });

      try {
        await this.proxy.seatingService.releaseSeats(releaseSeatsRequest);
      } catch (e) {
        this.logger.error(`refundOrder Seating Error - error: ${e.message}`);
        span.setTag("error", true);
        span.log({ errors: e.message });
      }
    }

    /**
     * Free the Refunded ticket and upgrades for re ordering
     */

    if (ticketType != OrderStateEnum.Canceled) {
      const requestEvent = pb.CancelTicketRequest.create({
        spanContext: span.context().toString(),
        orgId,
        eventId: order.eventId,
        ticketTypeId: ticketTypeIds,
        upgradesTypeId: upgradeTypeIds,
        promotionCode: promo,
        discountCode: discountPromo,
      });
      await this.proxy.eventService.cancelTicket(requestEvent);
    }

    /**
     * Send refund email
     */

    const sendRefundEmail = async () => {
      const span1 = tracer.startSpan("refundOrder.sendRefundEmail", span);
      const sendOrderRefundEmailRequest = pb.SendOrderRefundEmailRequest.create(
        {
          spanContext: span.context().toString(),
          orderId: order._id.toString(),
          ticketIds,
          upgradeIds,
          processingFee,
          promoterFee
        }
      );

      try {
        // const res = await this.proxy.orderService.sendOrderRefundEmail(sendOrderRefundEmailRequest);
        const res = await this.proxy.orderService.resendOrderRefundEmail(
          sendOrderRefundEmailRequest
        );
        this.logger.info(res);
      } catch (e) {
        this.logger.error(`refundOrder - orderId: ${order._id}: ${e.message}`);
        span1.setTag("error", true);
        span1.log({ errors: e.message });
        span1.finish();
      }
    };
    sendRefundEmail();

    /**
     * Broadcast order refund
     */

    const isFullyCanceled = !(
      order.tickets.filter(
        (ticket) => ticket.state !== OrderItemStateEnum.Canceled
      ).length > 0
    );

    const orderRefundedNotification =
      pb.Broadcast.OrderRefundedNotification.create({
        spanContext: span.context().toString(),
        order: pb.Order.fromObject(order),
        orgId: order.orgId,
        userId: order.userId,
        orderId: orderId.toString(),
        eventId: order.eventId,
        artistIds: order.artistIds,
        venueIds: order.venueIds,
        refundAmount,
        totalRefundedAmount: order.refundedAmount,
        isFullyRefunded,
        isFullyCanceled,
        refundedTickets: ticketIds,
        refundedUpgrades: upgradeIds,
      });

    try {
      await this.proxy.broadcast.orderRefunded(orderRefundedNotification);
    } catch (e) {
      this.logger.error(`refundOrder - error: ${e.message}`);
      span.setTag("error", true);
      span.log({ errors: e.message });
    }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: refundedBy },
      event: "ORDER_REFUNDED",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
        isFullyCanceled: isFullyCanceled,
        refundAmount: refundAmount,
        ticketCount: ticketIds.length,
        upgradeCount: upgradeIds.length,
      },
    });

    span.finish();
    return response;
  };


  public cancelOrder = async (
    request: pb.CancelOrderRequest
  ): Promise<pb.CancelOrderResponse> => {
    const span = tracer.startSpan("cancelOrder", request.spanContext);
    const response: pb.CancelOrderResponse = pb.CancelOrderResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      orderId: Joi.string().required(),
      ticketIds: Joi.array().items(Joi.string()).default([]),
      upgradeIds: Joi.array().items(Joi.string()).default([]),
      cancelReason: Joi.optional(),
      eventType: Joi.optional(),
      requestorId: Joi.optional()
    });

    const params = schema.validate(request);

    let promo = null;
    // let discountPromo = null;
    let ticketTypeIds = [];
    let upgradeTypeIds = [];
    if (params.error) {
      this.logger.error(`cancelOrder - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    let {
      orgId,
      orderId,
      ticketIds,
      upgradeIds,
      cancelReason,
      eventType,
      requestorId
    } = params.value;

    eventType = eventType == "WithoutRefund" ? false : true;
    /**
     * Get the order
     */
    let order: IOrder;
    try {
      order = await this.storage.findById(span, orderId);
    } catch (e) {
      this.logger.error(`cancelOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Make sure the order hasn't already been cancelled
     */
    if (order.state === OrderStateEnum.Canceled) {
      this.logger.error(`cancelOrder - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "This order has already been canceled.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const eventId = order.eventId;
    let seatingChartKey = false;
    let findEventByIdResponse = pb.FindEventByIdResponse.create({});
    if (eventId) {
      // get event Data
      const findEventByIdRequest = pb.FindEventByIdRequest.create({
        spanContext: span.context().toString(),
        eventId: eventId,
      });

      try {
        findEventByIdResponse = await this.proxy.eventService.findEventById(
          findEventByIdRequest
        );
        if (findEventByIdResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            "Failed to fetch event. Please try again or contact support."
          );
        }
      } catch (e) {
        this.logger.error(`Refund Getting Event - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message:
              "Failed to Refund order. Please try again or contact support.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      const { event } = findEventByIdResponse;
      // Event has seatingChartKey then check for its data from seatio
      seatingChartKey = event.seatingChartKey || false;
    }
    /***************** */

    let seats = [];
    order.tickets = await Promise.all(
      order?.tickets?.map((ticket) => {
        if (
          ticket?.refund?.refunded == false &&
          // ticketIds.includes(ticket._id.toString()) &&
          (ticket?.state == OrderItemStateEnum.Active ||
            ticket?.state == OrderItemStateEnum.Canceled)
        ) {
          ticket.state = OrderItemStateEnum.Canceled;
          // refundAmountTotal += ticket.price + (ticket.price * tax) / 100;
          if (eventType == true) {
            // ticket.refund = {
            //   refunded: true,
            //   refundedAt: Time.now(),
            //   refundedBy,
            //   refundedAmount: ticket.price + (ticket.price * tax) / 100,
            //   refundReason: refundReason,
            // };
            ticketTypeIds.push(ticket?.ticketTypeId);
            // event has seatingChartKey then extract tickets with seat
            if (seatingChartKey) {
              if (ticket?.seat) {
                seats.push(ticket?.seat);
              }
            }
          }
          return ticket;
        }
        return ticket;
      })
    );



    order.upgrades = await Promise.all(
      order.upgrades.map((upgrade) => {
        if (
          upgrade.refund.refunded == false &&
          // ticketIds.includes(ticket._id.toString()) &&
          (upgrade.state == OrderItemStateEnum.Active ||
            upgrade.state == OrderItemStateEnum.Canceled)
        ) {
          upgrade.state = OrderItemStateEnum.Canceled;
          if (eventType == true) {
            upgradeTypeIds.push(upgrade.upgradeId);
          }
          return upgrade;
        }
        return upgrade;
      })
    );
    // }

    //Cancel all upgrades on order
    order.upgrades = await Promise.all(
      order.upgrades.map((upgrade) => {
        if (upgrade.state == OrderItemStateEnum.Active) {
          upgrade.state = OrderItemStateEnum.Canceled;
          return upgrade;
        }
        return upgrade;
      })
    );

    order.cancelReason = cancelReason;
    order.state = OrderStateEnum.Canceled;

    try {
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`cancelOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // Release or free tickets which is occupied on cancel
    if (seatingChartKey && seats.length > 0) {
      const releaseSeatsRequest = pb.ReleaseSeatsRequest.create({
        spanContext: span.context().toString(),
        orgId,
        eventId,
        seats,
      });

      try {
        await this.proxy.seatingService.releaseSeats(releaseSeatsRequest);
      } catch (e) {
        this.logger.error(`cancelOrder Seating Error - error: ${e.message}`);
        span.setTag("error", true);
        span.log({ errors: e.message });
      }
    }

    /**
     * Free the Refunded ticket and upgrades for re ordering
     */

    const requestEvent = pb.CancelTicketRequest.create({
      spanContext: span.context().toString(),
      orgId,
      eventId: order.eventId,
      ticketTypeId: ticketTypeIds,
      upgradesTypeId: upgradeTypeIds,
      promotionCode: promo,
      discountCode: order?.discountCode || null,
      // discountCode: discountPromo
    });

    await this.proxy.eventService.cancelTicket(requestEvent);

    /**
     * Send refund email
     */

    const sendCancelEmail = async () => {
      const span1 = tracer.startSpan("cancelOrder.sendCancelEmail", span);
      const sendOrderRefundEmailRequest = pb.SendOrderRefundEmailRequest.create(
        {
          spanContext: span.context().toString(),
          orderId: order._id.toString(),
          ticketIds,
          upgradeIds,
        }
      );

      try {
        // const res = await this.proxy.orderService.sendOrderRefundEmail(sendOrderRefundEmailRequest);
        const res = await this.proxy.orderService.resendOrderRefundEmail(
          sendOrderRefundEmailRequest
        );
        this.logger.info(res);
      } catch (e) {
        this.logger.error(`cancelOrder - orderId: ${order._id}: ${e.message}`);
        span1.setTag("error", true);
        span1.log({ errors: e.message });
        span1.finish();
      }
    };
    sendCancelEmail();

    /**
     * Broadcast order refund
     */

    const isFullyCanceled = !(
      order.tickets.filter(
        (ticket) => ticket.state !== OrderItemStateEnum.Canceled
      ).length > 0
    );

    // const orderCancelNotification =
    //   pb.Broadcast.orderCancelNotification.create({
    //     spanContext: span.context().toString(),
    //     order: pb.Order.fromObject(order),
    //     orgId: order.orgId,
    //     userId: order.userId,
    //     orderId: orderId.toString(),
    //     eventId: order.eventId,
    //     artistIds: order.artistIds,
    //     venueIds: order.venueIds,
    //     isFullyCanceled,
    //     canceledTickets: ticketIds,
    //     canceledUpgrades: upgradeIds,
    //   });

    // try {
    //   await this.proxy.broadcast.orderCanceled(orderCancelNotification);
    // } catch (e) {
    //   this.logger.error(`cancelOrder - error: ${e.message}`);
    //   span.setTag("error", true);
    //   span.log({ errors: e.message });
    // }

    // Track
    this.segment.track({
      ...(order.userId != null && order.userId != '') && { userId: order.userId },
      ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
      event: "ORDER_REFUNDED",
      properties: {
        orderId: order._id,
        orgId: order.orgId,
        eventId: order.eventId,
        isFullyCanceled: isFullyCanceled,
        ticketCount: ticketIds.length,
        upgradeCount: upgradeIds.length,
      },
    });

    span.finish();
    return response;
  };

  public sendOrderRefundEmail = async (
    request: pb.SendOrderRefundEmailRequest
  ): Promise<pb.SendOrderRefundEmailResponse> => {
    const span = tracer.startSpan("sendRefundEmail", request.spanContext);
    const response: pb.SendOrderRefundEmailResponse =
      pb.SendOrderRefundEmailResponse.create();
    /**
     * Validate Request Paramaters
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `sendOrderRefundEmail - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId } = params.value;

    let orderEntities: IOrderEntities;
    try {
      orderEntities = await this.orderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`sendOrderRefundEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let {
      order,
      organization,
      user,
      event,
      venues: [venue],
    } = orderEntities;
    const { address } = organization;
    const address1 = `${address.address1} ${address.address2}`;
    const address2 = `${address.city}, ${address.state} ${address.zip}`;

    const performanceSchedules = event.performances.reduce(
      (cur, next) => {
        if (next.schedule.length == 1) {
          cur.doorsAt.push(next.schedule[0].doorsAt);
          cur.startsAt.push(next.schedule[0].startsAt);
          cur.endsAt.push(next.schedule[0].endsAt);
        } else {
          next.schedule.map((sdl) => {
            cur.doorsAt.push(sdl.doorsAt);
            cur.startsAt.push(sdl.startsAt);
            cur.endsAt.push(sdl.endsAt);
          });
        }
        return cur;
      },
      {
        doorsAt: [],
        startsAt: [],
        endsAt: [],
      }
    );

    const venuePosterImageUrl = venue.imageUrls[0];
    const venueAddress1 = `${venue.address.address1} ${venue.address.address2}`;
    const venueAddress2 = `${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
    const timezone =
      venue && venue.address && venue.address.timezone
        ? venue.address.timezone
        : "America/Denver";
    const doorsAt = Math.min(...performanceSchedules.doorsAt);
    const startsAt = Math.min(...performanceSchedules.startsAt);
    const qrCodeAt = EventUtil.qrCodeEmailAt(event);
    const cityState = `${venue.address.city}, ${venue.address.state}`;
    let orderSubtotalRefunded = 0;
    let rsvpOrderSubTotalRefund = 0;
    const orderTotalRefunded = `$${Price.output(order.refundedAmount, true, true)}`;
    // calculate line item refunds
    const refundedTickets = order.tickets
      .filter((ticket) => ticket.refund.refunded)
      .reduce((cur, next) => {
        orderSubtotalRefunded += next.refund.refundedAmount;
        next.values = Number(next.values);
        rsvpOrderSubTotalRefund += Number(next.values);
        if (cur.hasOwnProperty(next.ticketTypeId)) {
          cur[next.ticketTypeId].count++;
          cur[next.ticketTypeId].description = next.description;
          cur[next.ticketTypeId].dayIds = next.dayIds;
          cur[next.ticketTypeId].refundedAmount += next.refund.refundedAmount;
          cur[next.ticketTypeId].values += Number(next.values);
        } else {
          cur[next.ticketTypeId] = {
            description: next.description,
            dayIds: next.dayIds,
            values: Number(next.values),
            typeId: next.ticketTypeId,
            name: next.name,
            refundedAmount: next.refund.refundedAmount,
            count: 1,
          };
        }
        return cur;
      }, {});
    const refundedUpgrades = order.upgrades
      .filter((upgrade) => upgrade.refund.refunded)
      .reduce((cur, next) => {
        orderSubtotalRefunded += next.refund.refundedAmount;
        if (cur.hasOwnProperty(next.upgradeId)) {
          cur[next.upgradeId].count++;
          cur[next.upgradeId].refundedAmount += next.refund.refundedAmount;
        } else {
          cur[next.upgradeId] = {
            typeId: next.upgradeId,
            name: next.name,
            refundedAmount: next.refund.refundedAmount,
            count: 1,
          };
        }
        return cur;
      }, {});

    const ticketItems = Object.keys(refundedTickets).map(
      (k) => refundedTickets[k]
    );
    const upgradeItems = Object.keys(refundedUpgrades).map(
      (k) => refundedUpgrades[k]
    );
    let dayIds = [];
    let dayIdsTime = [];
    let dayIdsTimeCalendar = [];
    const ticketRefundItems = ticketItems.map((item) => {
      let orderItem: any = {
        description: item.description,
        name: `${item.count} x ${item.name}`,
        refundedAmount: `$${Price.output(item.refundedAmount, true, true)}`,
        values: `$${Price.output(item.values, true, true)}`,
      };
      const timeZone = address?.timezone ? address?.timezone : "America/Denver";

      const days = item.dayIds
        .map((day) =>
          Time.format(day, "MMM Do", timeZone).replace("Section", "")
        )
        .filter(Boolean)
        .join(", ");

      if (
        event.performances[0].schedule &&
        event.performances[0].schedule.length > 0
      ) {
        if (days) orderItem.days = days;
      }

      dayIds = item.dayIds.filter((day) => !dayIds.includes(day));

      const perfomancesArray = performanceSchedules.startsAt.map(
        (date, index) => {
          return {
            startsAt: date,
            endsAt: performanceSchedules.endsAt[index],
            doorsAt: performanceSchedules.doorsAt[index],
          };
        }
      );

      dayIdsTime = perfomancesArray.filter(
        (start, index) => !dayIds.includes(start.startsAt)
      );

      dayIdsTimeCalendar = perfomancesArray.filter((start, index) =>
        item.dayIds.includes(start.startsAt.toString())
      );

      if (dayIds.length == 0) {
        dayIdsTimeCalendar.push({
          startsAt: performanceSchedules.startsAt[0],
          endsAt: performanceSchedules.endsAt[0],
          doorsAt: performanceSchedules.doorsAt[0],
        });
      }
      // const seats = item.seats.map(seat => seat.replace('Section', '')).filter(Boolean).join(', ');
      // if (seats) orderItem.seats = seats;
      // ticketValue = ticketValue + parseInt(item.values);
      // sub += item.price
      return orderItem;
    });
    const upgradeRefundItems = upgradeItems.map((item) => {
      return {
        name: `${item.count} x ${item.name}`,
        refundedAmount: `$${Price.output(item.refundedAmount, true, true)}`,
      };
    });

    const orderRefundItems = [...ticketRefundItems, ...upgradeRefundItems];
    let orderFeesRefunded = `$${Price.output(
      order.refundedAmount - orderSubtotalRefunded, true, true)}`;
    // let orderFeesRefunded  = order.type === OrderTypeEnum.RSVP ? `$${Price.output(rsvpOrderSubTotalRefund).toFixed(2)}`:`$${Price.output(order.refundedAmount - orderSubtotalRefunded).toFixed(2)}`
    orderSubtotalRefunded =
      order.type === OrderTypeEnum.RSVP
        ? rsvpOrderSubTotalRefund
        : orderSubtotalRefunded;

    const orderSummary = await this.orderSummary(span, order, order.fees, false);
    let salesTaxFeeValue = `$${Price.output((orderSummary.salesTaxFee as number), true, true)}`;
    let promoterFeeValue = `$${Price.output(((orderSummary.promoterFee as number)), true, true)}`;
    let processingFeeValue = `$${Price.output(
      (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number), true, true
    )}`;

    promoterFeeValue = order?.promoterFee?.refund?.refunded ? promoterFeeValue : "$0.00";
    processingFeeValue = order?.processingFee?.refund?.refunded ? processingFeeValue : "$0.00";
    salesTaxFeeValue = order?.promoterFee?.refund?.refunded ? salesTaxFeeValue : "$0.00";
    if (order.refundedAmount > 0) {
      const sendOrderRefundEmailRequest =
        pb.QueueOrderRefundEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: user.email,
          firstName: user.firstName || "Guest",
          eventName: event.name,
          orgName: organization.orgName,
          eventSubtitle: event.subtitle,
          venueName: venue.name,
          eventDate: Time.format(
            event.schedule.startsAt,
            "ddd, MMM Do",
            timezone
          ),
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
          confirmationCode: order._id.toString(),
          orgEmail: organization.email,
          orgPhoneNumber: organization.phoneNumber,
          orgAddress1: address1,
          orgAddress2: address2,
          eventPosterImageUrl: event.posterImageUrl,
          cityState,
          orgLogoUrl: organization.orgLogoUrl,
          venuePosterImageUrl,
          venueAddress1,
          venueAddress2,
          isRSVP: order.type === OrderTypeEnum.RSVP,
          orderRefundItems,
          orderSubtotalRefunded: `$${Price.output(
            orderSubtotalRefunded
            , true, true)}`,
          orderFeesRefunded,
          orderTotalRefunded,
          refundReason: order.refundReason,
          dayIdsTime,
          dayIdsTimeCalendar,
          ticketDeliveryType: event.ticketDeliveryType,
          physicalDeliveryInstructions: event.physicalDeliveryInstructions,
          timezone,
          promoterFee: promoterFeeValue,
          processingFee: processingFeeValue,
          tax: salesTaxFeeValue
        });

      try {
        await this.proxy.emailService.queueOrderRefundEmail(
          sendOrderRefundEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderRefundEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    } else {
      const sendOrderCanceledEmailRequest =
        pb.QueueOrderCanceledEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: user.email,
          firstName: user.firstName,
          eventName: event.name,
          orgName: organization.orgName,
          eventSubtitle: event.subtitle,
          venueName: venue.name,
          eventDate: Time.format(
            event.schedule.startsAt,
            "ddd, MMM Do",
            timezone
          ),
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
          confirmationCode: order._id.toString(),
          orgEmail: organization.email,
          orgPhoneNumber: organization.phoneNumber,
          orgAddress1: address1,
          orgAddress2: address2,
          eventPosterImageUrl: event.posterImageUrl,
          cityState,
          orgLogoUrl: organization.orgLogoUrl,
          venuePosterImageUrl,
          venueAddress1,
          venueAddress2,
          isRSVP: order.type === OrderTypeEnum.RSVP,
          orderRefundItems,
          orderSubtotalRefunded: `$${Price.output(
            orderSubtotalRefunded, true, true
          )}`,
          orderFeesRefunded,
          orderTotalRefunded,
          refundReason: order.refundReason,
          dayIdsTime,
          dayIdsTimeCalendar,
          timezone
        });
      try {
        await this.proxy.emailService.queueOrderCanceledEmail(
          sendOrderCanceledEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderCanceledEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    span.finish();
    return response;
  };

  public resendOrderRefundEmail = async (
    request: pb.SendOrderRefundEmailRequest
  ): Promise<pb.SendOrderRefundEmailResponse> => {
    const span = tracer.startSpan("sendRefundEmail", request.spanContext);
    const response: pb.SendOrderRefundEmailResponse =
      pb.SendOrderRefundEmailResponse.create();
    /**
     * Validate Request Paramaters
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
      ticketIds: Joi.array().items(Joi.string()).default([]),
      upgradeIds: Joi.array().items(Joi.string()).default([]),
      processingFee: Joi.boolean().optional(),
      promoterFee: Joi.boolean().optional()
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `sendOrderRefundEmail - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId, upgradeIds, ticketIds, processingFee, promoterFee } = params.value;
    let orderEntities: IOrderEntities;
    try {
      orderEntities = await this.orderEntities(span, orderId);
    } catch (e) {
      this.logger.error(`sendOrderRefundEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let {
      order,
      organization,
      user,
      event,
      venues: [venue],
    } = orderEntities;

    const orderSummary = await this.orderSummary(span, order, order.fees, false);
    let salesTaxFeeValue = `$${Price.output((orderSummary.salesTaxFee as number), true, true)}`;
    let promoterFeeValue = `$${Price.output(((orderSummary.promoterFee as number)), true, true)}`;
    let processingFeeValue = `$${Price.output(
      (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number), true, true
    )}`;


    const { address } = organization;
    const address1 = `${address.address1} ${address.address2}`;
    const address2 = `${address.city}, ${address.state} ${address.zip}`;

    const performanceSchedules = event.performances.reduce(
      (cur, next) => {
        if (next.schedule.length == 1) {
          cur.doorsAt.push(next.schedule[0].doorsAt);
          cur.startsAt.push(next.schedule[0].startsAt);
          cur.endsAt.push(next.schedule[0].endsAt);
        } else {
          next.schedule.map((sdl) => {
            cur.doorsAt.push(sdl.doorsAt);
            cur.startsAt.push(sdl.startsAt);
            cur.endsAt.push(sdl.endsAt);
          });
        }
        return cur;
      },
      {
        doorsAt: [],
        startsAt: [],
        endsAt: [],
      }
    );
    const venuePosterImageUrl = venue.imageUrls[0];
    const venueAddress1 = `${venue.address.address1} ${venue.address.address2}`;
    const venueAddress2 = `${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
    const timezone =
      venue && venue.address && venue.address.timezone
        ? venue.address.timezone
        : "America/Denver";
    const doorsAt = Math.min(...performanceSchedules.doorsAt);
    const startsAt = Math.min(...performanceSchedules.startsAt);
    const qrCodeAt = EventUtil.qrCodeEmailAt(event);
    const cityState = `${venue.address.city}, ${venue.address.state}`;
    let orderSubtotalRefunded = 0;
    let rsvpOrderSubTotalRefund = 0;
    let orderTotalRefund = 0;

    // const orderTotalRefunded = `$${Price.output(order.refundedAmount).toFixed(2)}`;
    // calculate line item refunds

    let dayIds = [];
    let dayIdsTime = [];
    let dayIdsTimeCalendar = [];
    const perfomancesArray = performanceSchedules.startsAt.map(
      (date, index) => {
        return {
          startsAt: date,
          endsAt: performanceSchedules.endsAt[index],
          doorsAt: performanceSchedules.doorsAt[index],
        };
      }
    );
    dayIdsTime = perfomancesArray.filter(
      (start, index) => !dayIds.includes(start.startsAt)
    );
    const timeZone = address?.timezone ? address?.timezone : "America/Denver";
    order.tickets.map((item) => {
      const days = item.dayIds
        .map((day) =>
          Time.format(day, "MMM Do", timeZone).replace("Section", "")
        )
        .filter(Boolean)
        .join(", ");
      if (
        event.performances[0].schedule &&
        event.performances[0].schedule.length > 0
      ) {
        if (days) item.days = days;
        dayIds = item.dayIds.filter((day) => !dayIds.includes(day));
        dayIdsTimeCalendar = perfomancesArray.filter((start, index) =>
          item.dayIds.includes(start.startsAt.toString())
        );
        if (dayIds.length == 0) {
          dayIdsTimeCalendar.push({
            startsAt: performanceSchedules.startsAt[0],
            endsAt: performanceSchedules.endsAt[0],
            doorsAt: performanceSchedules.doorsAt[0],
          });
        }
      }
    });

    let refundedTickets;
    if (ticketIds) {
      refundedTickets = order.tickets
        .filter(
          (ticket) =>
            ticket.refund.refunded && ticketIds.includes(ticket._id.toString())
        )
        .reduce((cur, next) => {
          // orderTotalRefund += next.refund.refundedAmount;
          // orderSubtotalRefunded += next.refund.refundedAmount;
          next.values = Number(next.values);
          rsvpOrderSubTotalRefund += Number(next.values);
          if (cur.hasOwnProperty(next.ticketTypeId)) {
            cur[next.ticketTypeId].count++;
            cur[next.ticketTypeId].description = next.description;
            cur[next.ticketTypeId].refundedAmount += next.refund.refundedAmount;
            cur[next.ticketTypeId].values += Number(next.values);
            cur[next.ticketTypeId].dayIds = next.dayIds;
          } else {
            cur[next.ticketTypeId] = {
              description: next.description,
              values: Number(next.values),
              typeId: next.ticketTypeId,
              name: next.name,
              refundedAmount: next.refund.refundedAmount,
              count: 1,
              dayIds: next.dayIds,
            };
          }
          return cur;
        }, {});
    }

    let refundedUpgrades;
    if (upgradeIds) {
      refundedUpgrades = order.upgrades
        .filter(
          (upgrade) =>
            upgrade.refund.refunded &&
            upgradeIds.includes(upgrade._id.toString())
        )
        .reduce((cur, next) => {
          // orderTotalRefund += next.refund.refundedAmount;
          // orderSubtotalRefunded += next.refund.refundedAmount;
          if (cur.hasOwnProperty(next.upgradeId)) {
            cur[next.upgradeId].count++;
            cur[next.upgradeId].refundedAmount += next.refund.refundedAmount;
          } else {
            cur[next.upgradeId] = {
              typeId: next.upgradeId,
              name: next.name,
              refundedAmount: next.refund.refundedAmount,
              count: 1,
            };
          }
          return cur;
        }, {});
    }

    const ticketItems = Object.keys(refundedTickets).map(
      (k) => refundedTickets[k]
    );
    const upgradeItems = Object.keys(refundedUpgrades).map(
      (k) => refundedUpgrades[k]
    );


    // let promotionsCode = [];
    // let seatingChartKey = false;
    const discountAmount = order?.discountAmount;
    let subtotal = OrderUtil.orderSubtotal(order);
    let discountCode = order?.discountCode;
    let promotionsCode = event?.promotions.filter((promo) => promo.code?.toLowerCase() === discountCode?.toLowerCase());



    const ticketRefundItems = ticketItems.map((item) => {


      if (promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {
        let perTicketDiscount = (discountAmount / subtotal) * item.refundedAmount;
        let ticketPrice = item.refundedAmount - perTicketDiscount;
        item.refundedAmount = ticketPrice;
      }

      orderSubtotalRefunded += item.refundedAmount;

      // refundAmountTotal += ticketPrice;


      const days = item.dayIds
        .map((day) =>
          Time.format(day, "MMM Do", timeZone).replace("Section", "")
        )
        .filter(Boolean)
        .join(", ");
      return {
        description: item.description,
        name: `${item.count} x ${item.name}`,
        refundedAmount: `$${Price.output(item.refundedAmount, true, true)}`,
        values: `$${Price.output(item.values, true, true)}`,
        days,
      };
    });
    const upgradeRefundItems = upgradeItems.map((item) => {

      if (promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {
        let perTicketDiscount = (discountAmount / subtotal) * item.refundedAmount;
        let ticketPrice = item.refundedAmount - perTicketDiscount;
        item.refundedAmount = ticketPrice;
      }

      orderSubtotalRefunded += item.refundedAmount;

      return {
        name: `${item.count} x ${item.name}`,
        refundedAmount: `$${Price.output(item.refundedAmount, true, true)}`,
      };
    });
    const orderRefundItems = [...ticketRefundItems, ...upgradeRefundItems];
    let orderFeesRefunded;
    let totalFee = 0;

    if (promoterFee) {
      totalFee = (orderSummary.promoterFee as number) + (orderSummary.salesTaxFee as number);
    }
    if (processingFee) {
      totalFee += (orderSummary.selloutFee as number) + (orderSummary.stripeFee as number);
    }

    promoterFeeValue = promoterFee ? promoterFeeValue : "$0.00";
    processingFeeValue = processingFee ? processingFeeValue : "$0.00";
    salesTaxFeeValue = promoterFee ? salesTaxFeeValue : "$0.00";


    // let orderFeesRefunded = `$${Price.output(orderSubtotalRefunded).toFixed(2)}`;
    if (processingFee || promoterFee) {
      // orderTotalRefund =
      //   (order.type === OrderTypeEnum.RSVP
      //     ? rsvpOrderSubTotalRefund
      //     : orderSubtotalRefunded) + order.processingFee.refund.refundedAmount;

      orderFeesRefunded = `$${Price.output(
        order.processingFee.refund.refundedAmount, true, true
      )}`;

      orderTotalRefund =
        (order.type === OrderTypeEnum.RSVP
          ? rsvpOrderSubTotalRefund
          : orderSubtotalRefunded) + totalFee;
      orderFeesRefunded = `$${Price.output(totalFee, true, true
      )}`;
    } else {
      orderTotalRefund =
        order.type === OrderTypeEnum.RSVP
          ? rsvpOrderSubTotalRefund
          : orderSubtotalRefunded;
      orderFeesRefunded = `$0.00`;
    }
    const orderTotalRefunded = `$${Price.output(orderTotalRefund, true, true)}`;

    // let orderFeesRefunded  = order.type === OrderTypeEnum.RSVP ? `$${Price.output(rsvpOrderSubTotalRefund).toFixed(2)}`:`$${Price.output(order.refundedAmount - orderSubtotalRefunded).toFixed(2)}`
    orderSubtotalRefunded =
      order.type === OrderTypeEnum.RSVP
        ? rsvpOrderSubTotalRefund
        : orderSubtotalRefunded;
    if (order.refundedAmount > 0) {
      const sendOrderRefundEmailRequest =
        pb.QueueOrderRefundEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: user.email || order.email,
          firstName: user.firstName || "Guest",
          eventName: event.name,
          orgName: organization.orgName,
          eventSubtitle: event.subtitle,
          venueName: venue.name,
          eventDate: Time.format(
            event.schedule.startsAt,
            "ddd, MMM Do",
            timezone
          ),
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          // showAt: Time.formatTimeOfDay(startsAt, timezone),
          qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
          confirmationCode: order._id.toString(),
          orgEmail: organization.email,
          orgPhoneNumber: organization.phoneNumber,
          orgAddress1: address1,
          orgAddress2: address2,
          eventPosterImageUrl: event.posterImageUrl,
          cityState,
          orgLogoUrl: organization.orgLogoUrl,
          venuePosterImageUrl,
          venueAddress1,
          venueAddress2,
          isRSVP: order.type === OrderTypeEnum.RSVP,
          orderRefundItems,
          orderSubtotalRefunded: `$${Price.output(
            orderSubtotalRefunded, true, true
          )}`,
          orderFeesRefunded,
          orderTotalRefunded,
          refundReason: order.refundReason,
          dayIdsTime,
          dayIdsTimeCalendar,
          timezone,
          promoterFee: promoterFeeValue,
          processingFee: processingFeeValue,
          tax: salesTaxFeeValue,
          // ticketDeliveryType: event.ticketDeliveryType,
          // physicalDeliveryInstructions: event.physicalDeliveryInstructions
        });

      try {
        await this.proxy.emailService.queueOrderRefundEmail(
          sendOrderRefundEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderRefundEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    } else {
      const sendOrderCanceledEmailRequest =
        pb.QueueOrderCanceledEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: user.email || order.email,
          firstName: user.firstName || "Guest",
          eventName: event.name,
          orgName: organization.orgName,
          eventSubtitle: event.subtitle,
          venueName: venue.name,
          eventDate: Time.format(
            event.schedule.startsAt,
            "ddd, MMM Do",
            timezone
          ),
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          qrCodeAt: Time.format(qrCodeAt, "ddd, MMM Do [at] h:mma", timezone),
          confirmationCode: order._id.toString(),
          orgEmail: organization.email,
          orgPhoneNumber: organization.phoneNumber,
          orgAddress1: address1,
          orgAddress2: address2,
          eventPosterImageUrl: event.posterImageUrl,
          cityState,
          orgLogoUrl: organization.orgLogoUrl,
          venuePosterImageUrl,
          venueAddress1,
          venueAddress2,
          isRSVP: order.type === OrderTypeEnum.RSVP,
          orderRefundItems,
          orderSubtotalRefunded: `$${Price.output(
            orderSubtotalRefunded
            , true, true)}`,
          orderFeesRefunded,
          orderTotalRefunded,
          refundReason: order.refundReason,
          dayIdsTime,
          dayIdsTimeCalendar,
          timezone,
          promoterFee: promoterFeeValue,
          processingFee: processingFeeValue
        });
      try {
        await this.proxy.emailService.queueOrderCanceledEmail(
          sendOrderCanceledEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`sendOrderCanceledEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    span.finish();
    return response;
  };

  public refundEventOrders = async (
    request: pb.RefundEventOrdersRequest
  ): Promise<pb.RefundEventOrdersResponse> => {
    const span = tracer.startSpan("refundOrder", request.spanContext);
    const response: pb.RefundEventOrdersResponse =
      pb.RefundEventOrdersResponse.create();

    const params = Joi.object()
      .keys({
        spanContext: Joi.string().required(),
        orgId: Joi.string().required(),
        eventId: Joi.string().required(),
        refundedBy: Joi.string().required(),
        dryRun: Joi.boolean().required(),
        refundReason: Joi.optional(),
        eventType: Joi.optional(),
      })
      .validate(request);

    if (params.error) {
      this.logger.error(
        `refundEventOrders - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId, refundedBy, dryRun, refundReason, eventType } =
      params.value;

    const query = {
      orgId,
      eventIds: [eventId],
    };

    let orders: IOrder[];

    try {
      orders = await this.storage.queryOrders(span, query, null);
    } catch (e) {
      this.logger.error(`refundEventOrders - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const summaries = await Promise.all(
      orders.map(async (order): Promise<IOrderSummary> => {
        try {
          /**
           * List the fees
           */
          const listFeesRequest = new pb.ListFeesByIdRequest.create({
            spanContext: span.context().toString(),
            orgId: order.orgId,
            feeIds: order.feeIds,
          });
          let listFeesResponse: pb.ListEventFeesResponse;
          try {
            listFeesResponse = await this.proxy.feeService.listFeesById(
              listFeesRequest
            );
            if (listFeesResponse.status !== pb.StatusCode.OK) {
              throw new Error("Failed to fetch order fees.");
            }
          } catch (e) {
            this.logger.error(`refundEventOrders - error: ${e.message}`);
            console.error(e);
          }

          const { fees } = listFeesResponse;

          /**
           * Get the partial summary
           */
          return await this.orderSummary(span, order, fees, false);
        } catch (e) {
          console.error("THERE WAS AN ERROR");
          console.error(e);
        }
      })
    );
    const results = summaries
      .filter((summary) => Boolean(summary))
      .reduce(
        (cur, summary: IOrderSummary) => {
          const processingFee =
            (summary.selloutFee as number) + (summary.stripeFee as number)
          if (summary.state === OrderStateEnum.Active) {
            cur.refundAmount += summary.total as number;
            cur.feeAmount += processingFee;
          }

          if (summary.state === OrderStateEnum.PartiallyRefunded) {
            const refundAmount = summary.orderTotalWithRefund as number;

            cur.refundAmount += refundAmount;

            if (refundAmount >= processingFee) {
              cur.feeAmount += processingFee;
            } else {
              cur.feeAmount += refundAmount;
            }
          }

          return cur;
        },
        { refundAmount: 0, feeAmount: 0 }
      );

    response.refundCount = orders.reduce(
      (cur: number, next: IOrder) =>
        next.state === OrderStateEnum.Active ? cur + 1 : cur,
      0
    );
    response.refundAmount = results.refundAmount;
    response.feeAmount = results.feeAmount;
    response.dryRun = dryRun;

    if (dryRun) {
      response.allRefunded = false;
      response.status = pb.StatusCode.OK;
      span.finish();
      return response;
    }
    //       return true
    try {
      const spanContext = span.context().toString();

      await Promise.all(
        orders.map(async (order): Promise<pb.RefundOrderResponse> => {
          try {
            if (order.state != OrderStateEnum.Refunded) {
              let ticket = [];
              for (let tickets of order.tickets) {
                if (tickets.refund.refunded == false) {
                  ticket.push(tickets._id);
                }
              }
              let upgrade = [];
              for (let upgrades of order.upgrades) {
                if (upgrades.refund.refunded == false) {
                  upgrade.push(upgrades._id);
                }
              }
              const request = pb.RefundOrderRequest.create({
                spanContext,
                orgId,
                refundReason: refundReason ? refundReason : "Event Cancelled",
                orderId: order._id.toString(),
                refundedBy,
                ticketIds: ticket,
                processingFee: true,
                promoterFee: true,
                upgradeIds: upgrade,
                eventType: eventType,
              });
              return this.proxy.orderService.refundOrder(request);
            }
          } catch (e) {
            this.logger.error(`refundEventOrders - error: ${e.message}`);
            span.setTag("error", true);
            span.log({ errors: e.message });
            throw e;
          }
        })
      );
      const requestEvent = pb.CancelEventRequest.create({
        spanContext,
        orgId,
        eventId,
      });
      await this.proxy.eventService.cancelEvent(requestEvent);
    } catch (e) {
      this.logger.error(`refundEventOrders - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    response.allRefunded = true;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public generateOrderReport = async (
    request: pb.GenerateOrderReportRequest
  ): Promise<pb.GenerateOrderReportResponse> => {
    const span = tracer.startSpan("generateOrderReport", request.spanContext);
    const response: pb.GenerateOrderReportResponse =
      pb.GenerateOrderReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      userId: Joi.string().required(),
      query: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `generateOrderReport - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { orgId, query } = params.value;

    query.orgId = orgId;
    if (query.userQuery && query.userQuery.length > 0) {
      const request = pb.QueryUserProfilesRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          ...query,
          name: query.userQuery,
          any: true,
        },
      });

      let response: pb.QueryUserProfilesResponse;

      try {
        response = await this.proxy.userProfileService.queryUserProfiles(
          request
        );

        if (response.status !== pb.StatusCode.OK) {
          throw new Error("Unable to query user profiles");
        }

        const { userProfiles } = response;
        query.userIds = userProfiles.map(({ userId }) => userId);
      } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }
    query.event = query.eventIds ? true : false;
    query.season = query.seasonIds ? true : false;
    if (query.userQuery && query.userQuery.length > 0 && query.eventIds) {
      const request = pb.QueryEventsRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          ...query,
          name: query.userQuery,
          eventIds: query.eventIds,
          any: true,
        },
      });
      let response: pb.QueryEventsResponse;
      try {
        response = await this.proxy.eventService.queryEvents(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new Error("Unable to query user profiles");
        }

        const { events } = response;
        query.eventIds = events.map(({ _id }) => _id);
      } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    if (query.userQuery && query.userQuery.length > 0 && query.seasonIds) {
      const request = pb.QuerySeasonsRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          ...query,
          name: query.userQuery,
          seasonIds: query.seasonIds,
          any: true,
        },
      });
      let response: pb.QuerySeasonsResponse;

      try {
        response = await this.proxy.seasonService.querySeasons(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new Error("Unable to query user profiles");
        }

        const { seasons } = response;
        query.seasonIds = seasons.map(({ _id }) => _id);
      } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    let orders: IOrder[];
    try {
      orders = await this.storage.queryOrders(span, query);
    } catch (e) {
      this.logger.error(`generateOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    if (orders.length > 500) {
      this.emailTotalEOrderReport(request);
      this.logger.error(
        `generateOrderReport - error: ${"Your export has been scheduled and will be emailed to you when it is complete."}`
      );
      response.status = pb.StatusCode.OK;
      response.message =
        "Your export has been scheduled and will be emailed to you when it is complete.";
      // response.errors = [pb.Error.create({
      //    key: 'Error',
      //    message: 'Your export has been scheduled and will be emailed to you when it is complete.',
      // })];
      span.setTag("error", true);
      span.log({
        errors:
          "Your export has been scheduled and will be emailed to you when it is complete.",
      });
      span.finish();
      return response;
    } else {
      const orderItemNames = [];
      let summaries: any[];
      try {
        // return true;
        summaries = await Promise.all(
          orders.map(async (order): Promise<any> => {
            try {
              order.tickets.map((item: any) => {
                if (item.scan.length == 0) {
                  item.scan = [{
                    scanned: false,
                    scannedAt: "",
                    scannedBy: "",
                    startsAt: ""
                  }]
                }
                if (!Array.isArray(item.scan)) {
                  item.scan
                  item.scan = [item.scan]
                }
                return item
              })
              order.upgrades.map((item: any) => {
                if (item.scan.length == 0) {
                  item.scan = [{
                    scanned: false,
                    scannedAt: "",
                    scannedBy: "",
                    startsAt: ""
                  }]
                }
                if (!Array.isArray(item.scan)) {
                  item.scan = [item.scan]
                }
                return item
              })


              /**
               * List the fees
               */
              // const listFeesRequest = new pb.ListFeesByIdRequest.create({
              //   spanContext: span.context().toString(),
              //   orgId: order.orgId,
              //   feeIds: order.feeIds,
              // });

              // let listFeesResponse: pb.ListEventFeesResponse;
              // try {
              //   listFeesResponse = await this.proxy.feeService.listFeesById(
              //     listFeesRequest
              //   );
              //   if (listFeesResponse.status !== pb.StatusCode.OK) {
              //     throw new Error("Failed to fetch order fees.");
              //   }
              // } catch (e) {
              //   this.logger.error(`generateOrderReport - error: ${e.message}`);
              //   console.error(e);
              // }

              order.state =
                order?.type == OrderTypeEnum.RSVP &&
                  order?.state == OrderStateEnum.Refunded
                  ? OrderStateEnum.Canceled
                  : order?.state;
              const { fees } = order;

              /**
               * Get the full summary
               */

              let venue;
              const summary = await this.orderSummary(span, order, fees, true);
              const orderId = order._id;
              const listVenueRequest = new pb.ListEventFeesRequest.create({
                spanContext: span.context().toString(),
                venueId: order.venueIds[0],
              });
              try {
                venue = await this.proxy.venueService.findVenueById(
                  listVenueRequest
                );
              } catch (e) {
                // errorSpan(span, e);
                throw e;
              }
              const timezone = venue?.venue?.address?.timezone || "America/Denver";

              /**
               * Organization tickets by name
               */
              let ticketsValue = 0;
              const tickets = summary && summary?.tickets?.reduce((cur, next) => {
                if (next?.values) {
                  ticketsValue += parseInt(next?.values);
                }
                const name = `${next?.name} Ticket`;
                // track csv column names for tickets
                orderItemNames.push(name + " Sold");
                orderItemNames.push(name + " Refunded");
                orderItemNames.push(name + " Net");
                cur[name + " Sold"] = next?.count;
                cur[name + " Refunded"] = next?.refund;
                cur[name + " Net"] = next?.count - next?.refund;
                return cur;
              }, {});

              /**
               * Organization upgrades by name
               */
              const upgrades = summary && summary?.upgrades?.reduce((cur, next) => {
                const name = `${next?.name} Upgrade`;
                // track csv column names for upgrades
                orderItemNames.push(name);
                cur[name] = next?.count;
                return cur;
              }, {});

              /**
               * A little clean up
               */
              let refund = (Price.output(
                (summary?.total as any) - (summary?.orderTotalWithRefund as any)
              )).toFixed(2) || 0;
              // let netAmount = Math.round(order?.payments[0]?.amount - order.refundedAmount as number ) ;
              // console.log(netAmount);
              let netAmount = (Price.output(
                (order?.payments[0]?.amount as number || 0) - (order?.refundedAmount as number || 0)
              )).toFixed(2) || 0;
              // let net = (Price.output(summary?.orderTotalWithRefund as number)).toFixed(2) || 0;
              let net = (netAmount)

              if (summary) {
                summary.ticketsValue =
                  ticketsValue == 0 ? 0 : Price.output(ticketsValue as number) || 0;
                // let items = summary.totalTickets + summary.totalUpgrades
                if (order.userId === null || order.userId === '') {
                  summary.userFirstName = "Guest"
                  summary.userEmail = order.email
                  summary.userPhoneNumber = "N/A"
                }
                summary.venueName = summary && summary?.venueNames[0];
                summary.createdAt = Time.format(summary && summary?.createdAt, "MM/DD/YYYY, h:mma", timezone) + "(" + timezone + ")" || 0;
                // summary.total = (Price.output(summary && summary?.total as number)).toFixed(2) || 0;
                summary.total = (Price.output(order?.payments[0]?.amount as number)).toFixed(2) || 0;
                // order?.payments[0]?.amount
                summary.scannedCount = ((summary && summary?.scannedOrderItemsCount as number)) || 0
                summary.subtotal = Price.output(summary && summary?.subtotal as number) || 0;
                summary.selloutFee = Price.output(summary && summary?.selloutFee as number) || 0;
                summary.stripeFee = Price.output(summary && summary?.stripeFee as number) || 0;
                // summary.guestFees = Price.output(summary && summary.guestFees as number);
                summary.promoterFee = ((Price.output(summary && summary?.promoterFee as number)) + (Price.output(summary && summary?.salesTaxFee as number)));
                summary.ticketsValues = Price.output(
                  summary?.promoterFee as number
                ) || 0;
                // summary.
              }

              let customFields = [];
              if (order?.customFields && order?.customFields?.length) {
                customFields = order?.customFields?.reduce(
                  (cur, customField): any => {
                    // track csv column names for custom fields
                    orderItemNames.push(customField?.label);
                    cur[customField?.label] = customField?.value;
                    return cur;
                  },
                  {}
                );
              }

              /**
               * Combine and return
               */
              return {
                orderId,
                refund,
                net,
                // items,
                ...summary,
                ...tickets,
                ...upgrades,
                ...customFields,
              };
            } catch (e) {
              console.error("There was an error generating an order summary.");
              throw e;
            }
          })
        );
      } catch (e) {
        this.logger.error(`generateOrderReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
      let csv;
      try {
        csv = await CSV.fromJson(
          [
            "orderId",
            "createdAt",
            "userFirstName",
            "userLastName",
            "userEmail",
            "userPhoneNumber",
            "eventName",
            "venueName",
            "state",
            "subtotal",
            "selloutFee",
            "stripeFee",
            // "guestFees",
            "total",
            "refund",
            "net",
            "promoterFee",
            "ticketsValue",
            "scannedCount",
            ...[...new Set(orderItemNames)],
          ],
          summaries
        );
      } catch (e) {
        this.logger.error(`generateOrderReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      const file = {
        file: Buffer.from(csv, "utf8"),
        filename: "order-report.csv",
        mimetype: "text/csv",
        encoding: "utf8",
      };

      const uploadFileRequest = pb.UploadFileRequest.create({
        spanContext: span.context().toString(),
        orgId,
        files: [file],
      });

      let uploadFileResponse: pb.UploadFileResponse;

      try {
        uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
          uploadFileRequest
        );
      } catch (e) {
        this.logger.error(`generateOrderReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      const { url } = uploadFileResponse.files[0];

      response.url = url;
      span.finish();
      response.status = pb.StatusCode.OK;

      return response;
    }
  };

  public generateActivityReport = async (
    request: pb.GenerateOrderReportRequest
  ): Promise<pb.GenerateOrderReportResponse> => {
    const span = tracer.startSpan("generateActivityReport", request.spanContext);
    const response: pb.GenerateOrderReportResponse =
      pb.GenerateOrderReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      userId: Joi.string().required(),
      query: Joi.any().optional(),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `generateActivityReport - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, spanContext, query } = params.value;

    let orders;
    try {
      orders = await this.storage.orderActivity(spanContext, orgId, query);

      await Promise.all(orders.map(async (order): Promise<any> => {
        let refundedorder = order?.refundedAmount ? (Price.output(order?.refundedAmount as number).toFixed(2)) : 0;
        order.refundedTicketsCount = order?.refundedTickets?.length;
        order.ticketCount = order?.tickets?.length;
        order.upgradeCount = order?.upgrades?.length;
        if (order.userId === null || order.userId === '') {
          order.firstName = "Guest"
        } else {
          order.firstName = order?.user?.firstName;
          order.lastName = order?.user?.lastName;
        }

        let discountCode = order?.discountCode
        let subtotal = OrderUtil.orderSubtotal(order);
        let promotionsCode = order?.event.promotions.filter((promo) => promo?.code?.toLowerCase() === discountCode?.toLowerCase());
        let count = 0
        if (promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {
          order.tickets.map(ticket => {
            let perTicketDiscount = (order?.discountAmount / subtotal) * ticket.price;
            count = perTicketDiscount + count
            let ticketsTotalDiscount = order?.totalTicketsPrice - count
            order.ticketsTotal = ticketsTotalDiscount ? (Price.output(ticketsTotalDiscount as number, true, true)) : 0;
          })
        }
        else {

          order.ticketsTotal = order?.totalTicketsPrice ? (Price.output(order?.totalTicketsPrice as number, true)) : 0;
        }

        let upcount = 0
        if (promotionsCode.length != 0 && promotionsCode[0].appliesTo === EventPromotionAppliesToEnum.PerOrder) {
          order.upgrades.map(upgrade => {
            let perTicketDiscount = (order?.discountAmount / subtotal) * upgrade.price;
            upcount = perTicketDiscount + upcount
            let upgradeTotalDiscount = order?.totalupgradesPrice - upcount
            order.upgradesTotal = upgradeTotalDiscount ? (Price.output(upgradeTotalDiscount as number, true, true)) : 0;
          })

        }
        else {
          order.upgradesTotal = order?.totalupgradesPrice ? (Price.output(order?.totalupgradesPrice as number, true)) : 0;
        }

        // order.ticketsTotal = order?.totalTicketsPrice ? (Price.output(order?.totalTicketsPrice as number, true)) : 0;
        order.refundedAmount = refundedorder;
        // order.upgradesTotal = order?.totalupgradesPrice ? (Price.output(order?.totalupgradesPrice as number, true)) : 0;
        order.saleRefund = order?.state;
        order.type = order?.type;
        if (order?.payments[0]?.paymentMethodType) {
          order.cashCredit = order?.payments[0]?.paymentMethodType;
        }
        const timezone =
          order?.venue && order?.venue.address && order?.venue?.address?.timezone
            ? order?.venue?.address?.timezone
            : "America/Denver";
        let ticketRefund;
        let upgradeRefund;
        let promoterFeeRefund;
        let processingFeeRefund;
        ticketRefund = order?.latestRefundedTickets && order?.latestRefundedTickets.refund.refundedAt && order?.latestRefundedTickets.refund.refundedAt ? order?.latestRefundedTickets.refund.refundedAt : 0;
        upgradeRefund = order?.latestRefundedUpgrades && order?.latestRefundedUpgrades.refund.refundedAt && order?.latestRefundedUpgrades.refund.refundedAt ? order?.latestRefundedUpgrades.refund.refundedAt : 0;
        promoterFeeRefund = order?.promoterFee?.refund?.refundedAt || 0;
        processingFeeRefund = order?.processingFee?.refund?.refundedAt || 0;
        if (order?.refundedTickets?.length != 0 || order?.refundedUpgrades?.length != 0) {
          if (ticketRefund < upgradeRefund) {
            order.refundedDay = Time.format(upgradeRefund, "MM/DD/YYYY, h:mma", timezone);
          }
          if (ticketRefund > upgradeRefund) {
            order.refundedDay = Time.format(ticketRefund, "MM/DD/YYYY, h:mma", timezone);
          }
          if (ticketRefund === upgradeRefund) {
            order.refundedDay = Time.format(ticketRefund, "MM/DD/YYYY, h:mma", timezone);
          }
        }
        if (order?.promoterFee?.refund?.refunded === true || order?.processingFee?.refund?.refunded === true) {
          if (promoterFeeRefund < processingFeeRefund) {
            order.refundedDay = Time.format(processingFeeRefund, "MM/DD/YYYY, h:mma", timezone);
          }
          if (promoterFeeRefund > processingFeeRefund) {
            order.refundedDay = Time.format(promoterFeeRefund, "MM/DD/YYYY, h:mma", timezone);
          }
        }
        order?.tickets?.map((item: any) => {
          if (item?.scan?.length == 0) {
            item.scan = [{
              scanned: false,
              scannedAt: "",
              scannedBy: "",
              startsAt: ""
            }]
          }
          if (!Array.isArray(item.scan)) {
            item?.scan
            item.scan = [item.scan]
          }
          return item
        })

        const summary = await this.orderSummary(span, order, order.fees, true);
        order.date = Time.format(order?.createdAt, "MM/DD/YYYY, h:mma", timezone) + "(" + timezone + ")";
        order.total = (((order && order.payments[0]?.amount ? (Price.output(order && order.payments[0]?.amount).toFixed(2)) : 0) - (refundedorder))).toFixed(2);
        // order.total = (Price.output(order?.payments[0]?.amount as number)).toFixed(2) || 0;
        order.selloutFee = summary && summary.selloutFee ? Price.output(summary && summary?.selloutFee as number, true) : 0;
        order.stripeFee = summary && summary.stripeFee ? Price.output(summary && summary?.stripeFee as number, true) : 0;
        order.promoterFee = summary && summary.promoterFee ? Price.output(summary && summary?.promoterFee as number, true) : 0;
        order.salesTax = summary && summary.salesTaxFee ? Price.output(summary && summary?.salesTaxFee as number, true) : 0;
        return order;
      }));
      let csv;
      const fields = [
        {
          label: 'Date',
          value: 'date'
        },

        {
          label: 'First Name',
          value: 'firstName'
        },
        {
          label: 'Last Name',
          value: 'lastName'
        },
        {
          label: 'Event',
          value: 'eventName'
        },
        {
          label: 'Type',
          value: 'type'
        },
        {
          label: 'Sale/Refund/Cancel',
          value: 'saleRefund'
        },
        {
          label: 'Cash/Credit/Check',
          value: 'cashCredit'
        },
        {
          label: 'Number of Tickets',
          value: 'ticketCount'
        },
        {
          label: 'Ticket Total',
          value: 'ticketsTotal'
        },
        {
          label: 'Number of Upgrades',
          value: 'upgradeCount'
        },
        {
          label: 'Upgrade Total',
          value: 'upgradesTotal'
        },
        {
          label: 'Promoter Fee',
          value: 'promoterFee'
        },
        {
          label: 'Sales Tax',
          value: 'salesTax'
        },
        {
          label: 'Sellout Fee',
          value: 'selloutFee'
        },
        {
          label: 'Stripe Fee',
          value: 'stripeFee'
        },
        {
          label: 'Refunded Amt.',
          value: 'refundedAmount'
        },
        {
          label: 'Refunded Day',
          value: 'refundedDay'
        },
        {
          label: 'Refunded Tickets',
          value: 'refundedTicketsCount'
        },
        {
          label: 'Total',
          value: 'total'
        },

      ]
      try {
        csv = await CSV.fromJson(fields,
          orders
        );
      } catch (e) {
        this.logger.error(`generateActivityReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      const file = {
        file: Buffer.from(csv, "utf8"),
        filename: "order-report.csv",
        mimetype: "text/csv",
        encoding: "utf8",
      };

      const uploadFileRequest = pb.UploadFileRequest.create({
        spanContext: span.context().toString(),
        orgId,
        files: [file],
      });

      let uploadFileResponse: pb.UploadFileResponse;

      try {
        uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
          uploadFileRequest
        );
      } catch (e) {
        this.logger.error(`generateActivityReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      const { url } = uploadFileResponse.files[0];

      response.url = url;
      response.status = pb.StatusCode.OK;
      // orders.map((order) => {
      //   if (order.payments && order.payments[0] && order.payments[0].amount) {
      //     order.payments[0].amount = parseFloat((Math.round((order.payments[0].amount))).toFixed(2)) || 0;
      //   }
      //   if (order.refundedAmount) {
      //     order.refundedAmount = parseFloat((Math.round((order.refundedAmount))).toFixed(2)) || 0;
      //   }
      // });
      // response.orders = orders
      // response.orders = orders.map((order) => pb.Order.fromObject(order));
    } catch (e) {

      this.logger.error(`generateActivityReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };


  public emailTotalEOrderReport = async (
    request: any
  ): Promise<pb.GenerateOrderReportResponse> => {
    const span = tracer.startSpan("emailTotalEOrderReport", request.spanContext);
    const response: pb.GenerateOrderReportResponse =
      pb.GenerateOrderReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      userId: Joi.string().required(),
      query: Joi.any().optional(),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `emailTotalEOrderReport - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query, userId } = params.value;

    query.orgId = orgId;

    let orders: IOrder[];
    /*
     * Find the org
     */
    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId: orgId,
    });

    let findOrgResponse: pb.FindOrganizationResponse;

    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(
        findOrgRequest
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      throw new Error(`Failed to fetch order organization: ${e.message}`);
    }

    const { organization } = findOrgResponse;

    /*
     * Find the user
     */

    const findUserRequest = pb.FindUserByIdRequest.create({
      spanContext: span.context().toString(),
      userId: userId,
    });

    let findUserResponse: pb.FindUserByIdResponse;

    try {
      findUserResponse = await this.proxy.userService.findUserById(
        findUserRequest
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      throw new Error(`Failed to fetch order user: ${e.message}`);
    }

    const { user } = findUserResponse;
    try {
      orders = await this.storage.queryOrders(span, query, undefined);
      for (let order of orders) {
        order.tickets.map((item: any) => {
          if (item.scan.length == 0) {
            item.scan = [{
              scanned: false,
              scannedAt: "",
              scannedBy: "",
              startsAt: ""
            }]
          }
          if (!Array.isArray(item.scan)) {
            item.scan
            item.scan = [item.scan]
          }
          return item
        })
        order.upgrades.map((item: any) => {
          if (item.scan.length == 0) {
            item.scan = [{
              scanned: false,
              scannedAt: "",
              scannedBy: "",
              startsAt: ""
            }]
          }
          if (!Array.isArray(item.scan)) {
            item.scan = [item.scan]
          }
          return item
        })
      }
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    const orderItemNames = [];
    let summaries: any[];
    try {
      // return true;
      summaries = await Promise.all(
        orders.map(async (order): Promise<any> => {
          try {
            /**
             * List the fees
             */
            // const listFeesRequest = new pb.ListFeesByIdRequest.create({
            //   spanContext: span.context().toString(),
            //   orgId: order.orgId,
            //   feeIds: order.feeIds,
            // });

            // let listFeesResponse: pb.ListEventFeesResponse;
            // try {
            //   listFeesResponse = await this.proxy.feeService.listFeesById(
            //     listFeesRequest
            //   );
            //   if (listFeesResponse.status !== pb.StatusCode.OK) {
            //     throw new Error("Failed to fetch order fees.");
            //   }
            // } catch (e) {
            //   this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
            //   console.error(e);
            // }

            order.state =
              order.type == OrderTypeEnum.RSVP &&
                order.state == OrderStateEnum.Refunded
                ? OrderStateEnum.Canceled
                : order.state;
            const { fees } = order;

            /**
             * Get the full summary
             */
            const summary = await this.orderSummary(span, order, fees, true);
            const orderId = order._id;
            /**
             * Organization tickets by name
             */
            const tickets = summary.tickets.reduce((cur, next) => {
              const name = `${next.name} Ticket`;
              // track csv column names for tickets
              orderItemNames.push(name + " Sold");
              orderItemNames.push(name + " Refunded");
              orderItemNames.push(name + " Net");
              cur[name + " Sold"] = next.count;
              cur[name + " Refunded"] = next.refund;
              cur[name + " Net"] = next.count - next.refund;
              return cur;
            }, {});

            /**
             * Organization upgrades by name
             */
            const upgrades = summary.upgrades.reduce((cur, next) => {
              const name = `${next.name} Upgrade`;
              // track csv column names for upgrades
              orderItemNames.push(name);
              cur[name] = next.count;
              return cur;
            }, {});

            /**
             * A little clean up
             */
            let refund = (Price.output(
              (summary.total as any) - (summary.orderTotalWithRefund as any)
            )).toFixed(2) || 0;

            let net = (Price.output(summary.total as number)).toFixed(2) || 0;
            // let items = summary.totalTickets + summary.totalUpgrades
            summary.venueName = summary.venueNames[0];
            summary.createdAt = Time.format(summary.createdAt);
            summary.total = (Price.output(summary.total as number)).toFixed(2) || 0;
            summary.subtotal = Price.output(summary.subtotal as number);
            summary.selloutFee = Price.output(summary.selloutFee as number);
            summary.stripeFee = Price.output(summary.stripeFee as number);
            summary.promoterFee = Price.output(summary.promoterFee as number);

            let customFields = [];
            if (order.customFields && order.customFields.length) {
              customFields = order.customFields.reduce(
                (cur, customField): any => {
                  // track csv column names for custom fields
                  orderItemNames.push(customField.label);
                  cur[customField.label] = customField.value;
                  return cur;
                },
                {}
              );
            }

            /**
             * Combine and return
             */
            return {
              orderId,
              refund,
              net,
              // items,
              ...summary,
              ...tickets,
              ...upgrades,
              ...customFields,
            };
          } catch (e) {
            console.error("There was an error generating an order summary.");
            throw e;
          }
        })
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let csv;
    try {
      csv = await CSV.fromJson(
        [
          "orderId",
          "createdAt",
          "userFirstName",
          "userLastName",
          "userEmail",
          "userPhoneNumber",
          "eventName",
          "venueName",
          "state",
          "subtotal",
          "selloutFee",
          "stripeFee",
          "total",
          "refund",
          "net",
          "promoterFee",
          ...[...new Set(orderItemNames)],
        ],
        summaries
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const file = {
      file: Buffer.from(csv, "utf8"),
      filename: "order-report.csv",
      mimetype: "text/csv",
      encoding: "utf8",
    };

    const uploadFileRequest = pb.UploadFileRequest.create({
      spanContext: span.context().toString(),
      orgId,
      files: [file],
    });

    let uploadFileResponse: pb.UploadFileResponse;

    try {
      uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
        uploadFileRequest
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { url } = uploadFileResponse.files[0];
    // user.email = 'pooja.sabharwal@ditstek.com'
    await this.proxy.emailService.orderSheetEmail({
      toAddress: user.email,
      orgName: organization.orgName,
      url: url,
    });
    response.url = url;
    span.finish();
    return response;
  };

  public generateTotalEOrderReport = async (
    request: pb.GenerateOrderReportRequest
  ): Promise<pb.GenerateOrderReportResponse> => {
    const span = tracer.startSpan(
      "generateTotalEOrderReport",
      request.spanContext
    );
    const response: pb.GenerateOrderReportResponse =
      pb.GenerateOrderReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      query: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `generateTotalEOrderReport - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query } = params.value;

    query.orgId = orgId;

    let orders: IOrder[];
    try {
      orders = await this.storage.queryOrders(span, query, undefined);
    } catch (e) {
      this.logger.error(`generateOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const orderItemNames = [];
    let summaries: IOrderSummary[];
    try {
      summaries = await Promise.all(
        orders.map(async (order): Promise<IOrderSummary> => {
          try {
            /**
             * List the fees
             */
            const listFeesRequest = new pb.ListFeesByIdRequest.create({
              spanContext: span.context().toString(),
              orgId: order.orgId,
              feeIds: order.feeIds,
            });

            let listFeesResponse: pb.ListEventFeesResponse;
            try {
              listFeesResponse = await this.proxy.feeService.listFeesById(
                listFeesRequest
              );
              if (listFeesResponse.status !== pb.StatusCode.OK) {
                throw new Error("Failed to fetch order fees.");
              }
            } catch (e) {
              this.logger.error(
                `generateTotalEOrderReport - error: ${e.message}`
              );
              console.error(e);
            }

            const { fees } = listFeesResponse;

            /**
             * Get the full summary
             */
            const summary = await this.orderSummary(span, order, fees, true);

            /**
             * Organization tickets by name
             */
            const tickets = summary.tickets.reduce((cur, next) => {
              const name = `${next.name} Ticket`;
              // track csv column names for tickets
              orderItemNames.push(name);
              cur[name] = next.count;
              return cur;
            }, {});

            /**
             * Organization upgrades by name
             */
            const upgrades = summary.upgrades.reduce((cur, next) => {
              const name = `${next.name} Upgrade`;
              // track csv column names for upgrades
              orderItemNames.push(name);
              cur[name] = next.count;
              return cur;
            }, {});

            /**
             * A little clean up
             */
            summary.venueName = summary.venueNames[0];
            summary.createdAt = Time.format(summary.createdAt);
            summary.total = Price.output(summary.total as number);
            summary.subtotal = Price.output(summary.subtotal as number);
            summary.selloutFee = Price.output(summary.selloutFee as number);
            summary.stripeFee = Price.output(summary.stripeFee as number);
            summary.promoterFee = Price.output(summary.promoterFee as number);

            let customFields = [];
            if (order.customFields && order.customFields.length) {
              customFields = order.customFields.reduce(
                (cur, customField): any => {
                  // track csv column names for custom fields
                  orderItemNames.push(customField.label);
                  cur[customField.label] = customField.value;
                  return cur;
                },
                {}
              );
            }

            /**
             * Combine and return
             */
            return {
              ...summary,
              ...tickets,
              ...upgrades,
              ...customFields,
            };
          } catch (e) {
            console.error("There was an error generating an order summary.");
            throw e;
          }
        })
      );
    } catch (e) {
      this.logger.error(`generateTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const totalESummaries = [];

    summaries.forEach((summary) => {
      // if (summary.state !== 'Active') return;
      const getSummary = (packageQty, scannedQty) => {
        return {
          CreatedDate: summary.createdAt,
          UserFirstName: summary.userFirstName,
          UserLastName: summary.userLastName,
          UserEmail: summary.userEmail,
          UserPhoneNumber: summary.userPhoneNumber,
          EventName: summary.eventName,
          PackageName: summary.eventName,
          Qty: packageQty,
          ScannedQty: scannedQty,
          "YC MemberNumber": summary["Member Number"]
            ? summary["Member Number"].replace(/^0+/, "")
            : "",
        };
      };

      summary.tickets.forEach((ticket) => {
        totalESummaries.push(getSummary(ticket.count, ticket.scannedCount));
      });
    });

    let csv;
    try {
      csv = await CSV.fromJson(
        [
          "CreatedDate",
          "UserFirstName",
          "UserLastName",
          "UserEmail",
          "UserPhoneNumber",
          "EventName",
          "PackageName",
          "Qty",
          "ScannedQty",
          "YC MemberNumber",
        ],
        totalESummaries
      );
    } catch (e) {
      this.logger.error(`generateTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const file = {
      file: Buffer.from(csv, "utf8"),
      filename: "order-report.csv",
      mimetype: "text/csv",
      encoding: "utf8",
    };

    const uploadFileRequest = pb.UploadFileRequest.create({
      spanContext: span.context().toString(),
      orgId,
      files: [file],
    });

    let uploadFileResponse: pb.UploadFileResponse;

    try {
      uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
        uploadFileRequest
      );
    } catch (e) {
      this.logger.error(`generateTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { url } = uploadFileResponse.files[0];

    response.url = url;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public queryOrders = async (
    request: pb.QueryOrdersRequest
  ): Promise<pb.QueryOrdersResponse> => {
    const span = tracer.startSpan("queryOrders", request.spanContext);
    const response: pb.QueryOrdersResponse = pb.QueryOrdersResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    // this.logger.error(`READ ME Query${request}`)
    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryOrders - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query, pagination } = params.value;

    if (orgId) {
      query.orgId = orgId;
    }

    if (query.userQuery && query.userQuery.length > 0) {
      const request = pb.QueryUserProfilesRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          ...query,
          name: query.userQuery,
          any: true,
        },
      });

      let response: pb.QueryUserProfilesResponse;

      try {
        response = await this.proxy.userProfileService.queryUserProfiles(
          request
        );

        if (response.status !== pb.StatusCode.OK) {
          throw new Error("Unable to query user profiles");
        }

        const { userProfiles } = response;
        query.userIds = userProfiles.map(({ userId }) => userId);
      } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    query.event = query.eventIds ? true : false;
    query.season = query.seasonIds ? true : false;

    if (query.userQuery && query.userQuery.length > 0 && query.eventIds) {
      const request = pb.QueryEventsRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          ...query,
          name: query.userQuery,
          eventIds: query.eventIds,
          any: true,
        },
      });
      let response: pb.QueryEventsResponse;

      try {
        response = await this.proxy.eventService.queryEvents(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new Error("Unable to query user profiles");
        }

        const { events } = response;
        query.eventIds = events.map(({ _id }) => _id);
      } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }
    if (query.userQuery && query.userQuery.length > 0 && query.seasonIds) {
      const request = pb.QuerySeasonsRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          ...query,
          name: query.userQuery,
          seasonIds: query.seasonIds,
          any: true,
        },
      });
      let response: pb.QuerySeasonsResponse;

      try {
        response = await this.proxy.seasonService.querySeasons(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new Error("Unable to query user profiles");
        }

        const { seasons } = response;
        query.seasonIds = seasons.map(({ _id }) => _id);
      } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    // querySeasons

    let orders: any;
    try {
      orders = await this.storage.queryOrders(span, query, pagination);
      response.status = pb.StatusCode.OK;
      // orders.map((order) => {
      //   if (order.payments && order.payments[0] && order.payments[0].amount) {
      //     order.payments[0].amount = parseFloat((Math.round((order.payments[0].amount))).toFixed(2)) || 0;
      //   }
      //   if (order.refundedAmount) {
      //     order.refundedAmount = parseFloat((Math.round((order.refundedAmount))).toFixed(2)) || 0;
      //   }
      // });
      // response.orders = orders
      // response.orders = orders.map((order) => pb.Order.fromObject(order));


      for (let index = 0; index < orders.length; index++) {
        const order = orders[index];
        order.tickets.map((item: any) => {
          if (item.scan.length == 0) {
            item.scan = [{
              scanned: false,
              scannedAt: "",
              scannedBy: "",
              startsAt: ""
            }]
          }
          if (!Array.isArray(item.scan)) {
            item.scan
            item.scan = [item.scan]
          }
          return item
        })
        // order.upgrades.map((item: any) => {
        //   if (item.scan.length == 0) {
        //     item.scan = [{
        //       scanned: false,
        //       scannedAt: "",
        //       scannedBy: "",
        //       startsAt: ""
        //     }]
        //   }
        //   if (!Array.isArray(item.scan)) {
        //     item.scan = [item.scan]
        //   }
        //   return item
        // })

        if (order.fees)
          order.fees = order?.fees.map(item => ({ ...item, amount: Number(item.amount || 0) }))
        if (order.payments && order.payments[0] && order.payments[0].amount) {
          order.payments[0].amount = parseFloat((Math.round((order.payments[0].amount))).toFixed(2)) || 0;
        }
        if (order.refundedAmount) {
          order.refundedAmount = order.refundedAmount ? parseFloat((Math.round((order.refundedAmount))).toFixed(2)) : 0;
        }
      }
      response.orders = orders.map((order) => pb.Order.fromObject(order));

    } catch (e) {

      this.logger.error(`queryOrders - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public ordersChargeUpdate = async (
    request: pb.OrdersChargeUpdateRequest
  ): Promise<String> => {
    const span = tracer.startSpan("ordersChargeUpdate", request.spanContext);
    const response: pb.OrdersChargeUpdateResponse =
      pb.OrdersChargeUpdateResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
    });

    // this.logger.error(`READ ME Query${request}`)
    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `ordersChargeUpdate - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let orders: IOrder[];
    try {
      let order = await this.storage.OrdersforCharge(span);
      response.status = pb.StatusCode.OK;
      orders = order.map((order) => pb.Order.fromObject(order));
    } catch (e) {
      this.logger.error(`ordersChargeUpdate - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      response.message = "hello";
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    try {
      for (let val of orders) {
        if (
          val.payments &&
          val.payments.length > 0 &&
          val.payments[0].paymentIntentId
        ) {
          const stripeRequest = pb.RetrieveStripeChargeByIntentsRequest.create({
            spanContext: span.context().toString(),
            orgId: val.orgId,
            stripeIntentId: val.payments[0].paymentIntentId,
          });
          let striperesponse: pb.RetrieveStripeChargeByIntentsResponse;
          striperesponse =
            await this.proxy.stripeService.retrieveStripeChargeByIntent(
              stripeRequest
            );
          if (striperesponse && striperesponse.stripeChargeId) {
            val.stripeChargeId = striperesponse.stripeChargeId;
            await this.storage.updateOneOrder(span, val);
          }
        }
      }
    } catch (e) {
      this.logger.error(`ordersChargeUpdate - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    response.status = pb.StatusCode.OK;
    response.message = "Updated";
    span.finish();
    return response;
  };

  public findOrderById = async (
    request: pb.FindOrderByIdRequest
  ): Promise<pb.FindOrderByIdResponse> => {
    const span = tracer.startSpan("findOrderById", request.spanContext);
    const response: pb.FindOrderByIdResponse =
      pb.FindOrderByIdResponse.create();

    let order: IOrder;
    try {
      order = await this.storage.findById(span, request.orderId);

      response.status = pb.StatusCode.OK;
      // response.order = order ? pb.Order.fromObject(order) : null;

      if (order.payments && order.payments[0] && order.payments[0].amount) {
        order.payments[0].amount = parseFloat((Math.round((order.payments[0].amount))).toFixed(2)) || 0;
      }

      if (order.refundedAmount) {
        order.refundedAmount = parseFloat((Math.round((order.refundedAmount))).toFixed(2)) || 0;
      }

      // let summary = await this.orderSummary(span, order, order.fees, true);
      // order.promoterFee.amount = ((summary && summary.promoterFee ? summary && summary?.promoterFee as number : 0) + (summary && summary.salesTaxFee ? summary && summary?.salesTaxFee as number : 0));
      // order.promoterFee.refund = 
      response.order = order ? order : null;
    } catch (e) {
      this.logger.error(`findOrderById - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public eventOrderCount = async (
    request: pb.FindOrderByEventIdRequest
  ): Promise<any> => {
    const span = tracer.startSpan("findOrderByEventId", request.spanContext);
    const response: any = pb.FindOrderByEventIdResponse.create();

    let order;
    try {
      order = await this.storage.eventOrderCount(span, request.eventId);
      response.status = pb.StatusCode.OK;
      response.eventOrderCount = order;
    } catch (e) {
      this.logger.error(`findOrderByEventId - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public findOrderByEventId = async (
    request: pb.FindOrderByEventIdRequest
  ): Promise<pb.FindOrderByEventIdResponse> => {
    const span = tracer.startSpan("findOrderByEventId", request.spanContext);
    const response: pb.FindOrderByEventIdResponse =
      pb.FindOrderByEventIdResponse.create();

    let order;
    try {
      order = await this.storage.findOrderByEventId(span, request.eventId);


      response.status = pb.StatusCode.OK;
      response.eventId = order.eventId;
      response.ticketScanned = order.ticketScanned;
      response.ticketSold = order.ticketSold;
      response.ticketUnscanned = order.ticketUnscanned;
    } catch (e) {
      this.logger.error(`findOrderByEventId - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public findOrderByFeeId = async (
    request: pb.FindOrderByFeeIdRequest
  ): Promise<pb.FindOrderByIdResponse> => {
    const span = tracer.startSpan("findOrderByFeeId", request.spanContext);
    const response: pb.FindOrderByIdResponse =
      pb.FindOrderByIdResponse.create();

    let order: IOrder;
    try {
      order = await this.storage.findByFeeId(span, request.feeId);
      response.status = pb.StatusCode.OK;
      response.order = order ? pb.Order.fromObject(order) : null;
    } catch (e) {
      this.logger.error(`findOrderByFeeId - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public findOrderByEmail = async (
    request: pb.FindOrderByEmailRequest
  ): Promise<pb.FindOrderByEmailResponse> => {
    const span = tracer.startSpan("findOrderByEmail", request.spanContext);
    const response: pb.FindOrderByEmailResponse =
      pb.FindOrderByEmailResponse.create();

    let order: IOrder;
    try {
      order = await this.storage.findByEmail(span, request.email);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);
    } catch (e) {
      this.logger.error(`findOrderByEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public queryOrderAnalytics = async (
    request: pb.QueryOrderAnalyticsRequest
  ): Promise<pb.QueryOrderAnalyticsResponse> => {
    const span = tracer.startSpan("queryOrderAnalytics", request.spanContext);
    const response: pb.QueryOrdersResponse = pb.QueryOrdersResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      query: Joi.object().keys({
        eventId: Joi.string().optional(),
        seasonId: Joi.string().optional(),
        venueId: Joi.string().optional(),
        artistId: Joi.string().optional(),
        userId: Joi.string().optional(),
        startDate: Joi.number().optional(),
        endDate: Joi.number().optional(),
        interval: Joi.string().optional(),
        types: Joi.array().items(Joi.string()).default([]),
      }),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `queryOrderAnalytics - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const {
      orgId,
      query,
    }: {
      orgId: string;
      query: IAnalyticsQueryParams;
    } = params.value;
    let state = [
      OrderStateEnum.Active,
      OrderStateEnum.PartiallyRefunded,
      OrderStateEnum.Refunded,
    ];
    // if (query.eventId && query.eventId != null) {
    //   state = [];
    // }
    const orderQuery: IOrderQuery = {
      orgId,
      eventIds: [query.eventId],
      seasonIds: [query.seasonId],
      venueIds: [query.venueId],
      artistIds: [query.artistId],
      userIds: [query.userId],
      startDate: query.startDate,
      endDate: query.endDate,
      states: state,
    };
    let orders: IOrder[];
    let event: IEvent;
    let season: ISeason;
    try {
      let order = await this.storage.queryOrders(span, orderQuery);
      if (query.eventId && query.eventId.length) {
        const requestevent = pb.FindEventByIdRequest.create({
          spanContext: span.context().toString(),
          eventId: query.eventId,
        });
        let eventresponse: pb.FindEventByIdResponse;
        eventresponse = await this.proxy.eventService.findEventById(
          requestevent
        );
        event = eventresponse.event;
        order = order.map((order) => {
          order.tickets = order.tickets.filter(
            (ticket) =>
              ticket?.refund?.refunded == false ||
              (ticket?.refund?.refunded == true &&
                ticket.refund.refundedAt > event?.schedule.startsAt)
          );

          order.upgrades = order.upgrades.filter(
            (upgrade) =>
              upgrade?.refund?.refunded == false ||
              (upgrade?.refund?.refunded == true &&
                upgrade.refund.refundedAt > event?.schedule.startsAt)
          );
          return order;
        });
        orders = order.filter((order) => {
          return (
            order.processingFee?.refund?.refunded == false ||
            (order.processingFee?.refund?.refunded == true &&
              order.processingFee?.refund?.refundedAt > event?.schedule.startsAt)
          );
        });
      } else if (query.seasonId && query.seasonId.length) {
        const requestseason = pb.FindSeasonByIdRequest.create({
          spanContext: span.context().toString(),
          seasonId: query.seasonId,
        });

        let seasonResponse: pb.FindSeasonByIdResponse;
        seasonResponse = await this.proxy.seasonService.findSeasonById(
          requestseason
        );
        season = seasonResponse.season;
        order = order.map((order) => {
          order.tickets = order.tickets.filter(
            (ticket) =>
              ticket?.refund?.refunded == false ||
              (ticket?.refund?.refunded == true &&
                ticket?.refund?.refundedAt > season?.schedule.startsAt)
          );

          order.upgrades = order.upgrades.filter(
            (upgrade) =>
              upgrade?.refund?.refunded == false ||
              (upgrade?.refund?.refunded == true &&
                upgrade?.refund?.refundedAt > season?.schedule.startsAt)
          );
          return order;
        });
        orders = order.filter((order) => {
          return (
            order.processingFee?.refund?.refunded == false ||
            (order.processingFee?.refund?.refunded == true &&
              order.processingFee?.refund?.refundedAt > season?.schedule.startsAt)
          );
        });
      } else {
        order = order.map((order) => {
          order.tickets = order.tickets.filter(
            (ticket) => ticket?.refund?.refunded == false
          );

          order.upgrades = order.upgrades.filter(
            (upgrade) => upgrade?.refund?.refunded == false
          );
          return order;
        });
        orders = order.filter(
          (order) => order?.processingFee?.refund?.refunded == false
        );
      }
    } catch (e) {
      this.logger.error(`queryOrders - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { types, interval, startDate, endDate } = query;
    // @MikePollard if you see this, talk to me.
    const showSegments =
      !!query.seasonId || !!query.eventId || types.includes(AnalyticsTypeEnum.UserAnalytics); // granular data such as ticket types only needed on event


    const analytics: IAnalytics[] = types.map((type: AnalyticsTypeEnum) =>
      AnalyticsUtil.fromOrders(
        type,
        orders,
        showSegments,
        startDate,
        endDate,
        interval
      )
    );

    response.status = pb.StatusCode.OK;
    response.analytics = analytics.map((analytic) =>
      pb.Analytics.fromObject(analytic)
    );

    span.finish();
    return response;
  };

  /**
   * Breaks apart order by generating qr codes for each ticket and upgrade
   */

  public breakApartOrder = async (
    request: pb.BreakApartOrderRequest
  ): Promise<pb.BreakApartOrderResponse> => {
    const span = tracer.startSpan("breakApartOrder", request.spanContext);
    const response: pb.BreakApartOrderResponse =
      pb.BreakApartOrderResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `breakApartOrder - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId }: { orderId: string } = params.value;

    // Get the order
    let order: IOrder;
    try {
      order = await this.storage.findById(span, orderId);
    } catch (e) {
      this.logger.error(`breakApartOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let wasUpdated = false;

    if (!order.secretId) {
      order.secretId = uuid4() + uuid4();
    }

    // generate and upload qrCode data for tickets
    await Promise.all(
      order.tickets
        .filter((ticket) => ticket.state === OrderItemStateEnum.Active)
        .map(async (ticket) => {
          if (!ticket.qrCodeUrl) {
            try {
              wasUpdated = true;
              return (ticket.qrCodeUrl = await this.generateQRCodeAndUpload(
                span.context().toString(),
                order,
                ticket._id,
                OrderItemTypeEnum.Ticket
              ));
            } catch (e) {
              this.logger.error("FAILED TO GENERATE QR CODE");
              this.logger.error(`breakApartOrder - error: ${e.message}`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [
                pb.Error.create({
                  key: "Error",
                  message:
                    "Failed to generate order QR code. Please contact support.",
                }),
              ];
              span.setTag("error", true);
              span.log({ errors: e.message });
              span.finish();
              return response;
            }
          }
        })
    );

    // generate and upload qrCode data for upgrades
    await Promise.all(
      order.upgrades
        .filter((upgrade) => upgrade.state === OrderItemStateEnum.Active)
        .map(async (upgrade) => {
          if (!upgrade.qrCodeUrl) {
            try {
              wasUpdated = true;
              return (upgrade.qrCodeUrl = await this.generateQRCodeAndUpload(
                span.context().toString(),
                order,
                upgrade._id,
                OrderItemTypeEnum.Upgrade
              ));
            } catch (e) {
              this.logger.error("FAILED TO GENERATE QR CODE");
              this.logger.error(`breakApartOrder - error: ${e.message}`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [
                pb.Error.create({
                  key: "Error",
                  message:
                    "Failed to generate order QR code. Please contact support.",
                }),
              ];
              span.setTag("error", true);
              span.log({ errors: e.message });
              span.finish();
              return response;
            }
          }
        })
    );
    if (!order.printed) {
      order.printed = true;
      order = await this.storage.updateOneOrder(span, order);
    }
    // save data to order
    if (wasUpdated) {
      try {
        order = await this.storage.updateOneOrder(span, order);
      } catch (e) {
        this.logger.error(`breakApartOrder - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: "Failed to save order QR Code. Please contact support.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    response.status = pb.StatusCode.OK;
    response.order = order ? pb.Order.fromObject(order) : null;

    span.finish();
    return response;
  };
  public multipleBreakApartOrder = async (
    request: pb.MultipleBreakApartOrderRequest
  ): Promise<pb.MultipleBreakApartOrderResponse> => {
    const span = tracer.startSpan("multipleBreakApartOrder", request.spanContext);
    const response: pb.MultipleBreakApartOrderResponse =
      pb.MultipleBreakApartOrderResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.array().items(Joi.string()).default([]),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `multipleBreakApartOrder - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId }: { orderId: string } = params.value;

    // Get the order
    let orders: IOrder[];
    try {
      orders = await this.storage.findByMultipleId(span, orderId);
    } catch (e) {
      this.logger.error(`multipleBreakApartOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let wasUpdated = false;
    for (let order of orders) {
      if (!order.secretId) {
        order.secretId = uuid4() + uuid4();
      }

      // generate and upload qrCode data for tickets
      await Promise.all(
        order.tickets
          .filter((ticket) => ticket.state === OrderItemStateEnum.Active)
          .map(async (ticket) => {
            if (!ticket.qrCodeUrl) {
              try {
                wasUpdated = true;
                return (ticket.qrCodeUrl = await this.generateQRCodeAndUpload(
                  span.context().toString(),
                  order,
                  ticket._id,
                  OrderItemTypeEnum.Ticket
                ));
              } catch (e) {
                this.logger.error("FAILED TO GENERATE QR CODE");
                this.logger.error(`multipleBreakApartOrder - error: ${e.message}`);
                response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
                response.errors = [
                  pb.Error.create({
                    key: "Error",
                    message:
                      "Failed to generate order QR code. Please contact support.",
                  }),
                ];
                span.setTag("error", true);
                span.log({ errors: e.message });
                span.finish();
                return response;
              }
            }
          })
      );

      // generate and upload qrCode data for upgrades
      await Promise.all(
        order.upgrades
          .filter((upgrade) => upgrade.state === OrderItemStateEnum.Active)
          .map(async (upgrade) => {
            if (!upgrade.qrCodeUrl) {
              try {
                wasUpdated = true;
                return (upgrade.qrCodeUrl = await this.generateQRCodeAndUpload(
                  span.context().toString(),
                  order,
                  upgrade._id,
                  OrderItemTypeEnum.Upgrade
                ));
              } catch (e) {
                this.logger.error("FAILED TO GENERATE QR CODE");
                this.logger.error(`multipleBreakApartOrder - error: ${e.message}`);
                response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
                response.errors = [
                  pb.Error.create({
                    key: "Error",
                    message:
                      "Failed to generate order QR code. Please contact support.",
                  }),
                ];
                span.setTag("error", true);
                span.log({ errors: e.message });
                span.finish();
                return response;
              }
            }
          })
      );
      if (!order.printed) {
        order.printed = true;
        order = await this.storage.updateOneOrder(span, order);
      }
      // save data to order
      if (wasUpdated) {
        try {
          order = await this.storage.updateOneOrder(span, order);
        } catch (e) {
          this.logger.error(`multipleBreakApartOrder - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: "Failed to save order QR Code. Please contact support.",
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
    }
    response.status = pb.StatusCode.OK;
    response.order = orders
    // response.order = orders ? pb.Order.fromObject(orders) : null;
    span.finish();
    return response;
  };
  public multipleBreakApartSeasonOrder = async (
    request: pb.MultipleBreakApartOrderRequest
  ): Promise<pb.MultipleBreakApartOrderResponse> => {
    const span = tracer.startSpan("multipleBreakApartSeasonOrder", request.spanContext);
    const response: pb.MultipleBreakApartOrderResponse =
      pb.MultipleBreakApartOrderResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.array().items(Joi.string()).default([]),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `multipleBreakApartSeasonOrder - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId }: { orderId: string } = params.value;

    // Get the order
    let orders: IOrder[];
    try {
      orders = await this.storage.findByMultipleParentSeasonOrderId(span, orderId);
    } catch (e) {
      this.logger.error(`multipleBreakApartSeasonOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let wasUpdated = false;
    for (let order of orders) {
      if (!order.secretId) {
        order.secretId = uuid4() + uuid4();
      }

      // generate and upload qrCode data for tickets
      await Promise.all(
        order.tickets
          .filter((ticket) => ticket.state === OrderItemStateEnum.Active)
          .map(async (ticket) => {
            if (!ticket.qrCodeUrl) {
              try {
                wasUpdated = true;
                return (ticket.qrCodeUrl = await this.generateQRCodeAndUpload(
                  span.context().toString(),
                  order,
                  ticket._id,
                  OrderItemTypeEnum.Ticket
                ));
              } catch (e) {
                this.logger.error("FAILED TO GENERATE QR CODE");
                this.logger.error(`multipleBreakApartSeasonOrder - error: ${e.message}`);
                response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
                response.errors = [
                  pb.Error.create({
                    key: "Error",
                    message:
                      "Failed to generate order QR code. Please contact support.",
                  }),
                ];
                span.setTag("error", true);
                span.log({ errors: e.message });
                span.finish();
                return response;
              }
            }
          })
      );

      // generate and upload qrCode data for upgrades
      await Promise.all(
        order.upgrades
          .filter((upgrade) => upgrade.state === OrderItemStateEnum.Active)
          .map(async (upgrade) => {
            if (!upgrade.qrCodeUrl) {
              try {
                wasUpdated = true;
                return (upgrade.qrCodeUrl = await this.generateQRCodeAndUpload(
                  span.context().toString(),
                  order,
                  upgrade._id,
                  OrderItemTypeEnum.Upgrade
                ));
              } catch (e) {
                this.logger.error("FAILED TO GENERATE QR CODE");
                this.logger.error(`multipleBreakApartSeasonOrder - error: ${e.message}`);
                response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
                response.errors = [
                  pb.Error.create({
                    key: "Error",
                    message:
                      "Failed to generate order QR code. Please contact support.",
                  }),
                ];
                span.setTag("error", true);
                span.log({ errors: e.message });
                span.finish();
                return response;
              }
            }
          })
      );
      if (!order.printed) {
        order.printed = true;
        order = await this.storage.updateOneOrder(span, order);
      }
      // save data to order
      if (wasUpdated) {
        try {
          order = await this.storage.updateOneOrder(span, order);
        } catch (e) {
          this.logger.error(`multipleBreakApartSeasonOrder - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: "Failed to save order QR Code. Please contact support.",
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
      let requestUpdateSeason = {
        _id: order.parentSeasonOrderId,
        printed: true
      }
      await this.storage.updateOneOrder(span, requestUpdateSeason);
    }
    response.status = pb.StatusCode.OK;
    response.order = orders
    // response.order = orders ? pb.Order.fromObject(orders) : null;
    span.finish();
    return response;
  };
  public batchPrintBreakApartOrder = async (
    request: pb.MultipleBreakApartOrderRequest
  ): Promise<pb.MultipleBreakApartOrderResponse> => {
    const span = tracer.startSpan("batchPrintBreakApartOrder", request.spanContext);
    const response: pb.MultipleBreakApartOrderResponse =
      pb.MultipleBreakApartOrderResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.array().items(Joi.string()).default([]),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `batchPrintBreakApartOrder - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId }: { orderId: string } = params.value;

    // Get the order
    // let orders: IOrder[];
    let orders = [];
    try {
      let allOrders = await this.storage.findByMultipleId(span, orderId);
      for (let order of allOrders) {
        orders.push(order);
        if (order.seasonId) {
          let parentSeason = await this.storage.findByMultipleParentSeasonOrderId(span, order._id);
          parentSeason.map(item => {
            orders.push(item);
          })
        }
      }


    } catch (e) {
      this.logger.error(`batchPrintBreakApartOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let wasUpdated = false;
    for (let order of orders) {
      if (!order.secretId) {
        order.secretId = uuid4() + uuid4();
      }

      // generate and upload qrCode data for tickets
      await Promise.all(
        order.tickets
          .filter((ticket) => ticket.state === OrderItemStateEnum.Active)
          .map(async (ticket) => {
            if (!ticket.qrCodeUrl) {
              try {
                wasUpdated = true;
                return (ticket.qrCodeUrl = await this.generateQRCodeAndUpload(
                  span.context().toString(),
                  order,
                  ticket._id,
                  OrderItemTypeEnum.Ticket
                ));
              } catch (e) {
                this.logger.error("FAILED TO GENERATE QR CODE");
                this.logger.error(`batchPrintBreakApartOrder - error: ${e.message}`);
                response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
                response.errors = [
                  pb.Error.create({
                    key: "Error",
                    message:
                      "Failed to generate order QR code. Please contact support.",
                  }),
                ];
                span.setTag("error", true);
                span.log({ errors: e.message });
                span.finish();
                return response;
              }
            }
          })
      );

      // generate and upload qrCode data for upgrades
      await Promise.all(
        order.upgrades
          .filter((upgrade) => upgrade.state === OrderItemStateEnum.Active)
          .map(async (upgrade) => {
            if (!upgrade.qrCodeUrl) {
              try {
                wasUpdated = true;
                return (upgrade.qrCodeUrl = await this.generateQRCodeAndUpload(
                  span.context().toString(),
                  order,
                  upgrade._id,
                  OrderItemTypeEnum.Upgrade
                ));
              } catch (e) {
                this.logger.error("FAILED TO GENERATE QR CODE");
                this.logger.error(`batchPrintBreakApartOrder - error: ${e.message}`);
                response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
                response.errors = [
                  pb.Error.create({
                    key: "Error",
                    message:
                      "Failed to generate order QR code. Please contact support.",
                  }),
                ];
                span.setTag("error", true);
                span.log({ errors: e.message });
                span.finish();
                return response;
              }
            }
          })
      );
      if (!order.printed) {
        order.printed = true;
        order = await this.storage.updateOneOrder(span, order);
      }
      // save data to order
      if (wasUpdated) {
        try {
          order = await this.storage.updateOneOrder(span, order);
        } catch (e) {
          this.logger.error(`batchPrintBreakApartOrder - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: "Failed to save order QR Code. Please contact support.",
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }
      let requestUpdateSeason = {
        _id: order.parentSeasonOrderId,
        printed: true
      }
      await this.storage.updateOneOrder(span, requestUpdateSeason);
    }
    response.status = pb.StatusCode.OK;
    response.order = orders
    // response.order = orders ? pb.Order.fromObject(orders) : null;
    span.finish();
    return response;
  };
  public breakApartSeasonOrder = async (
    request: pb.BreakApartOrderRequest
  ): Promise<pb.BreakApartSeasonOrderResponse> => {
    const span = tracer.startSpan("breakApartSeasonOrder", request.spanContext);
    const response: pb.BreakApartSeasonOrderResponse =
      pb.BreakApartSeasonOrderResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orderId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `breakApartSeasonOrder - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orderId }: { orderId: string } = params.value;

    // Get the order
    let order: IOrder;
    let childOrder: any
    try {
      order = await this.storage.findById(span, orderId);
      childOrder = await this.storage.findBySeasonOrderId(span, orderId);

    } catch (e) {
      this.logger.error(`breakApartSeasonOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    let wasUpdated = false;

    if (!order.secretId) {
      order.secretId = uuid4() + uuid4();
    }

    for (let orderItem of childOrder) {
      const tickets = orderItem.tickets.filter((ticket) => ticket.state === OrderItemStateEnum.Active)
      const upgrades = orderItem.upgrades
        .filter((upgrade) => upgrade.state === OrderItemStateEnum.Active)
      await Promise.all(
        tickets.map(async (ticket) => {
          if (!ticket.qrCodeUrl) {
            try {
              wasUpdated = true;
              const qrCodeUrl = await this.generateQRCodeAndUpload(
                span.context().toString(),
                orderItem,
                ticket._id,
                OrderItemTypeEnum.Ticket
              )
              ticket.qrCodeUrl = qrCodeUrl;
              return ticket
            } catch (e) {
              this.logger.error("FAILED TO GENERATE QR CODE");
              this.logger.error(`breakApartSeasonOrder - error: ${e.message}`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [
                pb.Error.create({
                  key: "Error",
                  message:
                    "Failed to generate order QR code. Please contact support.",
                }),
              ];
              span.setTag("error", true);
              span.log({ errors: e.message });
              span.finish();
              return response;
            }
          }
        }))
      await Promise.all(
        upgrades.map(async (upgrade) => {
          if (!upgrade.qrCodeUrl) {
            try {
              wasUpdated = true;
              return (upgrade.qrCodeUrl = await this.generateQRCodeAndUpload(
                span.context().toString(),
                order,
                upgrade._id,
                OrderItemTypeEnum.Upgrade
              ));
            } catch (e) {
              this.logger.error("FAILED TO GENERATE QR CODE");
              this.logger.error(`breakApartSeasonOrder - error: ${e.message}`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [
                pb.Error.create({
                  key: "Error",
                  message:
                    "Failed to generate order QR code. Please contact support.",
                }),
              ];
              span.setTag("error", true);
              span.log({ errors: e.message });
              span.finish();
              return response;
            }
          }
        }))
      orderItem.tickets = tickets
      orderItem.upgrades = upgrades
      if (!orderItem.printed) {
        orderItem.printed = true;
        orderItem = await this.storage.updateOneOrder(span, orderItem);
      }
    }
    // generate and upload qrCode data for tickets
    await Promise.all(
      order.tickets
        .filter((ticket) => ticket.state === OrderItemStateEnum.Active)
        .map(async (ticket) => {
          if (!ticket.qrCodeUrl) {
            try {
              wasUpdated = true;
              return (ticket.qrCodeUrl = await this.generateQRCodeAndUpload(
                span.context().toString(),
                order,
                ticket._id,
                OrderItemTypeEnum.Ticket
              ));
            } catch (e) {
              this.logger.error("FAILED TO GENERATE QR CODE");
              this.logger.error(`breakApartSeasonOrder - error: ${e.message}`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [
                pb.Error.create({
                  key: "Error",
                  message:
                    "Failed to generate order QR code. Please contact support.",
                }),
              ];
              span.setTag("error", true);
              span.log({ errors: e.message });
              span.finish();
              return response;
            }
          }
        })
    );
    // generate and upload qrCode data for upgrades
    await Promise.all(
      order.upgrades
        .filter((upgrade) => upgrade.state === OrderItemStateEnum.Active)
        .map(async (upgrade) => {
          if (!upgrade.qrCodeUrl) {
            try {
              wasUpdated = true;
              return (upgrade.qrCodeUrl = await this.generateQRCodeAndUpload(
                span.context().toString(),
                order,
                upgrade._id,
                OrderItemTypeEnum.Upgrade
              ));
            } catch (e) {
              this.logger.error("FAILED TO GENERATE QR CODE");
              this.logger.error(`breakApartSeasonOrder - error: ${e.message}`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [
                pb.Error.create({
                  key: "Error",
                  message:
                    "Failed to generate order QR code. Please contact support.",
                }),
              ];
              span.setTag("error", true);
              span.log({ errors: e.message });
              span.finish();
              return response;
            }
          }
        })
    );

    if (!order.printed) {
      order.printed = true;
      order = await this.storage.updateOneOrder(span, order);
    }
    // save data to order
    if (wasUpdated) {
      try {
        order = await this.storage.updateOneOrder(span, order);
      } catch (e) {
        this.logger.error(`breakApartSeasonOrder - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: "Failed to save order QR Code. Please contact support.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    response.status = pb.StatusCode.OK;
    // response.order = order ? pb.Order.fromObject(order) : null;
    response.order = [order, ...childOrder]

    span.finish();
    return response;
  };
  public getPromoUsed = async (
    request: pb.GetPromoUsedRequest
  ): Promise<pb.GetPromoUsedResponse> => {
    const span = tracer.startSpan("getPromoUsed", request.spanContext);
    const response: pb.GetPromoUsedResponse = pb.GetPromoUsedResponse.create();

    // let order: IOrder;
    try {
      let promoCount = await this.storage.getPromoUsedCount(
        span,
        request.promoCode,
        request.eventId,
        request.userId,
        request.seasonId
      );
      let limit = 0;
      if (request.eventId) {
        const findEventRequest = pb.FindEventByIdRequest.create({
          spanContext: span.context().toString(),
          eventId: request.eventId,
          // seasonId:request.seasonId
        });
        let findEventResponse: pb.FindEventByIdResponse;
        try {
          findEventResponse = await this.proxy.eventService.findEventById(
            findEventRequest
          );
        } catch (e) {
          this.logger.error(`orderEntities - error: ${e.message}`);
          throw new Error(`Failed to fetch order event: ${e.message}`);
        }

        const { event } = findEventResponse;
        if (event.promotions) {
          for (let promo of event.promotions) {
            if (promo.code == request.promoCode) {
              limit = promo.useLimit;
            }
          }
        }
      } else {
        const findSeasonRequest = pb.FindSeasonByIdRequest.create({
          spanContext: span.context().toString(),
          // eventId: request.eventId
          seasonId: request.seasonId,
        });
        let findSeasonResponse: pb.FindSeasonByIdResponse;

        try {
          findSeasonResponse = await this.proxy.seasonService.findSeasonById(
            findSeasonRequest
          );
        } catch (e) {
          this.logger.error(`orderEntities - error: ${e.message}`);
          throw new Error(`Failed to fetch order event: ${e.message}`);
        }

        const { season } = findSeasonResponse;
        if (season.promotions) {
          for (let promo of season.promotions) {
            if (promo.code == request.promoCode) {
              limit = promo.useLimit;
            }
          }
        }
      }
      response.status = pb.StatusCode.OK;
      response.count = limit > promoCount ? limit - promoCount : 0;
    } catch (e) {
      this.logger.error(`getPromoUsed - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };
  public updateOrder = async (
    request: pb.UpdateOrderRequest
  ): Promise<pb.UpdateOrderResponse> => {
    const span = tracer.startSpan("updateOrder", request.spanContext);
    const response: pb.UpdateOrderResponse = pb.UpdateOrderResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      // orgId: Joi.string().required(),
      params: Joi.object().keys({
        orderId: Joi.string().required(),
        ticketId: Joi.string().required(),
        scan: Joi.array().items(Joi.string()).default([])
      })
    });

    const validation = schema.validate(request);
    const {
      params
    } = validation.value;

    if (params.error) {
      this.logger.error(`updateOrder - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    let {
      orderId,
      ticketId,
      scan
    } = params;

    let order: IOrder;
    try {
      order = await this.storage.findById(span, orderId);
      for (let ticket of order.tickets) {
        if (ticket._id == ticketId) {
          ticket.scan = scan
          // return ticket
        }
      }
      try {
        order = await this.storage.updateOneOrder(span, order);
        response.status = pb.StatusCode.OK;
        response.order = pb.Order.fromObject(order);
        span.finish();
        return response;
      } catch (e) {
        this.logger.error(`updateOrder - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            // message: "Failed to save order QR Code. Please contact support.",
            message: "Internal error"
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      };
    } catch (e) {
      this.logger.error(`updateOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return order;
    }
  };

  public updateGuestOrder = async (request: pb.UpdateGuestOrderRequest): Promise<pb.UpdateOrderResponse> => {
    const span = tracer.startSpan("updateGuestOrder", request.spanContext);
    const response: pb.UpdateOrderResponse = pb.UpdateOrderResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().required(),
      params: Joi.object().keys({
        orderId: Joi.string().required(),
        email: Joi.string().required(),
      })
    });

    const validation = schema.validate(request);
    const {
      value: { params, requestorId }, error
    } = validation;

    if (error) {
      this.logger.error(`updateGuestOrder - error: ${JSON.stringify(validation?.error?.message)}`);
      response.status = pb.StatusCode.NOT_FOUND;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: validation?.error?.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: validation?.error?.message });
      span.finish();
      return response;
    }
    let {
      orderId,
      email,
    } = params;

    let order: IOrder;
    try {
      order = await this.storage.findById(span, orderId);
      if (!order) {
        this.logger.error(`updateGuestOrder - error: ${"Order not found from this order id."}`);
        response.status = pb.StatusCode.NOT_FOUND;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: "Order not found from this order id.",
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: "Order not found from this order id." });
      }
    } catch (e) {
      this.logger.error(`updateGuestOrder - error: ${"Order not found from this order id."}`);
      response.status = pb.StatusCode.NOT_FOUND;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Order not found from this order id.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: "Order not found from this order id." });

    }
    try {
      if (order?.userId === '' || order?.userId === null) {
        order.email = email
      }
      order = await this.storage.updateOneOrder(span, order);
      response.status = pb.StatusCode.OK;
      response.order = pb.Order.fromObject(order);

      // const { userId, orgId, eventId, seasonId, tickets, upgrades, channel, promotionCode, parentSeasonOrderId } =
      //   order;

      // let orderParams: any = {
      //   userId,
      //   orgId,
      //   eventId,
      //   seasonId,
      //   tickets,
      //   upgrades,
      //   channel,
      //   promotionCode,
      //   parentSeasonOrderId
      // };
      /**
       *  Send Event Order Receipt
       */
      if (order.eventId && order.email) {
        let event;

        // try {
        //   event = await this.validateCreateOrderParameters(span, orderParams);
        // } catch (e) {
        //   this.logger.error(`updateGuestOrder - error 1: ${e.message}`);
        //   response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        //   response.errors = [
        //     pb.Error.create({
        //       key: "Error",
        //       message: e.message,
        //     }),
        //   ];
        //   span.setTag("error", true);
        //   span.log({ errors: e.message });
        //   span.finish();
        //   return response;
        // }

        const findEventRequest = pb.FindEventByIdRequest.create({
          spanContext: span.context().toString(),
          eventId: order.eventId,
        });
        try {
          event = await this.proxy.eventService.findEventById(
            findEventRequest
          );
        } catch (e) {
          this.logger.error(`updateGuestOrder - error 1: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: e.message,
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }

        /**
       * Send the order receipt
       */
        if (EventUtil.shouldSendOrderReceipt(event.event)) {
          const sendReceipt = async () => {
            const span1 = tracer.startSpan("updateGuestOrder.sendReceipt", span);
            const sendOrderReceiptEmailRequest =
              pb.SendOrderReceiptEmailRequest.create({
                spanContext: span.context().toString(),
                orderId: order._id.toString(),
              });
            try {
              await this.proxy.orderService.sendOrderReceiptEmail(
                sendOrderReceiptEmailRequest
              );
            } catch (e) {
              this.logger.error(
                `createOrder - error 7 - orderId: ${order._id}: ${e.message}`
              );
              span1.setTag("error", true);
              span1.log({ errors: e.message });
            }
          };
          sendReceipt();
        }

        /**
         * Send the order QR Code
         */
        // if (EventUtil.qrCodeEmailAt(event) <= Time.now()) {

        if (EventUtil.qrCodeEmailAt(event.event)) {
          if (EventUtil.qrCodeEmailAt(event.event) <= Time.now()) {
            const sendQRCode = async () => {
              const span1 = tracer.startSpan("updateGuestOrder.sendQRCode", span);
              const sendOrderQRCodeEmailRequest =
                pb.SendOrderQRCodeEmailRequest.create({
                  spanContext: span.context().toString(),
                  orderId: order._id.toString(),
                });
              try {
                const res = await this.proxy.orderService.sendOrderQRCodeEmail(
                  sendOrderQRCodeEmailRequest
                );
                this.logger.info(res);
              } catch (e) {
                this.logger.error(
                  `createOrder - error 8 - orderId: ${order._id}: ${e.message}`
                );
                span1.setTag("error", true);
                span1.log({ errors: e.message });
                span1.finish();
              }
            };
            sendQRCode(); // send qr code function
          }

        }
      }
      /**
       *  Send season order receipt
       */
      // if (order.seasonId && order.email) {
      //   try {
      //     await this.validateCreateSeasonOrderParameters(span, orderParams);
      //   } catch (e) {
      //     this.logger.error(`updateGuestOrder - error 1: ${e.message}`);
      //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      //     response.errors = [
      //       pb.Error.create({
      //         key: "Error",
      //         message: e.message,
      //       }),
      //     ];
      //     span.setTag("error", true);
      //     span.log({ errors: e.message });
      //     span.finish();
      //     return response;
      //   }
      //   /**
      //   * Send the order receipt
      //   */
      //   const sendQRCode = async () => {
      //     const span1 = tracer.startSpan("updateGuestOrder.sendQRCode", span);
      //     const sendOrderQRCodeEmailRequest = pb.SendOrderQRCodeEmailRequest.create(
      //       {
      //         spanContext: span.context().toString(),
      //         orderId: order._id.toString(),
      //       }
      //     );
      //     try {
      //       const res = await this.proxy.orderService.sendSeasonOrderReceiptEmail(
      //         sendOrderQRCodeEmailRequest
      //       );
      //       this.logger.info(res);
      //     } catch (e) {
      //       this.logger.error(
      //         `createOrder - error 8 - orderId: ${order._id}: ${e.message}`
      //       );
      //       span1.setTag("error", true);
      //       span1.log({ errors: e.message });
      //       span1.finish();
      //     }
      //   };
      //   sendQRCode(); // send qr code function
      //   // }
      // }

      // Track
      this.segment.track({
        ...(order.userId != null && order.userId != '') && { userId: order.userId },
        ...(order.userId === null || order.userId === '') && { anonymousId: requestorId },
        event: "ORDER_CREATED",
        properties: {
          orderId: order?._id,
          orgId: order?.orgId,
          eventId: order?.eventId || order?.seasonId,
          eventName: order?.eventName,
          orderType: order?.type,
          orderTotal: order?.payments[0]?.amount,
          orderTotalFormatted: Price.output(order?.payments[0]?.amount),
          ticketCount: order?.tickets?.length,
          upgradeCount: order?.upgrades?.length,
        },
      });
    } catch (e) {
      this.logger.error(`updateGuestOrder - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          // message: "Failed to save order QR Code. Please contact support.",
          message: "Internal error"
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    };
    span.finish();
    return response;
  };
}