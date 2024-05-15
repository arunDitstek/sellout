import IArtist from "@sellout/models/.dist/interfaces/IArtist";
import IPressKit from "@sellout/models/.dist/interfaces/IArtistPressKit";
import {
  ArtistActionTypes,
  ArtistActionCreatorTypes,
  // Artist Id
  SetArtistIdAction,
  // Sagas
  // CreateArtistRequestAction,
  CreateArtistSuccessAction,
  CreateArtistFailureAction,
  // UpdateArtistRequestAction,
  UpdateArtistSuccessAction,
  UpdateArtistFailureAction,
  // Cache Artists
  CacheArtistsAction,
  // Artist Fields
  SetArtistAction,
  SetArtistNameAction,
  // Press Kit Fields
  AddPressKitImageUrlAction,
  RemovePressKitImageUrlAction,
  SetPressKitDescriptionAction,
} from "../actions/artist.actions";
import UrlParams from "../../models/interfaces/UrlParams";
import artistState from "../../models/states/artist.state";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";

export const NEW_ARTIST_ID: string = "new";

export interface IArtistCache {
  [artistId: string]: IArtist;
}

export type ArtistReducerState = {
  artistId: string;
  artistsCache: IArtistCache;
  saving: boolean;
  errorMsg: string;
};

function artistReducerState(): ArtistReducerState {
  const { query } = UrlUtil.parse(window.location.toString());
  const { artistId = '' }: UrlParams = query;

  return {
    artistId,
    artistsCache: {
      [NEW_ARTIST_ID]: artistState(),
    },
    saving: false,
    errorMsg: "",
  };
}

export default function reducer(
  state = artistReducerState(),
  action: ArtistActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    /********************************************************************************
     *  General Artist Reducers
     *******************************************************************************/

    case ArtistActionTypes.SET_ARTIST_ID:
      return setArtistId(state, payload as SetArtistIdAction["payload"]);

    /********************************************************************************
     *  Artist Sagas
     *******************************************************************************/

    case ArtistActionTypes.CREATE_ARTIST_REQUEST:
      return createArtistRequest(
        state
        // payload as CreateArtistRequestAction["payload"]
      );

    case ArtistActionTypes.CREATE_ARTIST_SUCCESS:
      return createArtistSuccess(
        state,
        payload as CreateArtistSuccessAction["payload"]
      );

    case ArtistActionTypes.CREATE_ARTIST_FAILURE:
      return createArtistFailure(
        state,
        payload as CreateArtistFailureAction["payload"]
      );

    case ArtistActionTypes.UPDATE_ARTIST_REQUEST:
      return updateArtistRequest(
        state
        // payload as UpdateArtistRequestAction["payload"]
      );

    case ArtistActionTypes.UPDATE_ARTIST_SUCCESS:
      return updateArtistSuccess(
        state,
        payload as UpdateArtistSuccessAction["payload"]
      );

    case ArtistActionTypes.UPDATE_ARTIST_FAILURE:
      return updateArtistFailure(
        state,
        payload as UpdateArtistFailureAction["payload"]
      );

    /********************************************************************************
     *  Artist Cache
     *******************************************************************************/

    case ArtistActionTypes.CACHE_ARTISTS:
      return cacheArtists(state, payload as CacheArtistsAction["payload"]);

    /********************************************************************************
     *  Artist Fields
     *******************************************************************************/

    case ArtistActionTypes.SET_ARTIST:
      return setArtist(state, payload as SetArtistAction["payload"]);

    case ArtistActionTypes.SET_ARTIST_NAME:
      return setArtistName(state, payload as SetArtistNameAction["payload"]);

    /********************************************************************************
     *  Press Kit Fields
     *******************************************************************************/

    case ArtistActionTypes.ADD_PRESS_KIT_IMAGE_URL:
      return addPressKitImageUrl(
        state,
        payload as AddPressKitImageUrlAction["payload"]
      );

    case ArtistActionTypes.REMOVE_PRESS_KIT_IMAGE_URL:
      return removePressKitImageUrl(
        state,
        payload as RemovePressKitImageUrlAction["payload"]
      );

    case ArtistActionTypes.SET_PRESS_KIT_DESCRIPTION:
      return setPressKitDescription(
        state,
        payload as SetPressKitDescriptionAction["payload"]
      );

    default:
      return state;
  }
}

/********************************************************************************
 *  Set Artist ID
 *******************************************************************************/

function setArtistId(
  state: ArtistReducerState,
  { artistId, replace = false }: { artistId: string; replace?: boolean }
): ArtistReducerState {
  UrlUtil.setQueryString({ artistId }, replace);

  return {
    ...state,
    artistId,
  };
}

/********************************************************************************
 *  Artist Sagas
 *******************************************************************************/

