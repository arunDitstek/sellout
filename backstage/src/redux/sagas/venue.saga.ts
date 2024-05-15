import { all, takeLatest, select, call, put } from "redux-saga/effects";
import { VenueActionTypes } from "../actions/venue.actions";
import client from "../../graphql/client";
import GET_VENUE from "@sellout/models/.dist/graphql/queries/venue.query";
import LIST_VENUES from "@sellout/models/.dist/graphql/queries/venues.query";
import CREATE_VENUE from "@sellout/models/.dist/graphql/mutations/createVenue.mutation";
import UPDATE_VENUE from "@sellout/models/.dist/graphql/mutations/updateVenue.mutation";
import { BackstageState } from "../store";
import * as AppActions from "../actions/app.actions";
import * as VenueActions from "../actions/venue.actions";
import * as EventActions from "../actions/event.actions";
import * as ErrorUtil from "@sellout/ui/build/utils/ErrorUtil";
import * as RemoveUtil from "../../utils/RemoveUtil";
import * as ChangeUtil from "../../utils/ChangeUtil";
import { NEW_VENUE_ID, VenueReducerState } from "../reducers/venue.reducer";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import IPerformance from "@sellout/models/.dist/interfaces/IPerformance";
import history from "../../utils/history";
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import { EventReducerState } from "../reducers/event.reducer";
import venueState from "../../models/states/venue.state";

