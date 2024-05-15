import { all, take, takeLatest, select, call, put } from "redux-saga/effects";
import { SeasonActionTypes } from "../actions/season.actions";
import * as AppActions from "../actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import SeatsIO from "../../utils/SeatsIO";
import * as SeasonActions from "../actions/season.actions";
import { NEW_SEASON_ID, SeasonReducerState } from "../reducers/season.reducer";
import { BackstageState } from "../store";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import ISeason, {
  ISeasonGraphQL,
} from "@sellout/models/.dist/interfaces/ISeason";
import client from "../../graphql/client";
import CREATE_SEASON from "@sellout/models/.dist/graphql/mutations/createSeason.mutation";
import UPDATE_SEASON from "@sellout/models/.dist/graphql/mutations/updateSeason.mutation";
import PUBLISH_SEASON from "@sellout/models/.dist/graphql/mutations/publishSeason.mutation";
import { ErrorUtil } from "@sellout/ui";
import { ModalTypes } from "../../components/modal/Modal";
import history from "../../utils/history";
import * as RemoveUtil from "../../utils/RemoveUtil";
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import seasonState from "../../models/states/season.state";
import GET_SEASON from "@sellout/models/.dist/graphql/queries/season.query";
import ISeasonCustomField from "@sellout/models/.dist/interfaces/ISeasonCustomField";
import { AppReducerState } from "../reducers/app.reducer";

