import Joi from "@hapi/joi";
import * as Time from "@sellout/utils/.dist/time";
import IEventCustomField from "../interfaces/IEventCustomField";
import IRefundModal from "../interfaces/IRefundModal";
import IEvent, {
  EventProcessAsEnum,
  EventTypeEnum,
} from "../interfaces/IEvent";
import { CustomFieldTypeEnum } from "../enums/CustomFieldTypeEnum";
import IOrderCustomField from "../interfaces/IOrderCustomField";
import IEventUpgrade from "../interfaces/IEventUpgrade";
import ITicketType from "../interfaces/ITicketType";
import IEventPromotion from "../interfaces/IEventPromotion";
import { EventPromotionTypeEnum } from "../interfaces/IEventPromotion";
import { DropDownEnum } from "../enums/DropDownEnum";
import { SendQRCodeEnum } from "../interfaces/IEvent";
import IEventSchedule from "../interfaces/IEventSchedule";
import ITicketHold from "../interfaces/ITicketHold";

export default {
  /****************************************************************************************
   * Schedule
   ****************************************************************************************/
  hasBeenAnnounced(event): boolean {
    const {
      schedule: { announceAt },
    } = event;
    const now = Time.now();
    return announceAt < now;
  },
  isAnnounced(event): boolean {
    const {
      schedule: { announceAt, ticketsAt },
    } = event;
    const now = Time.now();
    return announceAt < now && now < ticketsAt;
  },
  isOnSale(event): boolean {
    const ticketsAt = event?.schedule?.ticketsAt;
    const ticketsEndAt = event?.schedule?.ticketsEndAt;

    const now = Time.now();
    return ticketsAt < now && now < ticketsEndAt;
  },
  isInProgress(event): boolean {
    const {
      schedule: { startsAt, endsAt },
    } = event;
    const now = Time.now();
    return startsAt < now && now < endsAt;
  },
  saleHasEnded(event): boolean {
    const {
      schedule: { ticketsEndAt },
    } = event;
    const now = Time.now();
    return ticketsEndAt < now;
  },
  isSoldOut(event: IEvent): boolean {
    return this.remainingTicketQty(event) > 0;
  },
  hasEnded(event): boolean {
    const {
      schedule: { endsAt },
    } = event;
    const now = Time.now();
    return endsAt < now;
  },
  isUnavailable(event: IEvent): boolean {
    if (!event.published) return true;
    if (!this.hasBeenAnnounced(event)) return true;
    if (!this.isOnSale(event)) return true;
    if (this.allTicketsAreLocked(event)) return true;
    if (this.saleHasEnded(event)) return true;
    return false;
  },
  allTicketsAreLocked(event: IEvent): boolean {
    const ticketTypeCount = event.ticketTypes?.length;
    const promotionCodeTicketCount = [
      ...new Set(
        event.promotions
          ?.filter((a) => a.type === "Unlock" && a.active)
          .reduce((cur: string[], promotion) => {
            // (this.isOnSale(event) ? promotion.type === "Unlock" : (promotion.type === "Presale" || promotion.type === "Unlock"))
            // if(2!==2)
            return [...cur, ...promotion.ticketTypeIds];
          }, [])
      ),
    ].length;

    return ticketTypeCount === promotionCodeTicketCount;
  },
  /****************************************************************************************
   * QR Code
   ****************************************************************************************/
  qrCodeEmailAt(event): number {
    const {
      performances: [performance],
    } = event;
    const { schedule } = performance;
    let doorsAt = schedule[0].doorsAt;
    let startsAt = schedule[0].startsAt;
    /*const {
      schedule: { doorsAt, startsAt },
    } = performance;
    console.log
        changing to lower case 
        becuse previosly it is stored with different values
        like Upon Order, Upon order
    */
    if (
      event.sendQRCode.toLowerCase() === SendQRCodeEnum.UponOrder.toLowerCase()
    ) {
      return Time.now();
    }

    if (
      event.sendQRCode.toLowerCase() ===
      SendQRCodeEnum.TwoWeeksBefore.toLowerCase()
    ) {
      const TWO_WEEKS = 14 * 24 * 60 * 60;
      return startsAt - TWO_WEEKS;
    }

    // if (
    //   event.sendQRCode.toLowerCase() ===
    //   SendQRCodeEnum.DayOfShow.toLowerCase()
    // ) {
    //   const TWO_WEEKS = 14 * 24 * 60 * 60;
    //   return startsAt - TWO_WEEKS;
    // }

    /* if (event.sendQRCode === "Upon Order") {
        return Time.now();
    }

    if (event.sendQRCode === "Two Weeks Before Show") {
      const TWO_WEEKS = 14 * 24 * 60 * 60;
      return startsAt - TWO_WEEKS;
    } */

    // return doorsAt - 600;

    return doorsAt - 28800
  },
  shouldSendOrderReceipt(event): boolean {
    const now = Time.now();
    const qrCodeEmailAt = this.qrCodeEmailAt(event);

    // Never send a receipt if we are
    // send a qr code upon order
    if (
      event.sendQRCode.toLowerCase() === SendQRCodeEnum.UponOrder.toLowerCase()
    ) {
      return false;
    }
    // if (event.sendQRCode === "Upon Order") {
    //   return false;
    // }

    // Only send a receipt if QR codes for
    // the event haven't already gone out
    if (qrCodeEmailAt > now) {
      return true;
    }

    return false;
  },
  /****************************************************************************************
   * Process As
   ****************************************************************************************/
  isPaid(event: IEvent): boolean {
    return event?.processAs === EventProcessAsEnum.Paid;
  },
  isRSVP(event: IEvent): boolean {
    return event?.processAs === EventProcessAsEnum.RSVP;
  },
  // isFree(event: IEvent): boolean {
  //   return event.processAs === EventProcessAsEnum.Free;
  // },
  /****************************************************************************************
   * Seating
   ****************************************************************************************/
  isSeated(event?: IEvent): boolean {
    if (!event) return false;
    return Boolean(event.seatingChartKey);
  },
  /****************************************************************************************
   * Venue
   ****************************************************************************************/
  venueIds(event): string[] {
    let venueIds = [event.venueId];
    event.performances.forEach((performance) => {
      venueIds = venueIds.concat(performance.venueStageId);
    });
    venueIds = [...new Set(venueIds)];
    venueIds = venueIds.filter((v) => !!v);
    return venueIds;
  },
  seatingId(event): string {
    return event._id.replace("_", "SAMH");
  },
  /****************************************************************************************
   * Artist
   ****************************************************************************************/
  artistIds(event): string[] {
    let artistIds = [];
    event.performances.forEach((performance) => {
      artistIds = artistIds
        .concat(performance.headliningArtistIds)
        .concat(performance.openingArtistIds);
    });
    artistIds = [...new Set(artistIds)];
    artistIds = artistIds.filter((a) => !!a);
    return artistIds;
  },
  headliningArtistIds(event): string[] {
    let artistIds = [];
    event.performances.forEach((performance) => {
      artistIds = artistIds.concat(performance.headliningArtistIds);
    });
    artistIds = [...new Set(artistIds)];
    artistIds = artistIds.filter((a) => !!a);
    return artistIds;
  },
  openingArtistIds(event): string[] {
    let artistIds = [];
    event.performances.forEach((performance) => {
      artistIds = artistIds.concat(performance.openingArtistIds);
    });
    artistIds = [...new Set(artistIds)];
    artistIds = artistIds.filter((a) => !!a);
    return artistIds;
  },

  /****************************************************************************************
  * Tickets Hold
  ****************************************************************************************/
  ticketHold(event, ticketHoldId): any {
    return event?.holds.find(
      (ticketHold) => ticketHold._id === ticketHoldId
    );
  },

  /****************************************************************************************
   * Tickets
   ****************************************************************************************/
  ticketType(event, ticketTypeId): any {
    return event?.ticketTypes.find(
      (ticketType) => ticketType._id === ticketTypeId
    );
  },
  activeTicketTypes(event: IEvent): ITicketType[] {
    return event?.ticketTypes?.filter((ticketType) => ticketType.visible) ?? [];
  },
  remainingTicketQty(event, ticketTypeId: string | null = null): number {
    if (ticketTypeId) {
      let ticketType = event?.ticketTypes.find(
        (ticketType) => ticketType._id === ticketTypeId
      );
      if (!ticketType) return 0;
      else return ticketType.remainingQty;
    } else {
      return event?.ticketTypes.reduce((cur, next) => {
        return cur + next.remainingQty;
      }, 0);
    }
  },
  remainingQtyByTicketTypes(event): object {
    return event.ticketTypes.reduce((cur, ticketType) => {
      cur[ticketType._id] = this.remainingTicketQty(event, ticketType._id);
      return cur;
    }, {});
  },
  purchaseLimitByTicketTypes(event): object {
    return event.ticketTypes.reduce((cur, ticketType) => {
      cur[ticketType._id] = ticketType.purchaseLimit;
      return cur;
    }, {});
  },
  getCurrentTierId(event, ticketTypeId: string): string {
    const ticketType = event.ticketTypes.find(
      (t) => t._id.toString() === ticketTypeId
    );
    const now = Time.now();
    const tier = ticketType.tiers.find(
      (tier) => tier.startsAt < now && now < tier.endsAt
    );
    return tier._id;
  },
  /****************************************************************************************
   * Upgrades
   ****************************************************************************************/
  upgrade(event, upgradeId): any {
    return event.upgrades.find((upgrades) => upgrades._id === upgradeId);
  },
  activeUpgrades(event: IEvent): IEventUpgrade[] {
    return (
      (event?.upgrades ?? [])
        // must be active
        .filter((upgrade) => upgrade.visible)
      // must have remaining qty
      //.filter((upgrade) => upgrade.remainingQty > 0)
    );
  },
  activeNonComplimentaryUpgrades(event: IEvent): IEventUpgrade[] {
    return (
      this.activeUpgrades(event)
        // must not be complimentary
        .filter((upgrade) => !upgrade.complimentary)
    );
  },
  remainingUpgradeQty(event, upgradeId: string | null = null): number {
    if (upgradeId) {
      let upgrade = event.upgrades.find((upgrade) => upgrade._id === upgradeId);
      if (!upgrade) return 0;
      else return upgrade.remainingQty;
    } else {
      return event.upgrades.reduce((cur, next) => {
        return cur + next.remainingQty;
      }, 0);
    }
  },
  remainingQtyByUpgrades(event): object {
    return event.upgrades.reduce((cur, upgrade) => {
      cur[upgrade._id] = this.remainingUpgradeQty(event, upgrade._id);
      return cur;
    }, {});
  },
  purchaseLimitByUpgrades(event): object {
    return event.upgrades.reduce((cur, upgrade) => {
      cur[upgrade._id] = upgrade.purchaseLimit;
      return cur;
    }, {});
  },
  isUpgradeForSpecificTickets(event: IEvent, upgrade: IEventUpgrade): boolean {
    return Boolean(
      event?.ticketTypes?.map((t) => t._id).sort() ===
      upgrade?.ticketTypeIds?.sort()
    );
  },
  /****************************************************************************************
   * Promotions
   ****************************************************************************************/
  promotion(event, promotionId: string): any {
    return event.promotions.find(
      (promotions) => promotions._id === promotionId
    );
  },
  activePromotions(
    event: IEvent,
    type: EventPromotionTypeEnum | null = null
  ): IEventPromotion[] {
    const now = Time.now();

    let promotions = (event?.promotions ?? [])
      // must be active
      .filter((promotion) => promotion.active)
      // must have remaining qty
      .filter((promotion) => promotion.remainingQty > 0)
      // must be in the correct time
      .filter(
        (promotion) => promotion.startsAt < now && now < promotion.endsAt
      );

    // Optional type
    if (type !== null) {
      promotions = promotions.filter((promotion) => promotion.type === type);
    }

    return promotions;
  },
  /****************************************************************************************
   * Custom Fields
   ****************************************************************************************/
  customField(event: IEvent, customFieldId: string): IEventCustomField | null {
    return (
      event?.customFields?.find(
        (customField) => customField._id === customFieldId
      ) ?? null
    );
  },
  activeCustomFields(event: IEvent): IEventCustomField[] {
    return (
      event?.customFields?.filter((customField) => customField.active) ?? []
    );
  },
  hasCustomFields(event) {
    return (
      event?.customFields.filter((customField) => customField.active).length > 0
    );
  },
  // Fixed issue SELLOUT-49
  customFieldsAreValid(
    eventCustomFields: IEventCustomField[],
    orderCustomFields: IOrderCustomField[]
  ): boolean {
    const activeFields =
      eventCustomFields?.filter(
        (eventCustomField) => eventCustomField.active
      ) ?? [];

    const validFields =
      activeFields?.filter((eventCustomField) => {
        const { _id, minLength, maxLength, minValue, maxValue, required } =
          eventCustomField;

        const orderCustomField = orderCustomFields?.find(
          (orderCustomField) => orderCustomField.customFieldId === _id
        );

        // Field is not required and orderCustomField not empty
        if (!required && !orderCustomField) return true;

        // Field has not been filled out
        if (!orderCustomField) return false;

        let { value } = orderCustomField;

        if (
          !required &&
          (value === undefined ||
            value === "NaN" ||
            value === "" ||
            value === DropDownEnum.Select)
        ) {
          return true;
        }

        if (eventCustomField?.type === CustomFieldTypeEnum.Text) {
          value = <string>value;
          if (value) {
            if (minLength === 0 && maxLength === 0 && value.length > 0) {
              return true;
            } else if (minLength === 0 && value.length <= maxLength) {
              return true;
            } else if (maxLength === 0 && minLength <= value.length) {
              return true;
            } else if (minLength <= value.length && value.length <= maxLength) {
              return true;
            }
          }
          return false;
        } else if (eventCustomField.type === CustomFieldTypeEnum.Dropdown) {
          value = <string>value;
          if (value !== "" && value !== DropDownEnum.Select) {
            return true;
          }
          return false;
        } else if (eventCustomField.type === CustomFieldTypeEnum.Address) {
          value = <string>value;
          if (value !== "") {
            return true;
          }
          return false;
        } else {
          value = <number>value;
          if (value) {
            if (minValue === 0 && maxValue === 0 && value > 0) {
              return true;
            } else if (minValue === 0 && value <= maxValue) {
              return true;
            } else if (maxValue === 0 && minValue <= value) {
              return true;
            } else if (minValue <= value && value <= maxValue) {
              return true;
            }
          }
          return false;
        }
      }) ?? [];

    return validFields.length === activeFields.length;
  },
  /****************************************************************************************
   * Publish validate
   ****************************************************************************************/
  validatePublish(event: IEvent): any {
    let eventSchema;

    switch (event.type) {
      case EventTypeEnum.GeneralEvent:
        eventSchema = Joi.object()
          .options({ abortEarly: false })
          .keys({
            name: Joi.string()
              .required()
              .messages({ "string.empty": '"Event name" is a required field' }),
            description: Joi.string().required().messages({
              "string.empty": '"Event description" is a required field',
            }),
            posterImageUrl: Joi.string().required().messages({
              "string.empty": '"Event image" is a required field',
            }),
            venueId: Joi.string()
              .required()
              .messages({ "string.empty": '"Venue" is required' }),
            ticketTypes: Joi.array()
              .min(1)
              .items(
                Joi.object()
                  .options({ allowUnknown: true })
                  .keys({
                    name: Joi.string().required(),
                    remainingQty: Joi.number().required(),
                    totalQty: Joi.number().required(),
                    purchaseLimit: Joi.number().required(),
                    tiers: Joi.array().items(
                      Joi.object()
                        .keys({
                          name: Joi.string().required(),
                          price: Joi.number().required(),
                          remainingQty: Joi.number().required(),
                          totalQty: Joi.number().required(),
                        })
                        .unknown(true)
                    ),
                  })
              )
              .messages({ "array.min": '"Event" must have atleast 1 ticket' }),
          })
          .unknown(true);
        break;
      case EventTypeEnum.Concert:
        eventSchema = Joi.object()
          .options({ abortEarly: false })
          .keys({
            name: Joi.string()
              .required()
              .messages({ "string.empty": '"Event name" is a required field' }),
            description: Joi.string().required().messages({
              "string.empty": '"Event description" is a required field',
            }),
            posterImageUrl: Joi.string().required().messages({
              "string.empty": '"Event image" is a required field',
            }),
            venueId: Joi.string()
              .required()
              .messages({ "string.empty": '"Venue" is required' }),
            performances: Joi.array()
              .items(
                Joi.object()
                  .keys({
                    headliningArtistIds: Joi.array()
                      .items(Joi.string().required())
                      .messages({
                        "array.includesRequiredUnknowns":
                          "An event performer is required for a concert",
                      }),
                  })
                  .unknown(true)
              )
              .default([]),
          })
          .unknown(true);
        break;
    }

    return eventSchema.validate(event);
  },
  /****************************************************************************************
 * Ticket Hold  validate
 ****************************************************************************************/
  validateTicketHold(ticketHold: ITicketHold): any {
    let ticketHoldSchema: any;
    let used = ticketHold?.ticketRemaining as number;

    ticketHoldSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        name: Joi.string()
          .required()
          .messages({ "string.empty": '"Block name" is a required field' }),
        ticketType: Joi.string().required()
          .messages({ "string.empty": '"Ticket Type" is a required field' }),
        qty: Joi.number().required().min(1)
          .custom((value, helpers) => {
            if (value > 0 && value > used) {
              return helpers.error("totalqty.invalid");
            }
            return value;
          })
          .messages({
            "totalqty.invalid":
              '"Total qty." must be less than or equal to the number of ticket remaining qty.',
            "number.min": '"Total qty." must be greater than 0',
          }),
      })
      .unknown(true);
    return ticketHoldSchema.validate(ticketHold);
  },

  validateTicketHoldName(ticketHold: ITicketHold): any {
    let ticketHoldSchema: any;

    ticketHoldSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        name: Joi.string()
          .required()
          .messages({ "string.empty": '"Block name" is a required field' }),
      })
      .unknown(true);
    return ticketHoldSchema.validate(ticketHold);
  },
  /****************************************************************************************
   * Ticket validate
   ****************************************************************************************/
  validateTicket(
    ticket: ITicketType,
    isPaid: Boolean,
    isMultipleDays: boolean
  ): any {
    let ticketSchema;
    let limit = isPaid ? "Purchase limit" : "RSVP limit";

    let used = ticket.totalQty - ticket.remainingQty;
    ticketSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        name: Joi.string()
          .required()
          .messages({ "string.empty": '"Ticket name" is a required field' }),
        remainingQty: Joi.number().required(),
        totalQty: Joi.number().required().min(1).messages({
          "number.required": '"Total qty." is a required field',
          "number.min": '"Total qty." must be greater than 0',
        }),
        purchaseLimit: Joi.number()
          .required()
          .min(1)
          .messages({
            "number.required": `"${limit}" is a required field`,
            "number.min": `"${limit}" must be greater than 0`,
            "number.base": `"${limit}" must be a number`,
          }),
        dayIds: Joi.array()
          .min(isMultipleDays ? 1 : 0)
          .items(Joi.string())
          .default([])
          .messages({
            "array.min": "Ticket must have selected atleast one day.",
          }),
        tiers: Joi.array().items(
          Joi.object()
            .keys({
              name: Joi.string().required(),
              price: Joi.number().required(),
              remainingQty: Joi.number().required(),
              totalQty: Joi.number()
                .custom((value, helpers) => {
                  if (value > 0 && value < used) {
                    return helpers.error("totalqty.invalid");
                  }
                  return value;
                })
                .messages({
                  "totalqty.invalid":
                    '"Total qty." must be greater than or equal to number of ticket sold',
                })
                .required(),
            })
            .unknown(true)
        ),
      })
      .unknown(true);
    return ticketSchema.validate(ticket);
  },
  /****************************************************************************************
   * Upgrade  validate
   ****************************************************************************************/
  validateUpgrade(upgrade: IEventUpgrade, isPaid: Boolean): any {
    let upgradeSchema;
    let limit = isPaid ? "Purchase limit" : "RSVP limit";
    let used = upgrade.totalQty - upgrade.remainingQty;
    upgradeSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        name: Joi.string()
          .required()
          .messages({ "string.empty": '"Upgrade name" is a required field' }),
        price: Joi.number().required(),
        totalQty: Joi.number()
          .custom((value, helpers) => {
            if (value > 0 && value < used) {
              return helpers.error("totalqty.invalid");
            }
            return value;
          })
          .messages({
            "totalqty.invalid":
              '"Total qty." must be greater than or equal to number of upgrade sold',
          })
          .required()
          .min(1)
          .messages({
            "number.required": '"Total qty." is a required field',
            "number.min": '"Total qty." must be greater than 0',
          }),
        remainingQty: Joi.number(),
        purchaseLimit: Joi.number()
          .required()
          .min(1)
          .messages({
            "number.required": `"${limit}" is a required field`,
            "number.min": `"${limit}" must be greater than 0`,
            "number.base": `"${limit}" must be a number`,
          }),
        complimentary: Joi.boolean().required(),
        complimentaryWith: Joi.string().required(),
        complimentaryQty: Joi.number().required(),
        ticketTypeIds: Joi.array().items(Joi.string()).default([]),
        imageUrl: Joi.string().optional().allow(""),
        description: Joi.string().optional().allow(""),
        visible: Joi.boolean().required(),
        rollFees: Joi.boolean().required(),
      })
      .unknown(true);
    return upgradeSchema.validate(upgrade);
  },
  /****************************************************************************************
   * Promotion  validate
   ****************************************************************************************/
  validatePromotion(promotion: IEventPromotion): any {
    let promotionSchema;
    let used = promotion.totalQty - promotion.remainingQty;
    promotionSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        code: Joi.string()
          .required()
          .messages({ "string.empty": '"Secret code" is a required field' }),
        type: Joi.string().required(),
        remainingQty: Joi.number(),
        totalQty: Joi.number()
          .custom((value, helpers) => {
            if (value > 0 && value < used) {
              return helpers.error("totalqty.invalid");
            }
            return value;
          })
          .messages({
            "totalqty.invalid":
              '"Total qty." must be greater than or equal to number of secret code sold',
          })
          .required()
          .min(1)
          .messages({
            "number.required": '"Total qty." is a required field',
            "number.min": '"Total qty." must be greater than 0',
          }),
        ticketTypeIds: Joi.array().items(Joi.string()).default([]),
        upgradeIds: Joi.array().items(Joi.string()).default([]),
        active: Joi.boolean().required(),
        startsAt: Joi.number().required(),
        endsAt: Joi.number().required(),
        useLimit: Joi.number().min(1).messages({
          "number.required": '"Use limit" is a required field',
          "number.min": 'Use limit" must be greater than 0',
          "number.base": '"Use limit" must be a number',
        }),
        discountType: Joi.string(),
        discountValue: Joi.number(),
      })
      .unknown(true);
    return promotionSchema.validate(promotion);
  },
  /****************************************************************************************
   * CustomField  validate
   ****************************************************************************************/
  validateCustomField(customField: IEventCustomField): any {
    let customFieldSchema;
    customFieldSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        label: Joi.string()
          .required()
          .messages({ "string.empty": '"Question" is a required field' }),
        type: Joi.string().required(),
        // minLength: Joi.number(),
        // maxLength: Joi.number(),
        // minValue: Joi.number(),
        // maxValue: Joi.number(),
        options: Joi.array().items(Joi.string()).default([]),
        required: Joi.boolean().required(),
        active: Joi.boolean().required(),
      })
      .unknown(true);
    return customFieldSchema.validate(customField);
  },
  validateRefundModal(refundField: IRefundModal): any {
    let refundFieldSchema;
    refundFieldSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        // ticketIds: Joi.array()
        //   .min(1)
        //   .items(Joi.string())
        //   .messages({ "array.min": "Select any one checkbox for refunding." }),
        refundReason: Joi.string()
          .required()
          .messages({ "string.empty": '"Reason" is a required field' }),
      })
      .unknown(true);
    return refundFieldSchema.validate(refundField);
  },
  validateEventDates(event: IEvent): any {
    const schedule: IEventSchedule = event?.schedule as IEventSchedule;
    const announceAt = schedule?.announceAt as number;
    const ticketsAt = schedule?.ticketsAt as number;
    const ticketsEndAt = schedule?.ticketsEndAt as number;
    const performance = event?.performances?.[0];
    const startsAt =
      (performance?.schedule &&
        (performance?.schedule[0]?.startsAt as number)) ||
      0;
    const endsAt =
      event?.totalDays?.length === 0
        ? (event?.schedule?.endsAt as number)
        : (performance?.schedule &&
          (performance?.schedule[performance?.schedule?.length - 1]
            ?.endsAt as number)) ||
        0;
    /* Actions */
    let message = "" as string;

    performance?.schedule?.some((a, i) => {
      if (a.startsAt < a.doorsAt) {
        message =
          performance?.schedule && performance?.schedule?.length > 1
            ? "Doors Open should be less than or equal to Event Begins on day " +
            (i + 1) +
            "."
            : "Doors Open should be less than or equal to Event Begins.";
        return message;
      } else if (
        a.startsAt >
        (event?.totalDays?.length === 0
          ? (event?.schedule?.endsAt as number)
          : a.endsAt)
      ) {
        message =
          performance?.schedule && performance?.schedule?.length > 1
            ? "Event Ends should be greater than Event Begins on day " +
            (i + 1) +
            "."
            : "Event Ends should be greater than Event Begins.";
        return message;
      } else if (performance?.schedule && performance?.schedule?.length > 1) {
        const aa =
          performance?.schedule?.[i + 1]?.startsAt &&
          performance?.schedule?.[i + 1]?.startsAt >
          (event?.totalDays?.length === 0
            ? (event?.schedule?.endsAt as number)
            : a.endsAt);
        if (!aa && aa !== undefined) {
          message =
            "Day " +
            (i + 2) +
            " Event Begins should be greater than day " +
            (i + 1) +
            " Event Ends.";
          return message;
        }
      }
    });
    if (announceAt > startsAt) {
      message = "Announcement Date should be less than Event Begins.";
      return message;
    } else if (ticketsAt < announceAt || ticketsAt > ticketsEndAt) {
      message =
        "Sales Begin should be greater than or equal to Announcement Date and less than Sales End.";
      return message;
    } else if (ticketsEndAt > endsAt) {
      message = "Sales End should be less than or equal to Event Ends.";
      return message;
    }
    return message;
  },
};
