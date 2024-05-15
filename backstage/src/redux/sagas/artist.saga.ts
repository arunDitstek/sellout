import { all, takeLatest, select, call, put } from "redux-saga/effects";
import { ArtistActionTypes } from "../actions/artist.actions";
import client from "../../graphql/client";
import GET_ARTIST from "@sellout/models/.dist/graphql/queries/artist.query";
import LIST_ARTISTS from "@sellout/models/.dist/graphql/queries/artists.query";
import CREATE_ARTIST from "@sellout/models/.dist/graphql/mutations/createArtist.mutation";
import UPDATE_ARTIST from "@sellout/models/.dist/graphql/mutations/updateArtist.mutation";
import { BackstageState } from "../store";
import * as AppActions from "../actions/app.actions";
import * as ArtistActions from "../actions/artist.actions";
import * as EventActions from "../actions/event.actions";
import * as ErrorUtil from "@sellout/ui/build/utils/ErrorUtil";
import * as RemoveUtil from "../../utils/RemoveUtil";
import * as ChangeUtil from "../../utils/ChangeUtil";
import { ArtistReducerState } from "../reducers/artist.reducer";
import IArtist from "@sellout/models/.dist/interfaces/IArtist";
import IPerformance from "@sellout/models/.dist/interfaces/IPerformance";
import history from "../../utils/history";
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import { EventReducerState } from "../reducers/event.reducer";

export default function* artistSaga() {
  try {
    yield all([
      saveArtistWatch(),
      createHeadliningArtistWatch(),
      createOpeningArtistWatch(),
      navigateToPreviousStepWatch(),
      reCacheArtistWatch(),
      createArtistRequestWatch(),
      updateArtistRequestWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

function cleanArtist(artist: any): IArtist {
  artist = RemoveUtil.removeEmpty(artist);
  artist = RemoveUtil.removeField(artist, "_id", (_id) => _id === "");
  delete artist.createdAt;
  delete artist.metrics;
  return artist;
}

const CREATE_ARTIST_ROUTES = [
  "/admin/dashboard/performers/create/details",
  // "/admin/dashboard/performers/create/genres",
  // "/admin/dashboard/performers/create/social",
  // "/admin/dashboard/performers/create/contacts",
];

/********************************************************************************
 *  Navigation
 *******************************************************************************/

const nextRoute = (direction: number): string | null => {
  const { location } = history;
  const index = CREATE_ARTIST_ROUTES.findIndex(
    (route) => route === location.pathname
  );
  if (typeof index === undefined) return null;
  const nextIndex = index + direction;
  if (!CREATE_ARTIST_ROUTES[nextIndex]) return null;
  return CREATE_ARTIST_ROUTES[nextIndex] + location.search;
};

/************************************************************
 *  Previous Step
 ***********************************************************/

function* navigateToPreviousStepWatch() {
  yield takeLatest(ArtistActionTypes.NAVIGATE_TO_PREVIOUS_STEP, navigateToPreviousStepSaga);
}

function navigateToPreviousStepSaga(
  action: ArtistActions.NavigateToPreviousStepAction
) {
  const route = nextRoute(-1);
  if (route) {
    history.push(route);
  }
}

/********************************************************************************
 *  Artist Caching
 *******************************************************************************/
function* reCacheArtistWatch() {
  yield takeLatest(ArtistActionTypes.RE_CACHE_ARTIST, reCacheArtistSaga);
}

function* reCacheArtistSaga(action: ArtistActions.ReCacheArtistAction) {
  const { artistId }: { artistId: string } = action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_ARTIST,
        variables: {
          artistId,
        },
      });
    });

    const { artist }: { artist: IArtist } = res.data;

    yield put(ArtistActions.cacheArtists([artist]));
  } catch (error) {
    // HANDLE ERROR

    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(ArtistActions.createArtistFailure(errorMsg));
  }
}

/********************************************************************************
 *  Save Artist
 *******************************************************************************/

function* saveArtistWatch() {
  yield takeLatest(ArtistActionTypes.SAVE_ARTIST, saveArtistSaga);
}