export default function* venueSaga() {
  try {
    yield all([
      saveVenueWatch(),
      createEventVenueWatch(),
      navigateToPreviousStepWatch(),
      reCacheVenueWatch(),
      createVenueRequestWatch(),
      updateVenueRequestWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

function cleanVenue(venue: any): IVenue {
  venue = RemoveUtil.removeEmpty(venue);
  venue = RemoveUtil.removeField(venue, "_id", (_id) => _id === "");
  venue = RemoveUtil.removeField(venue, "_id", (_id) => _id === NEW_VENUE_ID);
  delete venue.createdAt;
  delete venue.metrics;
  delete venue?.address?.timezone;
  return venue;
}

const CREATE_VENUE_ROUTES = [
  "/admin/dashboard/venues/create/details",
];

/********************************************************************************
 *  Navigation
 *******************************************************************************/

const nextRoute = (direction: number): string | null => {
  const { location } = history;
  const index = CREATE_VENUE_ROUTES.findIndex(
    (route) => route === location.pathname
  );
  if (typeof index === undefined) return null;
  const nextIndex = index + direction;
  if (!CREATE_VENUE_ROUTES[nextIndex]) return null;
  return CREATE_VENUE_ROUTES[nextIndex] + location.search;
};

/************************************************************
 *  Previous Step
 ***********************************************************/

function* navigateToPreviousStepWatch() {
  yield takeLatest(VenueActionTypes.NAVIGATE_TO_PREVIOUS_STEP, navigateToPreviousStepSaga);
}

function navigateToPreviousStepSaga(
  action: VenueActions.NavigateToPreviousStepAction
) {
  const route = nextRoute(-1);
  if (route) {
    history.push(route);
  }
}

/********************************************************************************
 *  Venue Caching
 *******************************************************************************/
function* reCacheVenueWatch() {
  yield takeLatest(VenueActionTypes.RE_CACHE_VENUE, reCacheVenueSaga);
}

function* reCacheVenueSaga(action: VenueActions.ReCacheVenueAction) {
  const { venueId }: { venueId: string } = action.payload;
  try {
    let venue: IVenue;
    if (venueId === NEW_VENUE_ID) {
      venue = venueState();
    } else {
      const res = yield call(async () => {
        return await client.query({
          query: GET_VENUE,
          variables: {
            venueId,
          },
          fetchPolicy: 'network-only'
        });
      });
      venue = res.data.venue;
    }
    yield put(VenueActions.cacheVenues([venue]));
  } catch (error) {
    // HANDLE ERROR

    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(VenueActions.createVenueFailure(errorMsg));
  }
}

/********************************************************************************
 *  Save Venue
 *******************************************************************************/

function* saveVenueWatch() {
  yield takeLatest(VenueActionTypes.SAVE_VENUE, saveVenueSaga);
}

function* saveVenueSaga(action: VenueActions.SaveVenueAction) {
  const {
    forward,
    next,
  }: { forward: boolean, next?: boolean } = action.payload;

  const { nextUrl }: ISaveChanges = yield select(
    (state: BackstageState) => state.app.saveChanges
  );

  const venueState: VenueReducerState = yield select(
    (state: BackstageState) => state.venue
  );
  const { venueId, venuesCache } = venueState;
  const venue = venuesCache[venueId];

  if (forward) {
    const route = nextRoute(1);
    if (route) {
      history.push(route);
    }
  }

  if (next && nextUrl) {
    history.replace(nextUrl);
  }

  const hasChanged = yield ChangeUtil.hasVenueChanged(venue);

  console.log(venue);

  if (hasChanged) {
    if (venue.orgId) {
      yield put(VenueActions.updateVenueRequest());
    } else {
      yield put(VenueActions.createVenueRequest());
    }

    // HANDLE ERROR
    yield takeLatest(
      [
        VenueActionTypes.CREATE_VENUE_SUCCESS,
        VenueActionTypes.UPDATE_VENUE_SUCCESS,
      ],
      function* (action: VenueActions.CreateVenueSuccessAction) {
        const venueId = action.payload.venue._id;
        UrlUtil.setQueryString({ venueId }, true);
      }
    );
  }
}

/********************************************************************************
 *  Create Headlining Venue
 *******************************************************************************/

function* createEventVenueWatch() {
  yield takeLatest(VenueActionTypes.CREATE_EVENT_VENUE, createEventVenueSaga);
}

function* createEventVenueSaga() {
  const venueState: VenueReducerState = yield select(
    (state: BackstageState) => state.venue
  );

  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );

  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  yield put(VenueActions.createVenueRequest());

  // HANDLE ERROR
  yield takeLatest(
    [
      VenueActionTypes.CREATE_VENUE_SUCCESS,
    ],
    function* (action: VenueActions.CreateVenueSuccessAction) {
      const performance: IPerformance = event?.performances?.[0] as IPerformance;
      const venueId = action.payload.venue._id;
      yield put(AppActions.popModal());
      yield put(VenueActions.setVenueId(''));
      yield put(EventActions.setEventVenueId(
        eventId,
        venueId as string,
      ));
    }
  );
}

/********************************************************************************
 *  Create Venue
 *******************************************************************************/

function* createVenueRequestWatch() {
  yield takeLatest(
    VenueActionTypes.CREATE_VENUE_REQUEST,
    createVenueRequestSaga
  );
}

function* createVenueRequestSaga(
  action: VenueActions.CreateVenueRequestAction
) {
  const venueState: VenueReducerState = yield select(
    (state: BackstageState) => state.venue
  );
  const { venueId, venuesCache } = venueState;
  const venue = cleanVenue(venuesCache[venueId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: CREATE_VENUE,
        variables: {
          venue,
        },
        refetchQueries: [{
          query: LIST_VENUES,
          variables: {
            query: {},
          },
        }],
      });
    });

    const { createVenue }: { createVenue: IVenue } = res.data;

    yield put(VenueActions.createVenueSuccess(createVenue));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    console.log(errorMsg);
    yield put(VenueActions.createVenueFailure(errorMsg));
  }
}

/********************************************************************************
 *  Update Venue
 *******************************************************************************/

function* updateVenueRequestWatch() {
  yield takeLatest(
    VenueActionTypes.UPDATE_VENUE_REQUEST,
    updateVenueRequestSaga
  );
}

function* updateVenueRequestSaga(
  action: VenueActions.UpdateVenueRequestAction
) {
  const venueState: VenueReducerState = yield select(
    (state: BackstageState) => state.venue
  );
  const { venueId, venuesCache } = venueState;
  const venue = cleanVenue(venuesCache[venueId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: UPDATE_VENUE,
        variables: {
          venue,
        },
      });
    });

    const { updateVenue }: { updateVenue: IVenue } = res.data;

    yield put(VenueActions.updateVenueSuccess(updateVenue));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(VenueActions.updateVenueFailure(errorMsg));
  }
}
