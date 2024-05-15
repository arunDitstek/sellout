import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import IAddress from "@sellout/models/.dist/interfaces/IAddress";

export const VenueActionTypes = {
  // Venue Id
  SET_VENUE_ID: "SET_VENUE_ID",
  // Save Venue
  SAVE_VENUE: "SAVE_VENUE",
  NAVIGATE_TO_PREVIOUS_STEP: "NAVIGATE_TO_PREVIOUS_STEP",
  // Create Venue Modal
  CREATE_EVENT_VENUE: "CREATE_EVENT_VENUE",
  // Create Venue
  CREATE_VENUE_REQUEST: "CREATE_VENUE_REQUEST",
  CREATE_VENUE_SUCCESS: "CREATE_VENUE_SUCCESS",
  CREATE_VENUE_FAILURE: "CREATE_VENUE_FAILURE",
  // Update Venue
  UPDATE_VENUE_REQUEST: "UPDATE_VENUE_REQUEST",
  UPDATE_VENUE_SUCCESS: "UPDATE_VENUE_SUCCESS",
  UPDATE_VENUE_FAILURE: "UPDATE_VENUE_FAILURE",
  // Cache Venues
  CACHE_VENUES: "CACHE_VENUES",
  RE_CACHE_VENUE: "RE_CACHE_VENUE",
  // Venue Fields
  SET_VENUE: "SET_VENUE",
  ADD_VENUE_IMAGE_URL: "ADD_VENUE_IMAGE_URL",
  REMOVE_VENUE_IMAGE_URL: "REMOVE_VENUE_IMAGE_URL",
  SET_VENUE_ADDRESS: 'SET_VENUE_ADDRESS'
};

/********************************************************************************
 *  Venue Action Creators
 *******************************************************************************/

export type VenueActionCreatorTypes =
  // Venue Id
  | SetVenueIdAction
  // Save Venue
  | SaveVenueAction
  | NavigateToPreviousStepAction
  | CreateEventVenueAction
  // Create Venue
  | CreateVenueRequestAction
  | CreateVenueSuccessAction
  | CreateVenueFailureAction
  // Update Venue
  | UpdateVenueRequestAction
  | UpdateVenueSuccessAction
  | UpdateVenueFailureAction
  // Cache Venues
  | CacheVenuesAction
  | ReCacheVenueAction
  // Venue Fields
  | SetVenueAction
  | AddVenueImageUrlAction
  | RemoveVenueImageUrlAction
  | SetVenueAddressAction;

/********************************************************************************
 *  Set Venue ID
 *******************************************************************************/

export interface SetVenueIdAction {
  type: typeof VenueActionTypes.SET_VENUE_ID;
  payload: {
    venueId: string;
  };
}

export function setVenueId(venueId: string): SetVenueIdAction {
  return {
    type: VenueActionTypes.SET_VENUE_ID,
    payload: {
      venueId,
    },
  };
}

/********************************************************************************
 *  Save Venue
 *******************************************************************************/

export interface SaveVenueAction {
  type: typeof VenueActionTypes.SAVE_VENUE;
  payload: {
    forward: boolean;
    next?: boolean;
  };
}

export function saveVenue(
  forward: boolean = true,
  next: boolean = false
): SaveVenueAction {
  return {
    type: VenueActionTypes.SAVE_VENUE,
    payload: {
      forward,
      next,
    },
  };
}

/********************************************************************************
 *  Navigate To Previous Step
 *******************************************************************************/

export interface NavigateToPreviousStepAction {
  type: typeof VenueActionTypes.NAVIGATE_TO_PREVIOUS_STEP;
  payload: {};
}

export function navigateToPreviousStep(): NavigateToPreviousStepAction {
  return {
    type: VenueActionTypes.NAVIGATE_TO_PREVIOUS_STEP,
    payload: {},
  };
}

/********************************************************************************
 *  Create Event Venue
 *******************************************************************************/

export interface CreateEventVenueAction {
  type: typeof VenueActionTypes.CREATE_EVENT_VENUE;
  payload: {};
}

export function createEventVenue(): CreateEventVenueAction {
  return {
    type: VenueActionTypes.CREATE_EVENT_VENUE,
    payload: {},
  };
}

/********************************************************************************
 *  Create Venue
 *******************************************************************************/

// Request

export interface CreateVenueRequestAction {
  type: typeof VenueActionTypes.CREATE_VENUE_REQUEST;
  payload: {};
}

export function createVenueRequest(): CreateVenueRequestAction {
  return {
    type: VenueActionTypes.CREATE_VENUE_REQUEST,
    payload: {},
  };
}

// Success

