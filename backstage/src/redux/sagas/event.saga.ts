import { all, take, takeLatest, select, call, put } from "redux-saga/effects";
import { EventActionTypes } from "../actions/event.actions";
import client from "../../graphql/client";
import GET_EVENT from "@sellout/models/.dist/graphql/queries/event.query";
import CREATE_EVENT from "@sellout/models/.dist/graphql/mutations/createEvent.mutation";
import UPDATE_EVENT from "@sellout/models/.dist/graphql/mutations/updateEvent.mutation";
import PUBLISH_EVENT from "@sellout/models/.dist/graphql/mutations/publishEvent.mutation";
import LIST_EVENTS from "@sellout/models/.dist/graphql/queries/events.query";
import { BackstageState } from "../store";
import * as AppActions from "../actions/app.actions";
import * as EventActions from "../actions/event.actions";
import * as ErrorUtil from "@sellout/ui/build/utils/ErrorUtil";
import * as RemoveUtil from "../../utils/RemoveUtil";
import { EventReducerState, NEW_EVENT_ID } from "../reducers/event.reducer";
import IEvent, { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import history from "../../utils/history";
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SeatsIO from "../../utils/SeatsIO";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import eventState from "../../models/states/event.state";
import { ModalTypes } from "../../components/modal/Modal";
import { EventQueryEnum } from "../../models/enums/EventQueryEnum";
import IEventQuery from "@sellout/models/.dist/interfaces/IEventQuery";
import DELETE_EVENT from "@sellout/models/.dist/graphql/mutations/deleteEvent.mutation";
export default function* eventSaga() {
  try {
    yield all([
      saveEventWatch(),
      navigateToPreviousStepWatch(),
      navigateToNextStepWatch(),
      reCacheEventWatch(),
      reCacheTicketTypeWatch(),
      reCacheUpgradeTypeWatch(),
      reCachePromotionWatch(),
      reCacheCustomFieldWatch(),
      createEventRequestWatch(),
      updateEventRequestWatch(),
      publishEventWatch(),
      publishEventRequestWatch(),
      // modifyEventChildWatch(),
      addPerformanceHeadliningArtistWatch(),
      selectEventSeatingChartWatch(),
      selectCreateEventSeatIoWatch(),
      clearEventSeatingChartFieldsWatch(),
      deleteEventWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

function cleanEvent(event: IEventGraphQL): IEvent {
  event = RemoveUtil.removeEmpty(event);
  event = RemoveUtil.removeField(event, "_id", (_id) => _id === "");
  event = RemoveUtil.removeField(event, "_id", (_id) => _id === NEW_EVENT_ID);
  delete event.organization;
  const removeAttribute = [
    "fees",
    "artists",
    "createdAt",
    "venue",
    "webFlowEntity",
    "hasOrders",
    "published",
    "analytics",
  ];
  removeAttribute.map((item, index) => {
    if (event.hasOwnProperty(item)) {
      delete event[item];
    }
  });
  //   delete event.fees;
  //   delete event.artists;
  //   delete event.createdAt;
  //   delete event.venue;
  //   delete event.webFlowEntity;
  //   delete event.hasOrders;
  //   delete event.published;
  //   delete event.analytics;
  return event;
}

const CREATE_EVENT_ROUTES = [
  "/create-event/details",
  "/create-event/dates-times",
  "/create-event/ticket-types",
  "/create-event/upgrade-types",
  "/create-event/secret-codes",
  "/create-event/advanced-options",
];

/********************************************************************************
 *  Navigation
 *******************************************************************************/

const nextRoute = (direction: number): string | null => {
  const { location } = history;
  const index = CREATE_EVENT_ROUTES.findIndex(
    (route) => route === location.pathname
  );

  if (typeof index === undefined) return null;
  const nextIndex = index + direction;
  if (!CREATE_EVENT_ROUTES[nextIndex]) return null;
  return CREATE_EVENT_ROUTES[nextIndex] + location.search;
};

/************************************************************
 *  Previous Step
 ***********************************************************/

function* navigateToPreviousStepWatch() {
  yield takeLatest(
    EventActionTypes.NAVIGATE_TO_PREVIOUS_STEP,
    navigateToPreviousStepSaga
  );
}

function navigateToPreviousStepSaga(
  action: EventActions.NavigateToPreviousStepAction
) {
  const route = nextRoute(-1);
  if (route) {
    history.push(route);
  }
}

/************************************************************
 *  Next Step
 ***********************************************************/

function* navigateToNextStepWatch() {
  yield takeLatest(
    EventActionTypes.NAVIGATE_TO_NEXT_STEP,
    navigateToNextStepSaga
  );
}

function navigateToNextStepSaga(action: EventActions.NavigateToNextStepAction) {
  const route = nextRoute(1);
  if (route) {
    history.push(route);
  }
}

/********************************************************************************
 *  Event Caching
 *******************************************************************************/
function* reCacheEventWatch() {
  yield takeLatest(EventActionTypes.RE_CACHE_EVENT, reCacheEventSaga);
}

function* reCacheEventSaga(action: EventActions.ReCacheEventAction) {
  const { eventId }: { eventId: string; fromRemote?: boolean } = action.payload;
  try {
    let event: IEventGraphQL;

    if (eventId === NEW_EVENT_ID) {
      event = eventState();
    } else {
      const res = yield call(async () => {
        return await client.query({
          query: GET_EVENT,
          variables: {
            eventId,
          },
          fetchPolicy: "no-cache",
        });
      });
      event = res.data.event;
      event.fees = res.data.event.fees;
    }
    yield put(EventActions.cacheEvents([event]));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(EventActions.createEventFailure(errorMsg));
  }
}

function* reCacheTicketTypeWatch() {
  yield takeLatest(EventActionTypes.RE_CACHE_TICKET_TYPE, reCacheTicketType);
}

function* reCacheTicketType(action: EventActions.ReCacheTicketTypeAction) {
  const { eventId, ticketTypeId }: { eventId: string; ticketTypeId: string } =
    action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_EVENT,
        variables: {
          eventId,
        },
      });
    });

    const { event }: { event: IEventGraphQL } = res.data;
    const ticketType = EventUtil.ticketType(event, ticketTypeId);

    yield put(EventActions.setTicketType(eventId, ticketTypeId, ticketType));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(EventActions.createEventFailure(errorMsg));
  }
}

