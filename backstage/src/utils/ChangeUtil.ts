import client from "../graphql/client";
import GET_EVENT from "@sellout/models/.dist/graphql/queries/event.query";
import GET_SEASON from "@sellout/models/.dist/graphql/queries/season.query";
import GET_VENUE from "@sellout/models/.dist/graphql/queries/venue.query";
import GET_ARTIST from "@sellout/models/.dist/graphql/queries/artist.query";
import GET_FEE from "@sellout/models/.dist/graphql/queries/fee.query";
import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import IArtist from "@sellout/models/.dist/interfaces/IArtist";
import IFee from "@sellout/models/.dist/interfaces/IFee";
import { NEW_EVENT_ID } from "../redux/reducers/event.reducer";
import { NEW_VENUE_ID } from "../redux/reducers/venue.reducer";
import { NEW_ARTIST_ID } from "../redux/reducers/artist.reducer";
import { NEW_FEE_ID } from "../redux/reducers/fee.reducer";
import isDeepEqual from "fast-deep-equal";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import venueState from "../models/states/venue.state";
import eventState from "../models/states/event.state";
import ISeason from "@sellout/models/.dist/interfaces/ISeason";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import { NEW_SEASON_ID } from "../redux/reducers/season.reducer";

/********************************************************************************
 * Event
 *******************************************************************************/

export async function hasEventChanged(event: IEvent): Promise<boolean> {
  if (event._id === NEW_EVENT_ID) {
    var eventClone = JSON.parse(JSON.stringify(event));
    var defaultEventClone = JSON.parse(JSON.stringify(eventState()));

    delete eventClone.schedule?.announceAt;
    delete eventClone.schedule?.ticketsAt;
    delete defaultEventClone.schedule?.announceAt;
    delete defaultEventClone.schedule?.ticketsAt;
    return !isDeepEqual(eventClone, defaultEventClone);
  }

  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
    // fetchPolicy: "no-cache",
  });

  data.event.fees.sort((a, b) => {
    const a_id = a._id.toLowerCase();
    const b_id = b._id.toLowerCase();
    if (a_id > b_id) {
      return 1;
    }
    if (a_id < b_id) {
      return -1;
    }
  });

  event.fees.sort((a: any, b: any) => {
    const a_id = a._id.toLowerCase();
    const b_id = b._id.toLowerCase();
    if (a_id > b_id) {
      return 1 as any;
    }
    if (a_id < b_id) {
      return -1 as any;
    }
  });

  return !isDeepEqual(data.event, event);
}

/************************************************************
 * Ticket Holds
 ***********************************************************/

export async function hasTicketHoldsChanged(
  event: IEvent,
  ticketHoldId: string
): Promise<boolean> {
  if (event?._id === NEW_EVENT_ID) return Promise.resolve(true);
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event?._id,
    },
  });

  const ticketHold = EventUtil.ticketHold(event, ticketHoldId);
  const cacheTicketHold = EventUtil.ticketHold(data.event, ticketHoldId);

  if (!cacheTicketHold) return true;

  return !isDeepEqual(ticketHold, cacheTicketHold);
}

export async function hasToRemoveTicketHolds(
  event: IEvent,
  ticketHoldId: string
): Promise<boolean> {
  
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  let cacheTicketHold = null;
  if (data.event !== null) {
    cacheTicketHold = EventUtil.ticketHold(data.event, ticketHoldId);
  }
  if (!cacheTicketHold) {
    return true;
  }
  return false;
}

/************************************************************
 * Ticket Type
 ***********************************************************/

export async function hasTicketTypeChanged(
  event: IEvent,
  ticketTypeId: string
): Promise<boolean> {
  if (event?._id === NEW_EVENT_ID) return Promise.resolve(true);
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event?._id,
    },
  });

  const ticketType = EventUtil.ticketType(event, ticketTypeId);
  const cacheTicketType = EventUtil.ticketType(data.event, ticketTypeId);

  if (!cacheTicketType) return true;

  return !isDeepEqual(ticketType, cacheTicketType);
}

export async function hasToRemoveTicketType(
  event: IEvent,
  ticketTypeId: string
): Promise<boolean> {
  const seated = EventUtil.isSeated(event);
  if (seated) return false;
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  let cacheTicketType = null;
  if (data.event !== null) {
    cacheTicketType = EventUtil.ticketType(data.event, ticketTypeId);
  }
  if (!cacheTicketType) {
    return true;
  }
  return false;
  
}