function* saveArtistSaga(action: ArtistActions.SaveArtistAction) {
  const {
    forward,
    next,
  }: { forward: boolean, next?: boolean } = action.payload;

  const { nextUrl }: ISaveChanges = yield select(
    (state: BackstageState) => state.app.saveChanges
  );

  const artistState: ArtistReducerState = yield select(
    (state: BackstageState) => state.artist
  );
  const { artistId, artistsCache } = artistState;
  const artist = artistsCache[artistId];

  if (forward) {
    const route = nextRoute(1);
    if (route) {
      history.push(route);
    }
  }

  if (next && nextUrl) {
    history.replace(nextUrl);
  }

  const hasChanged = yield ChangeUtil.hasArtistChanged(artist);

  console.log(artist);

  if (hasChanged) {
    if (artist.createdAt) {
      yield put(ArtistActions.updateArtistRequest());
    } else {
      yield put(ArtistActions.createArtistRequest());
    }

    // HANDLE ERROR
    yield takeLatest(
      [
        ArtistActionTypes.CREATE_ARTIST_SUCCESS,
        ArtistActionTypes.UPDATE_ARTIST_SUCCESS,
      ],
      function* (action: ArtistActions.CreateArtistSuccessAction) {
        const artistId = action.payload.artist._id;
        UrlUtil.setQueryString({ artistId }, true);
      }
    );
  }
}

/********************************************************************************
 *  Create Headlining Artist
 *******************************************************************************/

function* createHeadliningArtistWatch() {
  yield takeLatest(ArtistActionTypes.CREATE_HEADLINING_ARTIST, createHeadliningArtistSaga);
}

function* createHeadliningArtistSaga() {
  const artistState: ArtistReducerState = yield select(
    (state: BackstageState) => state.artist
  );

  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );

  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  yield put(ArtistActions.createArtistRequest());

  // HANDLE ERROR
  yield takeLatest(
    [
      ArtistActionTypes.CREATE_ARTIST_SUCCESS,
    ],
    function* (action: ArtistActions.CreateArtistSuccessAction) {
      const { payload: { artist} } = action;
      const performance: IPerformance = event?.performances?.[0] as IPerformance;
      const artistId = artist._id;
      yield put(AppActions.popModal());
      yield put(ArtistActions.setArtistId(''));
      yield put(EventActions.addPerformanceHeadliningArtist(
        eventId,
        performance._id,
        artistId as string,
      ));
    }
  );
}

/********************************************************************************
 *  Create Opening Artist
 *******************************************************************************/

function* createOpeningArtistWatch() {
  yield takeLatest(ArtistActionTypes.CREATE_OPENING_ARTIST, createOpeningArtistSaga);
}

function* createOpeningArtistSaga() {
  const artistState: ArtistReducerState = yield select(
    (state: BackstageState) => state.artist
  );

  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );

  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  yield put(ArtistActions.createArtistRequest());

  // HANDLE ERROR
  yield takeLatest(
    [
      ArtistActionTypes.CREATE_ARTIST_SUCCESS,
    ],
    function* (action: ArtistActions.CreateArtistSuccessAction) {
      const performance: IPerformance = event?.performances?.[0] as IPerformance;
      const artistId = action.payload.artist._id;
      yield put(AppActions.popModal());
      yield put(ArtistActions.setArtistId(''));
      yield put(EventActions.addPerformanceOpeningArtist(
        eventId,
        performance._id,
        artistId as string,
      ));
    }
  );
}

/********************************************************************************
 *  Create Artist
 *******************************************************************************/

function* createArtistRequestWatch() {
  yield takeLatest(
    ArtistActionTypes.CREATE_ARTIST_REQUEST,
    createArtistRequestSaga
  );
}

function* createArtistRequestSaga(
  action: ArtistActions.CreateArtistRequestAction
) {
  const artistState: ArtistReducerState = yield select(
    (state: BackstageState) => state.artist
  );
  const { artistId, artistsCache } = artistState;
  const artist = cleanArtist(artistsCache[artistId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: CREATE_ARTIST,
        variables: {
          artist,
        },
        refetchQueries: [{
          query: LIST_ARTISTS,
          variables: {
            query: {},
          },
        }],
      });
    });

    const { createArtist }: { createArtist: IArtist } = res.data;

    yield put(ArtistActions.createArtistSuccess(createArtist));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(ArtistActions.createArtistFailure(errorMsg));
  }
}

/********************************************************************************
 *  Update Artist
 *******************************************************************************/

function* updateArtistRequestWatch() {
  yield takeLatest(
    ArtistActionTypes.UPDATE_ARTIST_REQUEST,
    updateArtistRequestSaga
  );
}

function* updateArtistRequestSaga(
  action: ArtistActions.UpdateArtistRequestAction
) {
  const artistState: ArtistReducerState = yield select(
    (state: BackstageState) => state.artist
  );
  const { artistId, artistsCache } = artistState;
  const artist = cleanArtist(artistsCache[artistId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: UPDATE_ARTIST,
        variables: {
          artist,
        },
      });
    });

    const { updateArtist }: { updateArtist: IArtist } = res.data;

    yield put(ArtistActions.updateArtistSuccess(updateArtist));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(ArtistActions.updateArtistFailure(errorMsg));
  }
}