function* reCacheUpgradeTypeWatch() {
  yield takeLatest(EventActionTypes.RE_CACHE_UPGRADE_TYPE, reCacheUpgradeType);
}

function* reCacheUpgradeType(action: EventActions.ReCacheUpgradeTypeAction) {
  const { eventId, upgradeTypeId }: { eventId: string; upgradeTypeId: string } =
    action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_EVENT,
        variables: {
          eventId,
        },
      });
    });

    const { event }: { event: IEventGraphQL } = res.data;
    const upgradeType = EventUtil.upgrade(event, upgradeTypeId);

    yield put(EventActions.setUpgradeType(eventId, upgradeTypeId, upgradeType));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(EventActions.createEventFailure(errorMsg));
  }
}

function* reCachePromotionWatch() {
  yield takeLatest(EventActionTypes.RE_CACHE_PROMOTION, reCachePromotion);
}

function* reCachePromotion(action: EventActions.ReCachePromotionAction) {
  const { eventId, promotionId }: { eventId: string; promotionId: string } =
    action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_EVENT,
        variables: {
          eventId,
        },
      });
    });

    const { event }: { event: IEventGraphQL } = res.data;
    const promotion = EventUtil.promotion(event, promotionId);

    yield put(EventActions.setPromotion(eventId, promotionId, promotion));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(EventActions.createEventFailure(errorMsg));
  }
}

function* reCacheCustomFieldWatch() {
  yield takeLatest(EventActionTypes.RE_CACHE_CUSTOM_FIELD, reCacheCustomField);
}

function* reCacheCustomField(action: EventActions.ReCacheCustomFieldAction) {
  const { eventId, customFieldId }: { eventId: string; customFieldId: string } =
    action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_EVENT,
        variables: {
          eventId,
        },
      });
    });

    const { event }: { event: IEventGraphQL } = res.data;
    const customField = EventUtil.customField(
      event,
      customFieldId
    ) as IEventCustomField;

    yield put(EventActions.setCustomField(eventId, customFieldId, customField));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(EventActions.createEventFailure(errorMsg));
  }
}