export default function* seasonSaga() {
  try {
    yield all([
      selectSeasonSeatingChartWatch(),
      selectCreateSeasonSeatIoWatch(),
      clearSeasonSeatingChartFieldsWatch(),
      createSeasonRequestWatch(),
      navigatePreviousStepWatch(),
      navigateNextStepWatch(),
      publishSeasonWatch(),
      saveSeasonWatch(),
      updateSeasonRequestWatch(),
      publishSeasonRequestWatch(),
      reCacheSeasonWatch(),
      reCacheTicketTypeWatch(),
      reCacheCustomFieldWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

function cleanSeason(season: ISeasonGraphQL): ISeason {
  season = RemoveUtil.removeEmpty(season);
  season = RemoveUtil.removeField(season, "_id", (_id) => _id === "");
  season = RemoveUtil.removeField(
    season,
    "_id",
    (_id) => _id === NEW_SEASON_ID
  );
  delete season.organization;
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
    if (season.hasOwnProperty(item)) {
      delete season[item];
    }
  });
  return season;
}

const CREATE_SEASON_ROUTES = [
  "/create-season/details",
  "/create-season/dates-times",
  "/create-season/ticket-types",
  // "/create-season/upgrade-types",
  "/create-season/secret-codes",
  "/create-season/advanced-options",
];

/********************************************************************************
 *  Navigation
 *******************************************************************************/

const seasonNextRoute = (direction: number): string | null => {
  const { location } = history;
  const index = CREATE_SEASON_ROUTES.findIndex(
    (route) => route === location.pathname
  );
  if (typeof index === undefined) return null;
  const nextIndex = index + direction;
  if (!CREATE_SEASON_ROUTES[nextIndex]) return null;
  return CREATE_SEASON_ROUTES[nextIndex] + location.search;
};

/************************************************************
 *  Previous Step
 ***********************************************************/

function* navigatePreviousStepWatch() {
  yield takeLatest(
    SeasonActionTypes.NAVIGATE_PREVIOUS_STEP,
    navigatePreviousStepSaga
  );
}

function navigatePreviousStepSaga(
  action: SeasonActions.NavigatePreviousStepAction
) {
  const route = seasonNextRoute(-1);
  if (route) {
    history.push(route);
  }
}

/************************************************************
 *  Next Step
 ***********************************************************/

function* navigateNextStepWatch() {
  yield takeLatest(SeasonActionTypes.NAVIGATE_NEXT_STEP, navigateNextStepSaga);
}

function navigateNextStepSaga(action: SeasonActions.NavigateNextStepAction) {
  const route = seasonNextRoute(1);
  if (route) {
    history.push(route);
  }
}
/********************************************************************************
 *  Select Season Seating Chart
 *******************************************************************************/

function* selectSeasonSeatingChartWatch() {
  yield takeLatest(
    SeasonActionTypes.SELECT_SEASON_SEATING_CHART,
    selectSeasonSeatingChartSaga
  );
}

function* selectSeasonSeatingChartSaga(
  action: SeasonActions.SelectSeasonSeatingChartAction
) {
  let {
    seasonId,
    seatingChartKey,
  }: {
    seasonId: string;
    seatingChartKey: string;
  } = action.payload;

  // Get the season
  const seasonState: SeasonReducerState = yield select(
    (state: BackstageState) => state.season
  );
  const { seasonCache } = seasonState;
  const season = seasonCache[seasonId];
  // Set the key on the season
  yield put(SeasonActions.setSeasonSeatingChartKey(seasonId, seatingChartKey));

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
  yield put(
    SeasonActions.setSeasonSeatingChartFields(seasonId, chartCategories)
  );
  if (seasonId.toLocaleLowerCase() !== NEW_SEASON_ID) {
    const seatingId = SeasonUtil.seatingId(season);
    let seat;

    try {
      yield call(async () => {
        seat = await seatsIOClient.seasons.retrieve(seasonId);
      });
    } catch (error: any) {
      if (error?.errors[0]?.code === "EVENT_NOT_FOUND") {
        yield put(SeasonActions.selectCreateSeasonSeatingChart(season));
      }
    }

    try {
      yield call(() => {
        if (!season.seatingChartKey && !seat) {
          const parmas = {
            _key: seatingId,
          };

          const seatings = seatsIOClient.seasons.create(
            seatingChartKey,
            parmas
          );
          return seatings;
        } else {
          if (seat && seat.chartKey) {
            seatingChartKey = seat.chartKey;
          }
          return seatsIOClient.seasons.update(seatingId, seatingChartKey);
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

// For season creation after it is created
function* selectCreateSeasonSeatIoWatch() {
  yield takeLatest(
    SeasonActionTypes.SELECT_CREATE_SEASON_SEATING_CHART,
    selectCreateSeasonSeatIoSaga
  );
}

function* selectCreateSeasonSeatIoSaga(
  action: SeasonActions.SelectCreateSeasonSeatingChartAction
) {
  const { season } = action.payload;
  const { _id: seasonId, seatingChartKey } = season;
  console.log(
    "INSIDE SAGA selectCreateSeasonSeatIoSaga",
    seatingChartKey,
    season
  );

  // Set the key on the season
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

    const seatingId = SeasonUtil.seatingId(season);
    // const tableBookingConfig = { mode: "BY_SEAT" };

    try {
      yield call(async () => {
        const parmas = {
          _key: seatingId,
          //  _tableBookingConfig: tableBookingConfig,
        };
        const seatings = await seatsIOClient.seasons.create(
          seatingChartKey,
          parmas
        );
        return seatings;
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
 *  Clear Season Seating Chart
 *******************************************************************************/

function* clearSeasonSeatingChartFieldsWatch() {
  yield takeLatest(
    SeasonActionTypes.CLEAR_SEASON_SEATING_CHART_FIELDS,
    clearSeasonSeatingChartFieldsSaga
  );
}

function* clearSeasonSeatingChartFieldsSaga(
  action: SeasonActions.SelectSeasonSeatingChartAction
) {
  const {
    seasonId,
  }: {
    seasonId: string;
  } = action.payload;

  // Get the season
  const seasonState: SeasonReducerState = yield select(
    (state: BackstageState) => state.season
  );
  const { seasonCache } = seasonState;
  const season = seasonCache[seasonId];

  if (season.seatingChartKey) {
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
        return await seatsIOClient.seasons.delete(SeasonUtil.seatingId(season));
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
 *  Create Season Request
 *******************************************************************************/

function* createSeasonRequestWatch() {
  yield takeLatest(
    SeasonActionTypes.CREATE_SEASON_REQUEST,
    createSeasonRequestSaga
  );
}

function* createSeasonRequestSaga(
  action: SeasonActions.CreateSeasonRequestAction
) {
  const state: BackstageState = yield select((state: BackstageState) => state);
  const { app: appState, season: seasonState } = state;
  const { seasonId, seasonCache } = seasonState;
  const season = cleanSeason(seasonCache[seasonId]);

  // const refetchQueries = Object.values(appState.eventQueryHash).map(
  //   (query: IEventQuery) => {
  //     return {
  //       query: LIST_SEASON,
  //       variables: {
  //         query,
  //       },
  //     };
  //   }
  // );

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: CREATE_SEASON,
        variables: {
          season,
        },
        //refetchQueries,
        awaitRefetchQueries: false,
      });
    });

    const { createSeason }: { createSeason: ISeasonGraphQL } = res.data;

    if (createSeason.seatingChartKey) {
      yield put(SeasonActions.selectCreateSeasonSeatingChart(createSeason));
    }
    yield put(SeasonActions.createSeasonSuccess(createSeason));
  } catch (error) {
    // HANDLE ERROR
    // const errorMsg = ErrorUtil.getErrorMessage(error);
    // yield put(SeasonActions.createEventFailure(errorMsg));
  }
}

/********************************************************************************
 *  Update Event Request
 *******************************************************************************/

function* updateSeasonRequestWatch() {
  yield takeLatest(
    SeasonActionTypes.UPDATE_SEASON_REQUEST,
    updateSeasonRequestSaga
  );
}

function* updateSeasonRequestSaga(
  action: SeasonActions.UpdateSeasonRequestAction
) {
  const seasonState: SeasonReducerState = yield select(
    (state: BackstageState) => state.season
  );

  const { seasonId, seasonCache } = seasonState;
  delete seasonCache[seasonId].events;
  const season = cleanSeason(seasonCache[seasonId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: UPDATE_SEASON,
        variables: {
          season,
        },
      });
    });

    const { updateSeason }: { updateSeason: ISeasonGraphQL } = res.data;

    yield put(SeasonActions.updateSeasonSuccess(updateSeason));
    yield put(SeasonActions.cacheSeasons([updateSeason]));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(SeasonActions.updateSeasonFailure(errorMsg));
  }
}

/********************************************************************************
 *  Publish Season
 *******************************************************************************/

function* publishSeasonWatch() {
  yield takeLatest(SeasonActionTypes.PUBLISH_SEASON, publishSeasonSaga);
}

function* publishSeasonSaga({ payload }: SeasonActions.PublishSeasonAction) {
  const eventState: SeasonReducerState = yield select(
    (state: BackstageState) => state.season
  );
  const { seasonId } = eventState;

  try {
    yield put(SeasonActions.saveSeason(false));

    yield take([
      SeasonActionTypes.CREATE_SEASON_SUCCESS,
      SeasonActionTypes.UPDATE_SEASON_SUCCESS,
    ]);

    yield put(
      SeasonActions.publishSeasonRequest(
        payload.published,
        seasonId == NEW_SEASON_ID ? false : true
      )
    );

    const response = yield take([
      SeasonActionTypes.PUBLISH_SEASON_SUCCESS,
      SeasonActionTypes.PUBLISH_SEASON_FAILURE,
    ]);

    if (response.type === SeasonActionTypes.PUBLISH_SEASON_SUCCESS) {
      let seasonId = response.payload.season._id;
      yield put(AppActions.popModal());
      history.push(
        `/admin/dashboard/seasons/details/overview?seasonId=${seasonId}`
      );

      yield put(AppActions.pushModal(ModalTypes.SeasonPublishedModal));
    } else {
      console.log("ERROR");
    }
  } catch (e) {}
}

/********************************************************************************
 *  Publish Season Request
 *******************************************************************************/

function* publishSeasonRequestWatch() {
  yield takeLatest(
    SeasonActionTypes.PUBLISH_SEASON_REQUEST,
    publishSeasonRequestSaga
  );
}

function* publishSeasonRequestSaga({
  payload,
}: SeasonActions.PublishSeasonRequestAction) {
  const eventState: SeasonReducerState = yield select(
    (state: BackstageState) => state.season
  );
  const { seasonId } = eventState;
  const { isEdit } = payload;
  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: PUBLISH_SEASON,
        variables: {
          seasonId,
          published: payload.published,
        },
      });
    });

    const { publishSeason }: { publishSeason: ISeasonGraphQL } = res.data;

    // In case of create it will go to binding season
    if (publishSeason.seatingChartKey && !isEdit) {
      yield put(SeasonActions.selectCreateSeasonSeatingChart(publishSeason));
    }
    yield put(SeasonActions.publishSeasonSuccess(publishSeason));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(SeasonActions.publishSeasonFailure(errorMsg));
  }
}

/********************************************************************************
 *  Save Season
 *******************************************************************************/

function* saveSeasonWatch() {
  yield takeLatest(SeasonActionTypes.SAVE_SEASON, saveSeasonSaga);
}

function* saveSeasonSaga(action: SeasonActions.SaveSeasonAction) {
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

  const seasonState: SeasonReducerState = yield select(
    (state: BackstageState) => state.season
  );
  const { seasonId, seasonCache } = seasonState;
  const season = seasonCache[seasonId];
  if (forward) {
    const route = seasonNextRoute(1);
    if (route) {
      history.push(route);
    }
  }

  if (next && nextUrl) {
    history.replace(nextUrl);
  }

  if (isOnboarding) return;

  // if (hasChanged) {
  if (season.createdAt) {
    yield put(SeasonActions.updateSeasonRequest());
  } else {
    yield put(SeasonActions.createSeasonRequest());
  }

  // HANDLE ERROR
  yield takeLatest(
    [
      SeasonActionTypes.CREATE_SEASON_SUCCESS,
      SeasonActionTypes.UPDATE_SEASON_SUCCESS,
    ],
    function* () {}
  );
  // } else {
  //   yield put(SeasonActions.updateEventSuccess(event));
  // }
}

/********************************************************************************
 *  Season Caching
 *******************************************************************************/
function* reCacheSeasonWatch() {
  yield takeLatest(SeasonActionTypes.RE_CACHE_SEASON, reCacheSeasonSaga);
}

function* reCacheSeasonSaga(action: SeasonActions.ReCacheSeasonAction) {
  const { seasonId, fromRemote }: { seasonId: string; fromRemote?: boolean } =
    action.payload;

  try {
    let season: ISeasonGraphQL;
    const seasonStates: SeasonReducerState = yield select(
      (state: BackstageState) => state.season
    );
    const appStates: AppReducerState = yield select(
      (state: BackstageState) => state.app
    );
    if (seasonId === NEW_SEASON_ID) {
      season = seasonState();
    } else {
      const res = yield call(async () => {
        return await client.query({
          query: GET_SEASON,
          variables: {
            seasonId,
          },
          fetchPolicy: "no-cache",
        });
      });

      season = res.data.season;
      season.fees = res.data.season.fees;
    }
    yield put(SeasonActions.cacheSeasons([season]));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(SeasonActions.createEventFailure(errorMsg));
  }
}

function* reCacheTicketTypeWatch() {
  yield takeLatest(SeasonActionTypes.RE_CACHE_TICKET_TYPE, reCacheTicketType);
}

function* reCacheTicketType(action: SeasonActions.ReCacheTicketTypeAction) {
  const { seasonId, ticketTypeId }: { seasonId: string; ticketTypeId: string } =
    action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_SEASON,
        variables: {
          seasonId,
        },
      });
    });

    const { season }: { season: ISeasonGraphQL } = res.data;
    const ticketType = SeasonUtil.ticketType(season, ticketTypeId);

    console.log(season);
    console.log(ticketType);

    yield put(SeasonActions.setTicketType(seasonId, ticketTypeId, ticketType));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(SeasonActions.createEventFailure(errorMsg));
  }
}

