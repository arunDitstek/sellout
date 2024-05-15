import React from "react";
import { Page, PageTitle } from "../../components/PageLayout";
import DELETE_SEASON_OR_EVENT_FEE from "@sellout/models/.dist/graphql/mutations/deleteEventOrSeasonFee.mutation";
import CREATE_EVENT_OR_SEASON_FEE from "@sellout/models/.dist/graphql/mutations/createEventOrSeasonFee.mutation";
import UPDATE_SEASON_EVENT_FEE from "@sellout/models/.dist/graphql/mutations/updateEventOrSeasonFee.mutation";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { useQuery, useMutation } from "@apollo/react-hooks";
import EVENT_FEES from "@sellout/models/.dist/graphql/queries/eventFees.query";
import SEASON_FEES from "@sellout/models/.dist/graphql/queries/seasonFees.query";
import * as FeeActions from "../../redux/actions/fee.actions";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { FeeAppliedByEnum } from "@sellout/models/.dist/interfaces/IFee";
import { Container, TableContainer } from "../SuperAdminSettings.page";
import { Button } from "@sellout/ui";
import { ButtonTypes } from "@sellout/ui/build/components/Button";
import { ModalTypes } from "../../components/modal/Modal";
import FeesTable from "../FeesTable";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import styled from "styled-components";
import { media } from "@sellout/ui/build/utils/MediaQuery";

type EventSeasonFeesSettings = {};

export const TopLeftPaddedPage = styled.div`
  height: 100%;
  width: calc(100% - 60px);
  box-sizing: border-box;
  position: absolute;
  top: 50px;
  left: 60px;
  ${media.mobile`
  left: 0px;
  `};
`;

const EventSeasonFeesSettings: React.FC<EventSeasonFeesSettings> = () => {
  const dispatch = useDispatch();
  const { eventId } = useSelector((state: BackstageState) => state.event);
  const { seasonId } = useSelector((state: BackstageState) => state.season);
  const [feesData, setFeesData] = React.useState();
  const firstPath = window.location.pathname.split("/");
  const path = firstPath[firstPath.length - 2];
  const isEvent = path === "events";
  const isSeason = path === "seasons";
  const [error, setError] = React.useState("");
  const [orgId, setOrgId] = React.useState();

  const { data, loading } = useQuery(GET_PROFILE, {
    onCompleted: (data) => setOrgId(data.organization._id),
  });

  const { data: eventData } = useQuery(EVENT_FEES, {
    variables: {
      eventId,
    },
    skip: !isEvent,
    fetchPolicy: "network-only",
    onError: (error) => setError(getErrorMessage(error)),
  });

  const { data: seasonData } = useQuery(SEASON_FEES, {
    variables: {
      seasonId,
    },
    skip: !isSeason,
    fetchPolicy: "network-only",
    onError: (error) => setError(getErrorMessage(error)),
  });

  React.useEffect(() => {
    if (isEvent) {
      let filterdEventFee = eventData?.eventFees.filter((fee: any) => {
        if (
          fee.appliedBy === FeeAppliedByEnum.Organization &&
          fee.filters.length === 0
        ) {
          return false;
        } else {
          return fee;
        }
      });
      setFeesData(filterdEventFee);
    } else {
      let filterdSeasonFee = seasonData?.seasonFees.filter((fee: any) => {
        if (
          fee.appliedBy === FeeAppliedByEnum.Organization &&
          fee.filters.length === 0
        ) {
          return false;
        } else {
          return fee;
        }
      });
      setFeesData(filterdSeasonFee);
    }
  }, [isEvent, eventData, seasonData]);

  const [createEventOrSeasonFee] = useMutation(CREATE_EVENT_OR_SEASON_FEE, {
    refetchQueries: [
      isEvent
        ? {
            query: EVENT_FEES,
            variables: {
              eventId,
            },
          }
        : {
            query: SEASON_FEES,
            variables: {
              seasonId,
            },
          },
    ],
    awaitRefetchQueries: true,
    onCompleted: () =>
      dispatch(
        AppActions.showNotification(
          "Fee created successfully",
          AppNotificationTypeEnum.Success
        )
      ),
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [updateSeasonEventFee] = useMutation(UPDATE_SEASON_EVENT_FEE, {
    refetchQueries: [
      isEvent
        ? {
            query: EVENT_FEES,
            variables: {
              eventId,
            },
          }
        : {
            query: SEASON_FEES,
            variables: {
              seasonId,
            },
          },
    ],
    awaitRefetchQueries: true,
    onCompleted: () =>
      dispatch(
        AppActions.showNotification(
          "Fee updated successfully",
          AppNotificationTypeEnum.Success
        )
      ),
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [deleteSeasonorEventFee] = useMutation(DELETE_SEASON_OR_EVENT_FEE, {
    refetchQueries: [
      isEvent
        ? {
            query: EVENT_FEES,
            variables: {
              eventId,
            },
          }
        : {
            query: SEASON_FEES,
            variables: {
              seasonId,
            },
          },
    ],
    onError(error) {
      dispatch(
        AppActions.showNotification(
          getErrorMessage(error),
          AppNotificationTypeEnum.Error
        )
      );
    },
    onCompleted: () =>
      dispatch(
        AppActions.showNotification(
          "Fee deleted successfully",
          AppNotificationTypeEnum.Success
        )
      ),
  });

  /* Render */
  return (
    <>
      <Page>
        <PageTitle>{isEvent ? "Event Settings" : "Season Settings"}</PageTitle>
        <Container>
          <Button
            type={ButtonTypes.Thin}
            text="Create New Fee"
            onClick={() => {
              dispatch(FeeActions.setFeeId("" as string));
              dispatch(
                AppActions.pushModal(ModalTypes.FeeModal, {
                  createFee: createEventOrSeasonFee,
                  eventId: isEvent ? eventId : "",
                  seasonId: isSeason ? seasonId : "",
                  orgId,
                })
              );
            }}
            margin="0 10px 0 0"
          />
        </Container>
        <TableContainer>
          <FeesTable
            fees={feesData ?? []}
            // fetchMore={fetchMore}
            paginationType={PaginationTypes.EventSettings}
            updateFee={updateSeasonEventFee}
            deleteFee={deleteSeasonorEventFee}
            eventId={isEvent ? eventId : ""}
            seasonId={isSeason ? seasonId : ""}
            orgId={orgId}
            feesLength={eventData?.eventFees || seasonData?.seasonFees}
          />
        </TableContainer>
      </Page>
      {/* )} */}
    </>
  );
};

export default EventSeasonFeesSettings;