/********************************************************************************
 *  Save Event
 *******************************************************************************/

function* saveEventWatch() {
  yield takeLatest(EventActionTypes.SAVE_EVENT, saveEventSaga);
}

function* saveEventSaga(action: EventActions.SaveEventAction) {
  const { forward, next }: { forward: boolean; next?: boolean } =
    action.payload;

  const {
    saveChanges,
    isOnboarding,
  }: {
    saveChanges: ISaveChanges;
    isOnboarding: boolean;
  } = yield select((state: BackstageState) => state.app);

  const { nextUrl } = saveChanges;

  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  if (forward) {
    const route = nextRoute(1);
    if (route) {
      history.push(route);
    }
  }

  if (next && nextUrl) {
    history.replace(nextUrl);
  }

  if (isOnboarding) return;
  // if (hasChanged) {
  if (event.createdAt) {
    yield put(EventActions.updateEventRequest());
  } else {
    yield put(EventActions.createEventRequest());
  }

  // HANDLE ERROR
  yield takeLatest(
    [
      EventActionTypes.CREATE_EVENT_SUCCESS,
      EventActionTypes.UPDATE_EVENT_SUCCESS,
    ],
    function* () {}
  );
  // } else {
  //   yield put(EventActions.updateEventSuccess(event));
  // }
}

/********************************************************************************
 *  Create Event Request
 *******************************************************************************/

function* createEventRequestWatch() {
  yield takeLatest(
    EventActionTypes.CREATE_EVENT_REQUEST,
    createEventRequestSaga
  );
}

function* createEventRequestSaga(
  action: EventActions.CreateEventRequestAction
) {
  const state: BackstageState = yield select((state: BackstageState) => state);
  const { app: appState, event: eventState } = state;
  const { eventId, eventsCache } = eventState;
  const event = cleanEvent(eventsCache[eventId]);
  const refetchQueries = Object.values(appState.eventQueryHash).map(
    (query: IEventQuery) => {
      return {
        query: LIST_EVENTS,
        variables: {
          query,
        },
      };
    }
  );
  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: CREATE_EVENT,
        variables: {
          event,
        },
        refetchQueries,
        awaitRefetchQueries: false,
      });
    });

    const { createEvent }: { createEvent: IEventGraphQL } = res.data;
    if (createEvent.seatingChartKey && !createEvent.seasonId) {
      yield put(EventActions.selectCreateEventSeatingChart(createEvent));
    }
    // else {
    //   // Get the seating chart categories
    //   let seatsIOClient: any;
    //   try {
    //     seatsIOClient = yield call(async () => await SeatsIO());
    //   } catch (error: any) {
    //     console.error(error);
    //     yield put(
    //       AppActions.showNotification(
    //         `${error.messages[0]}. Please contact support.`,
    //         AppNotificationTypeEnum.Error
    //       )
    //     );
    //   }
    //   const seatingId = EventUtil.seatingId(event);
    //   try {
    //     yield call(async () => {
    //       let created = await seatsIOClient.seasons.createEvents(
    //         createEvent.seasonId,
    //         null,
    //         [seatingId]
    //       );
    //       return created;
    //     });
    //   } catch (error: any) {
    //     console.error(error);
    //   }
    // }

    yield put(EventActions.createEventSuccess(createEvent));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(EventActions.createEventFailure(errorMsg));
  }
}

/********************************************************************************
 *  Update Event Request
 *******************************************************************************/

function* updateEventRequestWatch() {
  yield takeLatest(
    EventActionTypes.UPDATE_EVENT_REQUEST,
    updateEventRequestSaga
  );
}

