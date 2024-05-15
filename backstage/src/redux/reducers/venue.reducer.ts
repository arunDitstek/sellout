import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import {
  VenueActionTypes,
  VenueActionCreatorTypes,
  // Venue Id
  SetVenueIdAction,
  // Sagas
  // CreateVenueRequestAction,
  CreateVenueSuccessAction,
  CreateVenueFailureAction,
  // UpdateVenueRequestAction,
  UpdateVenueSuccessAction,
  UpdateVenueFailureAction,
  // Cache Venues
  CacheVenuesAction,
  // Venue Fields
  SetVenueAction,
  AddVenueImageUrlAction,
  RemoveVenueImageUrlAction,
  SetVenueAddressAction,
} from "../actions/venue.actions";
import UrlParams from "../../models/interfaces/UrlParams";
import venueState from "../../models/states/venue.state";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import IAddress from "@sellout/models/.dist/interfaces/IAddress";

export const NEW_VENUE_ID: string = "new";

export interface IVenueCache {
  [venueId: string]: IVenue;
}

export type VenueReducerState = {
  venueId: string;
  venuesCache: IVenueCache;
  saving: boolean;
  errorMsg: string;
};

function venueReducerState(): VenueReducerState {
  const { query } = UrlUtil.parse(window.location.toString());
  const { venueId = "" }: UrlParams = query;

  return {
    venueId,
    venuesCache: {
      [NEW_VENUE_ID]: venueState(),
    },
    saving: false,
    errorMsg: "",
  };
}

export default function reducer(
  state = venueReducerState(),
  action: VenueActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    /********************************************************************************
     *  General Venue Reducers
     *******************************************************************************/

    case VenueActionTypes.SET_VENUE_ID:
      return setVenueId(state, payload as SetVenueIdAction["payload"]);

    /********************************************************************************
     *  Venue Sagas
     *******************************************************************************/

    case VenueActionTypes.CREATE_VENUE_REQUEST:
      return createVenueRequest(
        state
        // payload as CreateVenueRequestAction["payload"]
      );

    case VenueActionTypes.CREATE_VENUE_SUCCESS:
      return createVenueSuccess(
        state,
        payload as CreateVenueSuccessAction["payload"]
      );

    case VenueActionTypes.CREATE_VENUE_FAILURE:
      return createVenueFailure(
        state,
        payload as CreateVenueFailureAction["payload"]
      );

    case VenueActionTypes.UPDATE_VENUE_REQUEST:
      return updateVenueRequest(
        state
        // payload as UpdateVenueRequestAction["payload"]
      );

    case VenueActionTypes.UPDATE_VENUE_SUCCESS:
      return updateVenueSuccess(
        state,
        payload as UpdateVenueSuccessAction["payload"]
      );

    case VenueActionTypes.UPDATE_VENUE_FAILURE:
      return updateVenueFailure(
        state,
        payload as UpdateVenueFailureAction["payload"]
      );

    /********************************************************************************
     *  Venue Cache
     *******************************************************************************/

    case VenueActionTypes.CACHE_VENUES:
      return cacheVenues(state, payload as CacheVenuesAction["payload"]);

    /********************************************************************************
     *  Venue Fields
     *******************************************************************************/

    case VenueActionTypes.SET_VENUE:
      return setVenue(state, payload as SetVenueAction["payload"]);

    case VenueActionTypes.ADD_VENUE_IMAGE_URL:
      return addVenueImageUrl(
        state,
        payload as AddVenueImageUrlAction["payload"]
      );

    case VenueActionTypes.REMOVE_VENUE_IMAGE_URL:
      return removeVenueImageUrl(
        state,
        payload as RemoveVenueImageUrlAction["payload"]
      );

    case VenueActionTypes.SET_VENUE_ADDRESS:
      return setVenueAddress(
        state,
        payload as SetVenueAddressAction["payload"]
      );

    default:
      return state;
  }
}

/********************************************************************************
 *  Set Venue ID
 *******************************************************************************/

function setVenueId(
  state: VenueReducerState,
  { venueId, replace = false }: { venueId: string; replace?: boolean }
): VenueReducerState {
  UrlUtil.setQueryString({ venueId }, replace);

  return {
    ...state,
    venueId,
  };
}

/********************************************************************************
 *  Venue Sagas
 *******************************************************************************/

function createVenueRequest(state: VenueReducerState): VenueReducerState {
  return {
    ...state,
    saving: true,
  };
}

function createVenueSuccess(
  state: VenueReducerState,
  { venue }: { venue: IVenue }
): VenueReducerState {
  state = { ...state };
  const venueId = venue._id as string;

  state.saving = false;
  state.venuesCache[venueId] = venue;
  state.venuesCache[NEW_VENUE_ID] = venueState();
  state.venueId = venueId;
  return state;
}

function createVenueFailure(
  state: VenueReducerState,
  { errorMsg }: { errorMsg: string }
): VenueReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  };
}

function updateVenueRequest(state: VenueReducerState): VenueReducerState {
  return {
    ...state,
    saving: true,
  };
}

function updateVenueSuccess(
  state: VenueReducerState,
  { venue }: { venue: IVenue }
): VenueReducerState {
  state = { ...state };
  const venueId = venue._id as string;

  state.saving = false;
  state.venuesCache[venueId] = venue;
  state.venuesCache[NEW_VENUE_ID] = venueState();
  return state;
}

function updateVenueFailure(
  state: VenueReducerState,
  { errorMsg }: { errorMsg: string }
): VenueReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  };
}

/********************************************************************************
 *  Cache Venues
 *******************************************************************************/

function cacheVenues(
  state: VenueReducerState,
  { venues }: { venues: IVenue[] }
): VenueReducerState {
  return {
    ...state,
    venuesCache: ReduxUtil.makeCache(venues, "_id", state.venuesCache),
  };
}

/********************************************************************************
 *  Venue Fields
 *******************************************************************************/

function setVenue(
  state: VenueReducerState,
  { venueId, venue }: { venueId?: string; venue: Partial<IVenue> }
): VenueReducerState {
  state = { 
    ...state,
    errorMsg: '',
  };

  state.venuesCache[venueId as string] = {
    ...state.venuesCache[venueId as string],
    ...venue,
  };

  return state;
}

/************************************************************
 *  Add Venue Image Url
 ***********************************************************/

function addVenueImageUrl(
  state: VenueReducerState,
  {
    venueId,
    imageUrl,
  }: { venueId: string; imageUrl: string }
): VenueReducerState {
  const venue = { ...state.venuesCache[venueId] };
  const imageUrls = [...venue.imageUrls || [], imageUrl];
  return setVenue(state, { venueId, venue: { imageUrls } });
}

/************************************************************
 *  Remove Venue Image Url
 ***********************************************************/

function removeVenueImageUrl(
  state: VenueReducerState,
  {
    venueId,
    imageUrl,
  }: { venueId: string; imageUrl: string }
): VenueReducerState {
  const venue = { ...state.venuesCache[venueId] };
  const imageUrls = venue?.imageUrls?.filter(
    (stateImageUrl: string) => stateImageUrl !== imageUrl
  );
  return setVenue(state, { venueId, venue: { imageUrls } });
}

/************************************************************
 *  Set PressKit Description
 ***********************************************************/

function setVenueAddress(
  state: VenueReducerState,
  {
    venueId,
    address,
  }: { venueId: string; address: Partial<IAddress> }
): VenueReducerState {
  const venue = { ...state.venuesCache[venueId] };
  venue.address = {
    ...venue.address,
    ...address,
  };
  return setVenue(state, { venue: { address } });
}
