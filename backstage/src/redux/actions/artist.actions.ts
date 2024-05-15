import IArtist from "@sellout/models/.dist/interfaces/IArtist";

export const ArtistActionTypes = {
  // Artist Id
  SET_ARTIST_ID: "SET_ARTIST_ID",
  // Save Artist
  SAVE_ARTIST: 'SAVE_ARTIST',
  NAVIGATE_TO_PREVIOUS_STEP: 'NAVIGATE_TO_PREVIOUS_STEP',
  // Create Artist Modal
  CREATE_HEADLINING_ARTIST: 'CREATE_HEADLINING_ARTIST',
  CREATE_OPENING_ARTIST: 'CREATE_OPENING_ARTIST',
  // Create Artist
  CREATE_ARTIST_REQUEST: "CREATE_ARTIST_REQUEST",
  CREATE_ARTIST_SUCCESS: "CREATE_ARTIST_SUCCESS",
  CREATE_ARTIST_FAILURE: "CREATE_ARTIST_FAILURE",
  // Update Artist
  UPDATE_ARTIST_REQUEST: "UPDATE_ARTIST_REQUEST",
  UPDATE_ARTIST_SUCCESS: "UPDATE_ARTIST_SUCCESS",
  UPDATE_ARTIST_FAILURE: "UPDATE_ARTIST_FAILURE",
  // Cache Artists
  CACHE_ARTISTS: "CACHE_ARTISTS",
  RE_CACHE_ARTIST: "RE_CACHE_ARTIST",
  // Artist Fields
  SET_ARTIST: 'SET_ARTIST',
  SET_ARTIST_NAME: 'SET_ARTIST_NAME',
  // Press Kit Fields
  ADD_PRESS_KIT_IMAGE_URL: 'ADD_PRESS_KIT_IMAGE_URL',
  REMOVE_PRESS_KIT_IMAGE_URL: 'REMOVE_PRESS_KIT_IMAGE_URL',
  SET_PRESS_KIT_DESCRIPTION: 'SET_PRESS_KIT_DESCRIPTION'
};

/********************************************************************************
 *  Artist Action Creators
 *******************************************************************************/

 export type ArtistActionCreatorTypes =
   // Artist Id
   | SetArtistIdAction
   // Save Artist
   | SaveArtistAction
   | NavigateToPreviousStepAction
   | CreateHeadliningArtistAction
   | CreateOpeningArtistAction
   // Create Artist
   | CreateArtistRequestAction
   | CreateArtistSuccessAction
   | CreateArtistFailureAction
   // Update Artist
   | UpdateArtistRequestAction
   | UpdateArtistSuccessAction
   | UpdateArtistFailureAction
   // Cache Artists
   | CacheArtistsAction
   | ReCacheArtistAction
   // Artist Fields
   | SetArtistAction
   | SetArtistNameAction
   // Press Kit Fields
   | AddPressKitImageUrlAction
   | RemovePressKitImageUrlAction
   | SetPressKitDescriptionAction;

 /********************************************************************************
 *  Set Artist ID
 *******************************************************************************/

export interface SetArtistIdAction {
  type: typeof ArtistActionTypes.SET_ARTIST_ID;
  payload: {
    artistId: string,
  };
}

export function setArtistId(artistId: string): SetArtistIdAction {
  return {
    type: ArtistActionTypes.SET_ARTIST_ID,
    payload: {
      artistId
    }
  };
}

/********************************************************************************
 *  Save Artist
 *******************************************************************************/

export interface SaveArtistAction {
  type: typeof ArtistActionTypes.SAVE_ARTIST;
  payload: {
    forward: boolean;
    next?: boolean;
  };
}