export interface CreateVenueSuccessAction {
  type: typeof VenueActionTypes.CREATE_VENUE_SUCCESS;
  payload: {
    venue: IVenue;
  };
}

export function createVenueSuccess(
  venue: IVenue
): CreateVenueSuccessAction {
  return {
    type: VenueActionTypes.CREATE_VENUE_SUCCESS,
    payload: {
      venue,
    },
  };
}

// Failure

export interface CreateVenueFailureAction {
  type: typeof VenueActionTypes.CREATE_VENUE_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createVenueFailure(
  errorMsg: string
): CreateVenueFailureAction {
  return {
    type: VenueActionTypes.CREATE_VENUE_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Update Venue
 *******************************************************************************/

// Request

export interface UpdateVenueRequestAction {
  type: typeof VenueActionTypes.UPDATE_VENUE_REQUEST;
  payload: {};
}

export function updateVenueRequest(): UpdateVenueRequestAction {
  return {
    type: VenueActionTypes.UPDATE_VENUE_REQUEST,
    payload: {},
  };
}

// Success

export interface UpdateVenueSuccessAction {
  type: typeof VenueActionTypes.UPDATE_VENUE_SUCCESS;
  payload: {
    venue: IVenue;
  };
}

export function updateVenueSuccess(
  venue: IVenue
): UpdateVenueSuccessAction {
  return {
    type: VenueActionTypes.UPDATE_VENUE_SUCCESS,
    payload: {
      venue,
    },
  };
}

// Failure

export interface UpdateVenueFailureAction {
  type: typeof VenueActionTypes.UPDATE_VENUE_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function updateVenueFailure(
  errorMsg: string
): UpdateVenueFailureAction {
  return {
    type: VenueActionTypes.UPDATE_VENUE_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Cache Venues
 *******************************************************************************/

export interface CacheVenuesAction {
  type: typeof VenueActionTypes.CACHE_VENUES;
  payload: {
    venues: IVenue[];
  };
}

export function cacheVenues(venues: IVenue[]): CacheVenuesAction {
  return {
    type: VenueActionTypes.CACHE_VENUES,
    payload: {
      venues,
    },
  };
}

/********************************************************************************
 *  Re-cache Venue
 *******************************************************************************/

export interface ReCacheVenueAction {
  type: typeof VenueActionTypes.RE_CACHE_VENUE;
  payload: {
    venueId: string;
  };
}

export function reCacheVenue(venueId: string): ReCacheVenueAction {
  return {
    type: VenueActionTypes.RE_CACHE_VENUE,
    payload: {
      venueId,
    },
  };
}

/********************************************************************************
 *  Venue Fields
 *******************************************************************************/

export interface SetVenueAction {
  type: typeof VenueActionTypes.SET_VENUE;
  payload: {
    venueId: string;
    venue: Partial<IVenue>;
  };
}

export function setVenue(
  venueId: string,
  venue: Partial<IVenue>
): SetVenueAction {
  return {
    type: VenueActionTypes.SET_VENUE,
    payload: {
      venueId,
      venue,
    },
  };
}

/************************************************************
 Add Image Url
 ***********************************************************/

export interface AddVenueImageUrlAction {
  type: typeof VenueActionTypes.ADD_VENUE_IMAGE_URL;
  payload: {
    venueId: string;
    imageUrl: string;
  };
}

export function addVenueImageUrl(
  venueId: string,
  imageUrl: string
): AddVenueImageUrlAction {
  return {
    type: VenueActionTypes.ADD_VENUE_IMAGE_URL,
    payload: {
      venueId,
      imageUrl,
    },
  };
}

/************************************************************
 Remove Image Url
 ***********************************************************/

export interface RemoveVenueImageUrlAction {
  type: typeof VenueActionTypes.REMOVE_VENUE_IMAGE_URL;
  payload: {
    venueId: string;
    imageUrl: string;
  };
}

export function removeVenueImageUrl(
  venueId: string,
  imageUrl: string
): RemoveVenueImageUrlAction {
  return {
    type: VenueActionTypes.REMOVE_VENUE_IMAGE_URL,
    payload: {
      venueId,
      imageUrl,
    },
  };
}

/************************************************************
 Address
 ***********************************************************/

export interface SetVenueAddressAction {
  type: typeof VenueActionTypes.SET_VENUE_ADDRESS;
  payload: {
    venueId: string;
    address: Partial<IAddress>;
  };
}

export function setPressKitDescription(
  venueId: string,
  address: Partial<IAddress>
): SetVenueAddressAction {
  return {
    type: VenueActionTypes.SET_VENUE_ADDRESS,
    payload: {
      venueId,
      address,
    },
  };
}