function* updateEventRequestSaga(
  action: EventActions.UpdateEventRequestAction
) {
  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );

  const { eventId, eventsCache } = eventState;
  const event: any = cleanEvent(eventsCache[eventId]);

  if (event) {
    event.schedule["startsAt"] = event?.performances[0]?.schedule[0]
      ?.startsAt as number;
    event.schedule["endsAt"] = event?.performances[0]?.schedule[
      event.performances[0]?.schedule?.length - 1
    ]?.endsAt as number;
  }
  delete event.subscription;

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: UPDATE_EVENT,
        variables: {
          event,
        },
      });
    });

    const { updateEvent }: { updateEvent: IEventGraphQL } = res.data;

    yield put(EventActions.updateEventSuccess(updateEvent));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(EventActions.updateEventFailure(errorMsg));
  }
}

/********************************************************************************
 *  Publish Event
 *******************************************************************************/

function* publishEventWatch() {
  yield takeLatest(EventActionTypes.PUBLISH_EVENT, publishEventSaga);
}

function* publishEventSaga({ payload }: EventActions.PublishEventAction) {
  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );
  const { eventId } = eventState;

  try {
    yield put(EventActions.saveEvent(false));

    yield take([
      EventActionTypes.CREATE_EVENT_SUCCESS,
      EventActionTypes.UPDATE_EVENT_SUCCESS,
    ]);

    yield put(
      EventActions.publishEventRequest(
        payload.publishSiteIds,
        payload.unpublishSiteIds,
        payload.published,
        eventId == NEW_EVENT_ID ? false : true
      )
    );

    const response = yield take([
      EventActionTypes.PUBLISH_EVENT_SUCCESS,
      EventActionTypes.PUBLISH_EVENT_FAILURE,
    ]);

    if (response.type === EventActionTypes.PUBLISH_EVENT_SUCCESS) {
      let eventId = response.payload.event._id;
      yield put(AppActions.popModal());
      history.push(
        `/admin/dashboard/events/details/overview?eventId=${eventId}`
      );
      yield put(AppActions.pushModal(ModalTypes.EventPublished));
    } else {
      console.log("ERROR");
    }
  } catch (e) {}
}

/********************************************************************************
 *  Publish Event Request
 *******************************************************************************/

function* publishEventRequestWatch() {
  yield takeLatest(
    EventActionTypes.PUBLISH_EVENT_REQUEST,
    publishEventRequestSaga
  );
}

function* publishEventRequestSaga({
  payload,
}: EventActions.PublishEventRequestAction) {
  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );
  const { eventId } = eventState;
  const { isEdit } = payload;
  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: PUBLISH_EVENT,
        variables: {
          eventId,
          publishSiteIds: payload.publishSiteIds,
          unpublishSiteIds: payload.unpublishSiteIds,
          published: payload.published,
        },
      });
    });

    const { publishEvent }: { publishEvent: IEventGraphQL } = res.data;
    // In case of create it will go to binding event
    if (publishEvent.seatingChartKey && !isEdit && !publishEvent.seasonId) {
      yield put(EventActions.selectCreateEventSeatingChart(publishEvent));
    } else {
      // Get the seating chart categories
      let seatsIOClient: any;
      try {
        seatsIOClient = yield call(async () => await SeatsIO());
      } catch (error: any) {
        console.error(error);
        yield put(
          AppActions.showNotification(
            `${error.messages[0]}. Please contact support.`,
            AppNotificationTypeEnum.Error
          )
        );
      }
      const seatingId = EventUtil.seatingId(publishEvent);
      try {
        yield call(async () => {
          let created = await seatsIOClient.seasons.createEvents(
            publishEvent.seasonId,
            null,
            [seatingId]
          );
          return created;
        });
      } catch (error: any) {
        console.error(error);
      }
    }

    yield put(EventActions.publishEventSuccess(publishEvent));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(EventActions.publishEventFailure(errorMsg));
  }
}

/********************************************************************************
 *  Modify Event Child
 *******************************************************************************/

// function* modifyEventChildWatch() {
//   yield takeLatest(
//     [
//       EventActionTypes.ADD_TICKET_TYPE,
//       EventActionTypes.REMOVE_TICKET_TYPE,
//       EventActionTypes.ADD_UPGRADE_TYPE,
//       EventActionTypes.REMOVE_UPGRADE_TYPE,
//       EventActionTypes.ADD_PROMOTION,
//       EventActionTypes.REMOVE_PROMOTION,
//       EventActionTypes.ADD_CUSTOM_FIELD,
//       EventActionTypes.REMOVE_CUSTOM_FIELD,
//     ],
//     saveEventSaga
//   );
// }