function createArtistRequest(
  state: ArtistReducerState
): ArtistReducerState {  
  return {
    ...state,
    saving: true,
  }
}

function createArtistSuccess(
  state: ArtistReducerState,
  { artist }: { artist: IArtist }
): ArtistReducerState {
  state = { ...state };
  const artistId = artist._id as string;

  state.saving = false;
  state.artistsCache[artistId] = artist;
  state.artistsCache[NEW_ARTIST_ID] = artistState();
  state.artistId = artistId;
  return state;
}

function createArtistFailure(
  state: ArtistReducerState,
  { errorMsg }: { errorMsg: string }
): ArtistReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  }
}

function updateArtistRequest(
  state: ArtistReducerState
): ArtistReducerState {  
  return {
    ...state,
    saving: true,
  }
}

function updateArtistSuccess(
  state: ArtistReducerState,
  { artist }: { artist: IArtist }
): ArtistReducerState {
  state = { ...state };
  const artistId = artist._id as string;

  state.saving = false;
  state.artistsCache[artistId] = artist;
  state.artistsCache[NEW_ARTIST_ID] = artistState();
  return state;
}

function updateArtistFailure(
  state: ArtistReducerState,
  { errorMsg }: { errorMsg: string }
): ArtistReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  }
}

/********************************************************************************
 *  Cache Artists
 *******************************************************************************/

function cacheArtists(
  state: ArtistReducerState,
  { artists }: { artists: IArtist[] }
): ArtistReducerState {
  return {
    ...state,
    artistsCache: ReduxUtil.makeCache(artists, "_id", state.artistsCache),
  };
}

/********************************************************************************
 *  Artist Fields
 *******************************************************************************/

function setArtist(
  state: ArtistReducerState,
  { artistId, artist }: { artistId?: string; artist: Partial<IArtist> }
): ArtistReducerState {
  state = { 
    ...state,
    errorMsg: '',
   };

  state.artistsCache[artistId as string] = {
    ...state.artistsCache[artistId as string],
    ...artist,
  };

  return state;
}

/************************************************************
 *  Artist Name
 ***********************************************************/

function setArtistName(
  state: ArtistReducerState,
  { artistId, name }: { artistId: string; name: string }
): ArtistReducerState {
  return setArtist(state, { artistId, artist: { name } });
}

/********************************************************************************
 *  Press Kit Fields
 *******************************************************************************/

function setPressKit(
  state: ArtistReducerState,
  {
    artistId,
    pressKitId,
    pressKit,
  }: {
    artistId: string;
    pressKitId: string;
    pressKit: Partial<IPressKit>;
  }
): ArtistReducerState {
  const artist = { ...state.artistsCache[artistId] };

  artist.pressKits = [...artist.pressKits]?.map((statePressKit: IPressKit) => {
    if (statePressKit._id === pressKitId) {
      return {
        ...statePressKit,
        ...pressKit,
      } as IPressKit;
    }

    return statePressKit;
  });

  return setArtist(state, { artistId, artist });
}

/************************************************************
 *  Add PressKit Headlining Artist
 ***********************************************************/

function addPressKitImageUrl(
  state: ArtistReducerState,
  {
    artistId,
    pressKitId,
    imageUrl,
  }: { artistId: string; pressKitId: string; imageUrl: string }
): ArtistReducerState {
  // const artist = { ...state.artistsCache[artistId] };
  // const pressKit = artist.pressKits?.find(
  //   (pressKit: IPressKit) => pressKit._id === pressKitId
  // );
  // const posterImageUrls = [...pressKit?.posterImageUrls, imageUrl];
  const posterImageUrls = [imageUrl];
  return setPressKit(state, {
    artistId,
    pressKitId,
    pressKit: { posterImageUrls },
  });
}

/************************************************************
 *  Remove PressKit Headlining Artist
 ***********************************************************/

function removePressKitImageUrl(
  state: ArtistReducerState,
  {
    artistId,
    pressKitId,
    imageUrl,
  }: { artistId: string; pressKitId: string; imageUrl: string }
): ArtistReducerState {
  const artist = { ...state.artistsCache[artistId] };

  const pressKit = artist.pressKits?.find(
    (pressKit: IPressKit) => pressKit._id === pressKitId
  );

  const posterImageUrls = pressKit?.posterImageUrls?.filter(
    (stateArtistId: string) => stateArtistId !== imageUrl
  );
  return setPressKit(state, {
    artistId,
    pressKitId,
    pressKit: { posterImageUrls },
  });
}


/************************************************************
 *  Set PressKit Description
 ***********************************************************/

function setPressKitDescription(
  state: ArtistReducerState,
  {
    artistId,
    pressKitId,
    description,
  }: { artistId: string; pressKitId: string; description: string }
): ArtistReducerState {
  return setPressKit(state, {
    artistId,
    pressKitId,
    pressKit: { description },
  });
}
