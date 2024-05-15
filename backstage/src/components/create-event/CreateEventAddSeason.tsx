import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import useListSeasonsHook from "../../hooks/useListSeasons.hook";
import { BackstageState } from "../../redux/store";
import { useLazyQuery } from "@apollo/react-hooks";
import GET_SEASON from "@sellout/models/.dist/graphql/queries/season.query";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";

const Container = styled.div`
  position: relative;
`;

type CreateEventAddSeasonProps = {};

const CreateEventAddSeason: React.FC<CreateEventAddSeasonProps> = ({}) => {
  /* Hooks */
  const { seasons } = useListSeasonsHook({fetchPolicy: "network-only"});
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  let seasonValidationErrors = "" as string;

  const season: any = seasons?.filter((a) => a._id === event?.seasonId);
  const [seasonName, setSeasonName] = useState(season && season[0]?.name);
  /* Actions */
  const dispatch = useDispatch();

  const publishedSeasons = seasons?.filter((a) => a.published);

  const [getSeason, { data }] = useLazyQuery(GET_SEASON, {
    onCompleted: (data) => {
      if (
        (event?.performances?.[0].schedule?.[0].startsAt as number) >=
          (data?.season?.schedule?.startsAt as number) ||
        (event?.performances?.[0].schedule?.[0].startsAt as number) <=
          (data?.season?.schedule?.endsAt as number) ||
        (event?.performances?.[0].schedule?.[0].endsAt as number) <=
          (data?.season?.schedule?.endsAt as number)
      ) {
        dispatch(EventActions.setEventAddSeason(eventId, data?.season?._id));
        const season: any = seasons?.filter((a) => a._id === data?.season?._id);
        setSeasonName(season[0]?.name as string);
      } else {
        seasonValidationErrors =
          '"Event" should be in between start date to end date of this selected season.';
        dispatch(
          AppActions.showNotification(
            seasonValidationErrors,
            AppNotificationTypeEnum.Error
          )
        );
      }
      dispatch(EventActions.setEventVenueId(eventId, data?.season?.venueId));
      dispatch(
        EventActions.selectEventSeatingChart(
          eventId,
          data?.season?.seatingChartKey
        )
      );
    },
  });

  const setEventSeasonId = (seasonId: string) => {
    getSeason({
      variables: { seasonId: seasonId },
    });
  };

  /** Render */
  const items =
    publishedSeasons &&
    Object.values(publishedSeasons).map((season) => {
      return {
        text: season.name as string,
        value: season._id as string,
      };
    });

  return (
    <Container>
      <Dropdown
        value={seasonName ? season && season[0]?.name : "Select a season"}
        items={items as any}
        onChange={(seasonId: string) => {
          setEventSeasonId(seasonId);
        }}
        label="Season"
      />
    </Container>
  );
};

export default CreateEventAddSeason;