/********************************************************************************
 *  Add Performance Headlining Artist
 *******************************************************************************/

function* addPerformanceHeadliningArtistWatch() {
  yield takeLatest(
    EventActionTypes.ADD_PERFORMANCE_HEADLINING_ARTIST,
    addPerformanceHeadliningArtistSaga
  );
}

function* addPerformanceHeadliningArtistSaga(
  action: EventActions.AddPerformanceHeadliningArtistAction
) {
  const {
    eventId,
    artistId,
  }: {
    eventId: string;
    artistId: string;
  } = action.payload;

  const state: BackstageState = yield select((state: BackstageState) => state);

  // Get the event
  const { event: eventState } = state;
  const { eventsCache } = eventState;
  const event = eventsCache[eventId];

  // Get the artist
  const { artist: artistState } = state;
  const { artistsCache } = artistState;
  const artist = artistsCache[artistId];

  if (!event.posterImageUrl) {
    const [pressKit] = artist.pressKits;
    const [posterImageUrl] = pressKit.posterImageUrls;
    yield put(EventActions.setEventPosterImageUrl(eventId, posterImageUrl));
  }
}

/********************************************************************************
 *  Select Event Seating Chart
 *******************************************************************************/

function* selectEventSeatingChartWatch() {
  yield takeLatest(
    EventActionTypes.SELECT_EVENT_SEATING_CHART,
    selectEventSeatingChartSaga
  );
}

function* selectEventSeatingChartSaga(
  action: EventActions.SelectEventSeatingChartAction
) {
  let {
    eventId,
    seatingChartKey,
  }: {
    eventId: string;
    seatingChartKey: string;
  } = action.payload;

  // Get the event
  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );
  const { eventsCache } = eventState;
  const event = eventsCache[eventId];
  // Set the key on the event
  yield put(EventActions.setEventSeatingChartKey(eventId, seatingChartKey));

  // Get the seating chart categories
  let seatsIOClient: any;
  try {
    seatsIOClient = yield call(async () => await SeatsIO());
  } catch (error: any) {
    console.error(error);
    yield put(
      AppActions.showNotification(
        `${error.messages[0]}. Please contact support.`,
        AppNotificationTypeEnum.Error
      )
    );
  }

  let chartCategories;
  try {
    chartCategories = yield call(async () => {
      return await seatsIOClient.chartReports.byCategoryLabel(seatingChartKey);
    });
  } catch (error: any) {
    console.error(error);
    yield put(
      AppActions.showNotification(
        `${error.messages[0]}. Please contact support.`,
        AppNotificationTypeEnum.Error
      )
    );
  }
  yield put(EventActions.setEventSeatingChartFields(eventId, chartCategories));
  if (eventId.toLocaleLowerCase() !== NEW_EVENT_ID) {
    const seatingId = EventUtil.seatingId(event);

    let seat;
    try {
      yield call(async () => {
        seat = await seatsIOClient.seasons.retrieve(eventId);
      });
    } catch (error: any) {
      if (error?.errors[0]?.code === "EVENT_NOT_FOUND") {
        yield put(EventActions.selectCreateEventSeatingChart(event));
      }
    }

    try {
      yield call(() => {
        let seat = seatsIOClient.events.retrieve(eventId);
        if (!event.seatingChartKey && !seat) {
          return seatsIOClient.events.create(seatingChartKey, seatingId, true);
        } else {
          if (seat && seat.chartKey) {
            seatingChartKey = seat.chartKey;
          }
          return seatsIOClient.events.update(seatingId, seatingChartKey);
        }
      });
    } catch (error: any) {
      console.error(error);
      yield put(
        AppActions.showNotification(
          `${error.messages[0]}. Please contact support.`,
          AppNotificationTypeEnum.Error
        )
      );
    }
  }
}

// For Event creation after it is created
function* selectCreateEventSeatIoWatch() {
  yield takeLatest(
    EventActionTypes.SELECT_CREATE_EVENT_SEATING_CHART,
    selectCreateEventSeatIoSaga
  );
}

