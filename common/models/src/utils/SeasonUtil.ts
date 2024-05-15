import Joi from "@hapi/joi";
import IEventUpgrade from "../interfaces/IEventUpgrade";
import IEventPromotion from "../interfaces/IEventPromotion";
import { EventPromotionTypeEnum } from "../interfaces/IEventPromotion";
import * as Time from "@sellout/utils/.dist/time";
import ISeason from "../interfaces/ISeason";
import ITicketType from "../interfaces/ITicketType";
import ISeasonCustomField from "../interfaces/ISeasonCustomField";
import IOrderCustomField from "../interfaces/IOrderCustomField";
import { CustomFieldTypeEnum } from "../enums/CustomFieldTypeEnum";
import { DropDownEnum } from "../enums/DropDownEnum";
import IEventSchedule from "src/interfaces/IEventSchedule";

export default {
  /****************************************************************************************
   * Tickets
   ****************************************************************************************/
  ticketType(season, ticketTypeId): any {
    return season.ticketTypes.find(
      (ticketType) => ticketType._id === ticketTypeId
    );
  },
  activeTicketTypes(season: ISeason): ITicketType[] {
    return season.ticketTypes?.filter((ticketType) => ticketType.visible) ?? [];
  },
  remainingTicketQty(season, ticketTypeId: string | null = null): number {
    if (ticketTypeId) {
      let ticketType = season.ticketTypes.find(
        (ticketType) => ticketType._id === ticketTypeId
      );
      if (!ticketType) return 0;
      else return ticketType.remainingQty;
    } else {
      return season.ticketTypes.reduce((cur, next) => {
        return cur + next.remainingQty;
      }, 0);
    }
  },
  remainingQtyByTicketTypes(season): object {
    return season.ticketTypes.reduce((cur, ticketType) => {
      cur[ticketType._id] = this.remainingTicketQty(season, ticketType._id);
      return cur;
    }, {});
  },
  purchaseLimitByTicketTypes(season): object {
    return season.ticketTypes.reduce((cur, ticketType) => {
      cur[ticketType._id] = ticketType.purchaseLimit;
      return cur;
    }, {});
  },
  getCurrentTierId(season, ticketTypeId: string): string {
    const ticketType = season.ticketTypes.find(
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
  upgrade(season, upgradeId): any {
    return season?.upgrades?.find((upgrades) => upgrades._id === upgradeId);
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
   * Venue
   ****************************************************************************************/
  venueIds(season): string[] {
    let venueIds = [season.venueId];
    season.performances.forEach((performance) => {
      venueIds = venueIds.concat(performance.venueStageId);
    });
    venueIds = [...new Set(venueIds)];
    venueIds = venueIds.filter((v) => !!v);
    return venueIds;
  },
  seatingId(season): string {
    return season._id.replace("_", "SAMH");
  },
  /****************************************************************************************
   * Promotions
   ****************************************************************************************/
  promotion(season, promotionId: string): any {
    return season?.promotions?.find(
      (promotions) => promotions._id === promotionId
    );
  },
  activePromotions(
    season?: ISeason,
    type: EventPromotionTypeEnum | null = null
  ): IEventPromotion[] {
    const now = Time.now();

    let promotions = (season?.promotions ?? [])
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
  //  /****************************************************************************************
  //  * Validate Publish
  //  ****************************************************************************************/
  validatePublish(season: ISeason): any {
    let seasonSchema;
    // switch (season.type) {
    // case SeasonTypeEnum.GeneralEvent:
    seasonSchema = Joi.object()
      .options({ abortEarly: false })
      .keys({
        name: Joi.string()
          .required()
          .messages({ "string.empty": '"Season name" is a required field' }),
        description: Joi.string().required().messages({
          "string.empty": '"Season description" is a required field',
        }),
        posterImageUrl: Joi.string().required().messages({
          "string.empty": '"Season image" is a required field',
        }),
        venueId: Joi.string()
          .required()
          .messages({ "string.empty": '"Venue" is required' }),
        ticketTypes: Joi.array()
          .min(1)
          .messages({ "array.min": '"Season" must have atleast 1 ticket' }),
      })
      .unknown(true);

    return seasonSchema.validate(season);
  },

  /****************************************************************************************
   * Custom Fields
   ****************************************************************************************/
  customField(
    season: ISeason,
    customFieldId: string
  ): ISeasonCustomField | null {
    return (
      season?.customFields?.find(
        (customField) => customField._id === customFieldId
      ) ?? null
    );
  },

  activeCustomFields(season: ISeason): ISeasonCustomField[] {
    return (
      season?.customFields?.filter((customField) => customField.active) ?? []
    );
  },
  /****************************************************************************************
   * Seating
   ****************************************************************************************/
  isSeated(season?: ISeason): boolean {
    if (!season) return false;
    return Boolean(season.seatingChartKey);
  },

  /****************************************************************************************
   * Artist
   ****************************************************************************************/
  artistIds(season): string[] {
    let artistIds = [];
    season.performances.forEach((performance) => {
      artistIds = artistIds
        .concat(performance.headliningArtistIds)
        .concat(performance.openingArtistIds);
    });
    artistIds = [...new Set(artistIds)];
    artistIds = artistIds.filter((a) => !!a);
    return artistIds;
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
   * Schedule
   ****************************************************************************************/
  hasBeenAnnounced(season): boolean {
    const {
      schedule: { announceAt },
    } = season;
    const now = Time.now();
    return announceAt < now;
  },
  isAnnounced(season): boolean {
    const {
      schedule: { announceAt, ticketsAt },
    } = season;
    const now = Time.now();
    return announceAt < now && now < ticketsAt;
  },
  isOnSale(season): boolean {
    const {
      schedule: { ticketsAt, ticketsEndAt },
    } = season;
    const now = Time.now();
    return ticketsAt < now && now < ticketsEndAt;
  },
  isInProgress(season): boolean {
    const {
      schedule: { startsAt, endsAt },
    } = season;
    const now = Time.now();
    return startsAt < now && now < endsAt;
  },
  saleHasEnded(season): boolean {
    const {
      schedule: { ticketsEndAt },
    } = season;
    const now = Time.now();
    return ticketsEndAt < now;
  },
  isSoldOut(season?: ISeason): boolean {
    return this.remainingTicketQty(season) > 0;
  },
  hasEnded(season): boolean {
    const {
      schedule: { endsAt },
    } = season;
    const now = Time.now();
    return endsAt < now;
  },
  isUnavailable(season?: ISeason): boolean {
    if (!season?.published) return true;
    if (!this.hasBeenAnnounced(season)) return true;
    if (!this.isOnSale(season)) return true;
    if (this.allTicketsAreLocked(season)) return true;
    if (this.saleHasEnded(season)) return true;
    return false;
  },
  allTicketsAreLocked(season?: ISeason): boolean {
    const ticketTypeCount = season?.ticketTypes?.length;
    const promotionCodeTicketCount = [
      ...new Set(
        season?.promotions
          ?.filter((a) => a.type === "Unlock")
          .reduce((cur: string[], promotion) => {
            // (this.isOnSale(season) ? promotion.type === "Unlock" : (promotion.type === "Presale" || promotion.type === "Unlock"))
            // if(2!==2)
            return [...cur, ...promotion.ticketTypeIds];
          }, [])
      ),
    ].length;

    return ticketTypeCount === promotionCodeTicketCount;
  },
  /****************************************************************************************
   * CustomField  validate
   ****************************************************************************************/
  validateCustomField(customField: ISeasonCustomField): any {
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
  customFieldsAreValid(
    seasonCustomFields: ISeasonCustomField[],
    orderCustomFields: IOrderCustomField[]
  ): boolean {
    const activeFields =
      seasonCustomFields?.filter(
        (seasonCustomField) => seasonCustomField.active
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

  validateSeasonDates(season: ISeason): any {
    const schedule: IEventSchedule = season?.schedule as IEventSchedule;
    const announceAt = schedule?.announceAt as number;
    const ticketsAt = schedule?.ticketsAt as number;
    const ticketsEndAt = schedule?.ticketsEndAt as number;

    const startsAt = schedule?.startsAt as number;
    const endsAt = schedule?.endsAt as number;
    /* Actions */
    let message = "" as string;

    if (announceAt > startsAt) {
      message = "Announcement Date should be less than Season Begins.";
      return message;
    } else if (ticketsAt < announceAt || ticketsAt > ticketsEndAt) {
      message =
        "Sales Begin should be greater than or equal to Announcement Date and less than Sales End.";
      return message;
    } else if (ticketsEndAt > endsAt) {
      message = "Sales End should be less than or equal to Season Ends.";
      return message;
    }
    return message;
  },
};