/************************************************************
 * Upgrade Type
 ***********************************************************/

export async function hasUpgradeTypeChanged(
  event: IEvent,
  upgradeTypeId: string
): Promise<boolean> {
  
  if (event._id === NEW_EVENT_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  const upgradeType = EventUtil.upgrade(event, upgradeTypeId);
  const cacheUpgradeType = EventUtil.upgrade(data.event, upgradeTypeId);

  if (!cacheUpgradeType) return true;

  return !isDeepEqual(upgradeType, cacheUpgradeType);
}

export async function hasToRemoveUpgradeType(
  event: IEvent,
  upgradeTypeId: string
): Promise<boolean> {
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  let cacheTicketType = null;
  if (data.event !== null) {
    cacheTicketType = EventUtil.upgrade(data.event, upgradeTypeId);
  }
  if (!cacheTicketType) {
    return true;
  }
  return false;
}

/************************************************************
 * Promotion
 ***********************************************************/

export async function hasPromotionChanged(
  event: IEvent,
  promotionId: string
): Promise<boolean> {
  if (event._id === NEW_EVENT_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  const promotionType = EventUtil.promotion(event, promotionId);
  const cachePromotion = EventUtil.promotion(data.event, promotionId);

  if (!cachePromotion) return true;

  return !isDeepEqual(promotionType, cachePromotion);
}

export async function hasToRemovePromotion(
  event: IEvent,
  promotionId: string
): Promise<boolean> {
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  let cachePromotion = null;
  if (data.event !== null) {
    cachePromotion = EventUtil.promotion(data.event, promotionId);
  }
  if (!cachePromotion) {
    return true;
  }
  return false;
}

/************************************************************
 * Custom Field
 ***********************************************************/

export async function hasCustomFieldChanged(
  event: IEvent,
  customFieldId: string
): Promise<boolean> {
  if (event._id === NEW_EVENT_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  const customField = EventUtil.customField(event, customFieldId);
  const cacheCustomField = EventUtil.customField(data.event, customFieldId);

  if (!cacheCustomField) return true;

  return !isDeepEqual(customField, cacheCustomField);
}

export async function hasToRemoveCustomField(
  event: IEvent,
  customFieldId: string
): Promise<boolean> {
  const { data } = await client.query({
    query: GET_EVENT,
    variables: {
      eventId: event._id,
    },
  });

  let cacheCustomField;
  if (data.event !== null) {
    cacheCustomField = EventUtil.customField(data.event, customFieldId);
  }
  if (!cacheCustomField) {
    return true;
  }
  return false;
}

/************************************************************
 * Venue
 ***********************************************************/

export async function hasVenueChanged(venue: IVenue): Promise<boolean> {
  if (venue._id === NEW_VENUE_ID) {
    return !isDeepEqual(venue, venueState());
  }

  const { data } = await client.query({
    query: GET_VENUE,
    variables: {
      venueId: venue._id,
    },
  });
  var VenueClone = JSON.parse(JSON.stringify(venue));
  var defaultVenueClone = JSON.parse(JSON.stringify(data.venue));
  VenueClone.tax = parseFloat(VenueClone.tax).toFixed(2).toString();
  defaultVenueClone.tax = parseFloat(defaultVenueClone.tax)
    .toFixed(2)
    .toString();
  delete VenueClone?.address.timezone;
  delete defaultVenueClone?.address.timezone;
  return !isDeepEqual(defaultVenueClone, VenueClone);
}

/************************************************************
 * Artist
 ***********************************************************/

export async function hasArtistChanged(artist: IArtist): Promise<boolean> {
  if (artist._id === NEW_ARTIST_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_ARTIST,
    variables: {
      artistId: artist._id,
    },
  });

  return !isDeepEqual(data.artist, artist);
}

/************************************************************
 * Fee
 ***********************************************************/

export async function hasFeeChanged(fee: IFee): Promise<boolean> {
  if (fee._id === NEW_FEE_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_FEE,
    variables: {
      feeId: fee._id,
    },
  });

  return !isDeepEqual(data.fee, fee);
}

/********************************************************************************
 * Season
 *******************************************************************************/

export async function hasSeasonChanged(season: ISeason): Promise<boolean> {
  if (season._id === NEW_SEASON_ID) {
    var seasonClone = JSON.parse(JSON.stringify(season));
    var defaultEventClone = JSON.parse(JSON.stringify(eventState()));

    delete seasonClone.schedule?.announceAt;
    delete seasonClone.schedule?.ticketsAt;
    delete defaultEventClone.schedule?.announceAt;
    delete defaultEventClone.schedule?.ticketsAt;
    return !isDeepEqual(seasonClone, defaultEventClone);
  }

  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
    // fetchPolicy: "no-cache",
  });

  data.season.fees.sort((a, b) => {
    const a_id = a._id.toLowerCase();
    const b_id = b._id.toLowerCase();
    if (a_id > b_id) {
      return 1;
    }
    if (a_id < b_id) {
      return -1;
    }
  });

  season.fees.sort((a: any, b: any) => {
    const a_id = a?._id.toLowerCase();
    const b_id = b?._id.toLowerCase();
    if (a_id > b_id) {
      return 1 as any;
    }
    if (a_id < b_id) {
      return -1 as any;
    }
  });


  return !isDeepEqual(data.season, season);
}