function* selectCreateEventSeatIoSaga(
  action: EventActions.SelectCreateEventSeatingChartAction
) {
  const { event } = action.payload;
  const { _id: eventId, seatingChartKey } = event;
  console.log(
    "INSIDE SAGA selectCreateEventSeatIoSaga",
    seatingChartKey,
    event
  );
  // Set the key on the event
  if (seatingChartKey) {
    // Get the seating chart categories
    let seatsIOClient: any;
    try {
      seatsIOClient = yield call(async () => await SeatsIO());
    } catch (error: any) {
      console.error(error);
      yield put(
        AppActions.showNotification(
          `${error.messages[0]}. Please contact support.`,
          AppNotificationTypeEnum.Error
        )
      );
    }

    const seatingId = EventUtil.seatingId(event);

    try {
      yield call(async () => {
        let created = await seatsIOClient.events.create(
          seatingChartKey,
          seatingId
        );
        return created;
      });
    } catch (error: any) {
      console.error(error);
      // yield put(
      //   AppActions.showNotification(
      //     `${error.messages[0]}. Please contact support.`,
      //     AppNotificationTypeEnum.Error
      //   )
      // );
    }
  }
}

/********************************************************************************
 *  Clear Event Seating Chart
 *******************************************************************************/

function* clearEventSeatingChartFieldsWatch() {
  yield takeLatest(
    EventActionTypes.CLEAR_EVENT_SEATING_CHART_FIELDS,
    clearEventSeatingChartFieldsSaga
  );
}

function* clearEventSeatingChartFieldsSaga(
  action: EventActions.SelectEventSeatingChartAction
) {
  const {
    eventId,
  }: {
    eventId: string;
  } = action.payload;

  // Get the event
  const eventState: EventReducerState = yield select(
    (state: BackstageState) => state.event
  );
  const { eventsCache } = eventState;
  const event = eventsCache[eventId];

  if (event.seatingChartKey) {
    // Get the seating chart categories
    let seatsIOClient: any;
    try {
      seatsIOClient = yield call(async () => await SeatsIO());
    } catch (error: any) {
      console.error(error);
      yield put(
        AppActions.showNotification(
          `${error.messages[0]}. Please contact support.`,
          AppNotificationTypeEnum.Error
        )
      );
    }

    try {
      yield call(async () => {
        return await seatsIOClient.events.delete(EventUtil.seatingId(event));
      });
    } catch (error: any) {
      console.error(error);
      yield put(
        AppActions.showNotification(
          `${error.messages[0]}. Please contact support.`,
          AppNotificationTypeEnum.Error
        )
      );
    }
  }
}

/********************************************************************************
 *  Delete Event
 *******************************************************************************/

function* deleteEventWatch() {
  yield takeLatest(EventActionTypes.DELETE_EVENT, deleteEvent);
}

function* deleteEvent(action: EventActions.DeleteEventAction) {
  const {
    eventId,
    dryRun,
    refundReason,
    eventType,
  }: {
    eventId?: string;
    dryRun?: boolean;
    refundReason?: string;
    eventType?: string;
  } = action.payload;

  const state: BackstageState = yield select((state: BackstageState) => state);
  const { app: appState } = state;
  yield put(AppActions.SetPushModalConfirmLoading(true));

  const refetchQueries = Object.values(appState.eventQueryHash).map(
    (query: IEventQuery) => {
      return {
        query: LIST_EVENTS,
        variables: {
          query,
        },
      };
    }
  );

  try {
    yield call(async () => {
      return await client.mutate({
        mutation: DELETE_EVENT,
        variables: {
          eventId,
          dryRun,
          refundReason,
          eventType,
        },
        refetchQueries,
        awaitRefetchQueries: false,
      });
    });
    if (eventId) {
      yield put(EventActions.deleteEventSuccess(eventId));
      yield put(AppActions.deleteModal());
      history.push(
        "/admin/dashboard/events?type=" + EventQueryEnum.MainEventListCancelled
      );
    }
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(EventActions.deleteEventFailure(errorMsg));
  }
  yield put(AppActions.SetPushModalConfirmLoading(false));
}