export function saveArtist(forward: boolean = true, next: boolean = false): SaveArtistAction {
  return {
    type: ArtistActionTypes.SAVE_ARTIST,
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
  type: typeof ArtistActionTypes.NAVIGATE_TO_PREVIOUS_STEP;
  payload: {};
}

export function navigateToPreviousStep(): NavigateToPreviousStepAction {
  return {
    type: ArtistActionTypes.NAVIGATE_TO_PREVIOUS_STEP,
    payload: {},
  };
}

/********************************************************************************
 *  Create Headlining Artist
 *******************************************************************************/

export interface CreateHeadliningArtistAction {
  type: typeof ArtistActionTypes.CREATE_HEADLINING_ARTIST;
  payload: {};
}

export function createHeadliningArtist(): CreateHeadliningArtistAction {
  return {
    type: ArtistActionTypes.CREATE_HEADLINING_ARTIST,
    payload: {},
  };
}

/********************************************************************************
 *  Create Opening Artist
 *******************************************************************************/

export interface CreateOpeningArtistAction {
  type: typeof ArtistActionTypes.CREATE_OPENING_ARTIST;
  payload: {};
}

export function createOpeningArtist(): CreateOpeningArtistAction {
  return {
    type: ArtistActionTypes.CREATE_OPENING_ARTIST,
    payload: {},
  };
}


/********************************************************************************
 *  Create Artist
 *******************************************************************************/

// Request

export interface CreateArtistRequestAction {
  type: typeof ArtistActionTypes.CREATE_ARTIST_REQUEST;
  payload: {};
}

export function createArtistRequest(): CreateArtistRequestAction {
  return {
    type: ArtistActionTypes.CREATE_ARTIST_REQUEST,
    payload: {},
  };
}

// Success

export interface CreateArtistSuccessAction {
  type: typeof ArtistActionTypes.CREATE_ARTIST_SUCCESS;
  payload: {
    artist: IArtist;
  };
}

export function createArtistSuccess(artist: IArtist): CreateArtistSuccessAction {
  return {
    type: ArtistActionTypes.CREATE_ARTIST_SUCCESS,
    payload: {
      artist,
    },
  };
}

// Failure

export interface CreateArtistFailureAction {
  type: typeof ArtistActionTypes.CREATE_ARTIST_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createArtistFailure(errorMsg: string): CreateArtistFailureAction {
  return {
    type: ArtistActionTypes.CREATE_ARTIST_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Update Artist
 *******************************************************************************/

// Request

export interface UpdateArtistRequestAction {
  type: typeof ArtistActionTypes.UPDATE_ARTIST_REQUEST;
  payload: {};
}

export function updateArtistRequest(): UpdateArtistRequestAction {
  return {
    type: ArtistActionTypes.UPDATE_ARTIST_REQUEST,
    payload: {},
  };
}

// Success

export interface UpdateArtistSuccessAction {
  type: typeof ArtistActionTypes.UPDATE_ARTIST_SUCCESS;
  payload: {
    artist: IArtist;
  };
}

export function updateArtistSuccess(artist: IArtist): UpdateArtistSuccessAction {
  return {
    type: ArtistActionTypes.UPDATE_ARTIST_SUCCESS,
    payload: {
      artist,
    },
  };
}

// Failure

export interface UpdateArtistFailureAction {
  type: typeof ArtistActionTypes.UPDATE_ARTIST_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function updateArtistFailure(errorMsg: string): UpdateArtistFailureAction {
  return {
    type: ArtistActionTypes.UPDATE_ARTIST_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Cache Artists
 *******************************************************************************/

export interface CacheArtistsAction {
  type: typeof ArtistActionTypes.CACHE_ARTISTS;
  payload: {
    artists: IArtist[]
  };
}

export function cacheArtists(artists: IArtist[]): CacheArtistsAction {
  return {
    type: ArtistActionTypes.CACHE_ARTISTS,
    payload: {
      artists,
    }
  };
}

/********************************************************************************
 *  Re-cache Artist
 *******************************************************************************/

export interface ReCacheArtistAction {
  type: typeof ArtistActionTypes.RE_CACHE_ARTIST;
  payload: {
    artistId: string;
  };
}

export function reCacheArtist(artistId: string): ReCacheArtistAction {
  return {
    type: ArtistActionTypes.RE_CACHE_ARTIST,
    payload: {
      artistId,
    },
  };
}

/********************************************************************************
 *  Artist Fields
 *******************************************************************************/

 export interface SetArtistAction {
   type: typeof ArtistActionTypes.SET_ARTIST;
   payload: {
     artistId: string;
     artist: Partial<IArtist>;
   };
 }

 export function setArtist(
   artistId: string,
   artist: Partial<IArtist>,
 ): SetArtistAction {
   return {
     type: ArtistActionTypes.SET_ARTIST,
     payload: {
       artistId,
       artist,
     },
   };
 }

/************************************************************
 *  Artist Name
 ***********************************************************/
export interface SetArtistNameAction {
  type: typeof ArtistActionTypes.SET_ARTIST_NAME;
  payload: {
    artistId: string;
    name: string;
  };
}

export function setArtistName(
  artistId: string,
  name: string
): SetArtistNameAction {
  return {
    type: ArtistActionTypes.SET_ARTIST_NAME,
    payload: {
      artistId,
      name,
    },
  };
}

/********************************************************************************
 *  Press Kit Fields
 *******************************************************************************/

 /************************************************************
 Press Kit Add Headlining Artist
 ***********************************************************/

export interface AddPressKitImageUrlAction {
  type: typeof ArtistActionTypes.ADD_PRESS_KIT_IMAGE_URL;
  payload: {
    artistId: string;
    pressKitId: string;
    imageUrl: string;
  };
}

export function addPressKitImageUrl(
  artistId: string,
  pressKitId: string,
  imageUrl: string,
): AddPressKitImageUrlAction {
  return {
    type: ArtistActionTypes.ADD_PRESS_KIT_IMAGE_URL,
    payload: {
      artistId,
      pressKitId,
      imageUrl,
    },
  };
}

/************************************************************
 Press Kit Remove Headlining Artist
 ***********************************************************/

export interface RemovePressKitImageUrlAction {
  type: typeof ArtistActionTypes.REMOVE_PRESS_KIT_IMAGE_URL;
  payload: {
    artistId: string;
    pressKitId: string;
    imageUrl: string;
  };
}

export function removePressKitImageUrl(
  artistId: string,
  pressKitId: string,
  imageUrl: string
): RemovePressKitImageUrlAction {
  return {
    type: ArtistActionTypes.REMOVE_PRESS_KIT_IMAGE_URL,
    payload: {
      artistId,
      pressKitId,
      imageUrl,
    },
  };
}

/************************************************************
 Press Kit Description
 ***********************************************************/

export interface SetPressKitDescriptionAction {
  type: typeof ArtistActionTypes.SET_PRESS_KIT_DESCRIPTION;
  payload: {
    artistId: string;
    pressKitId: string;
    description: string;
  };
}

export function setPressKitDescription(
  artistId: string,
  pressKitId: string,
  description: string
): SetPressKitDescriptionAction {
  return {
    type: ArtistActionTypes.SET_PRESS_KIT_DESCRIPTION,
    payload: {
      artistId,
      pressKitId,
      description,
    },
  };
}