/************************************************************
 * Season Ticket Type
 ***********************************************************/

export async function hasSeasonTicketTypeChanged(
  season: ISeason,
  ticketTypeId: string
): Promise<boolean> {
  if (season._id === NEW_SEASON_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  const ticketType = SeasonUtil.ticketType(season, ticketTypeId);
  const cacheTicketType = SeasonUtil.ticketType(data.season, ticketTypeId);

  if (!cacheTicketType) return true;

  return !isDeepEqual(ticketType, cacheTicketType);
}

export async function hasSeasonToRemoveTicketType(
  season: ISeason,
  ticketTypeId: string
): Promise<boolean> {
  const seated = SeasonUtil.isSeated(season);
  if (seated) return false;
  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  let cacheTicketType = null;
  if (data.season !== null) {
    cacheTicketType = SeasonUtil.ticketType(data.season, ticketTypeId);
  }
  if (!cacheTicketType) {
    return true;
  }
  return false;
}

/************************************************************
 * Season Upgrade Type
 ***********************************************************/

export async function hasSeasonUpgradeTypeChanged(
  season: ISeason,
  upgradeTypeId: string
): Promise<boolean> {
  if (season._id === NEW_SEASON_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  const upgradeType = SeasonUtil.upgrade(season, upgradeTypeId);
  const cacheUpgradeType = SeasonUtil.upgrade(data.season, upgradeTypeId);

  if (!cacheUpgradeType) return true;

  return !isDeepEqual(upgradeType, cacheUpgradeType);
}

export async function hasSeasonToRemoveUpgradeType(
  season: ISeason,
  upgradeTypeId: string
): Promise<boolean> {
  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  let cacheTicketType = null;
  if (data.event !== null) {
    cacheTicketType = SeasonUtil.upgrade(data.season, upgradeTypeId);
  }
  if (!cacheTicketType) {
    return true;
  }
  return false;
}

/************************************************************
 * Season Promotion
 ***********************************************************/

export async function hasSeasonPromotionChanged(
  season: ISeason,
  promotionId: string
): Promise<boolean> {
  if (season._id === NEW_SEASON_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  const promotionType = SeasonUtil.promotion(season, promotionId);
  const cachePromotion = SeasonUtil.promotion(data.season, promotionId);

  if (!cachePromotion) return true;

  return !isDeepEqual(promotionType, cachePromotion);
}

export async function hasSeasonToRemovePromotion(
  season: ISeason,
  promotionId: string
): Promise<boolean> {
  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  let cachePromotion = null;
  if (data.season !== null) {
    cachePromotion = EventUtil.promotion(data.season, promotionId);
  }
  if (!cachePromotion) {
    return true;
  }
  return false;
}

/************************************************************
 * Season Custom Field
 ***********************************************************/

export async function hasSeasonCustomFieldChanged(
  season: ISeason,
  customFieldId: string
): Promise<boolean> {
  if (season._id === NEW_SEASON_ID) return Promise.resolve(true);

  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  const customField = SeasonUtil.customField(season, customFieldId);
  const cacheCustomField = SeasonUtil.customField(data.season, customFieldId);

  if (!cacheCustomField) return true;

  return !isDeepEqual(customField, cacheCustomField);
}

export async function hasSeasonToRemoveCustomField(
  season: ISeason,
  customFieldId: string
): Promise<boolean> {
  const { data } = await client.query({
    query: GET_SEASON,
    variables: {
      seasonId: season._id,
    },
  });

  let cacheCustomField;
  if (data.season !== null) {
    cacheCustomField = SeasonUtil.customField(data.season, customFieldId);
  }
  if (!cacheCustomField) {
    return true;
  }
  return false;
}