function* reCacheUpgradeTypeWatch() {
  yield takeLatest(SeasonActionTypes.RE_CACHE_UPGRADE_TYPE, reCacheUpgradeType);
}

function* reCacheUpgradeType(action: SeasonActions.ReCacheUpgradeTypeAction) {
  const {
    seasonId,
    upgradeTypeId,
  }: { seasonId: string; upgradeTypeId: string } = action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_SEASON,
        variables: {
          seasonId,
        },
      });
    });

    const { season }: { season: ISeasonGraphQL } = res.data;
    const upgradeType = SeasonUtil.upgrade(season, upgradeTypeId);

    yield put(
      SeasonActions.setUpgradeType(seasonId, upgradeTypeId, upgradeType)
    );
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(SeasonActions.createEventFailure(errorMsg));
  }
}

// function* reCachePromotionWatch() {
//   yield takeLatest(SeasonActionTypes.RE_CACHE_PROMOTION, reCachePromotion);
// }

// function* reCachePromotion(action: SeasonActions.ReCachePromotionAction) {
//   const { seasonId, promotionId }: { seasonId: string; promotionId: string } =
//     action.payload;

//   try {
//     const res = yield call(async () => {
//       return await client.query({
//         query: GET_SEASON,
//         variables: {
//           seasonId,
//         },
//       });
//     });

//     const { season }: { season: ISeasonGraphQL } = res.data;
//     const promotion = SeasonUtil.promotion(season, promotionId);

//     yield put(SeasonActions.setPromotion(seasonId, promotionId, promotion));
//   } catch (error) {
//     // HANDLE ERROR
//     //  const errorMsg = ErrorUtil.getErrorMessage(error);
//     //  yield put(SeasonActions.createEventFailure(errorMsg));
//   }
// }

function* reCacheCustomFieldWatch() {
  yield takeLatest(SeasonActionTypes.RE_CACHE_CUSTOM_FIELD, reCacheCustomField);
}

function* reCacheCustomField(action: SeasonActions.ReCacheCustomFieldAction) {
  const {
    seasonId,
    customFieldId,
  }: { seasonId: string; customFieldId: string } = action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_SEASON,
        variables: {
          seasonId,
        },
      });
    });

    const { season }: { season: ISeasonGraphQL } = res.data;
    const customField = SeasonUtil.customField(
      season,
      customFieldId
    ) as ISeasonCustomField;

    yield put(
      SeasonActions.setCustomField(seasonId, customFieldId, customField)
    );
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(SeasonActions.createEventFailure(errorMsg));
  }
}
