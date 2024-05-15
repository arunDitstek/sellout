import React from "react";
import { Flex, Icon, Icons, Colors } from "@sellout/ui";
import CreateEventPerformanceDate from "../../components/create-event/CreateEventPerformanceDate";
import CreateEventEndsAt from "../../components/create-event/CreateEventEndsAt";
import CreateEventAnnouncementDate from "../../components/create-event/CreateEventAnnouncementDate";
import CreateEventTicketsDate from "../../components/create-event/CreateEventTicketsDate";
import CreateEventTicketsEndDate from "../../components/create-event/CreateEventTicketsEndDate";
import CreateEventSendQRCode from "../../components/create-event/CreateEventSendQRCode";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import BooleanInput from "../../elements/BooleanInput";
import * as Time from "@sellout/utils/.dist/time";
import AnimateHeight from "../../components/AnimateHeight";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
  RowToColumn,
  RowToColumnSpacer,
} from "../../components/create-flow/CreateFlowStyles";
import { useDispatch, useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as SeasonActions from "../../redux/actions/season.actions";
import { VariantEnum } from "../../models/enums/VariantEnum";

type CreateSeasonDatesTimesProps = {};

type CreateSeasonPerformanceDate = {
  index?: number;
};

const CreateSeasonDatesTimes: React.FC<CreateSeasonDatesTimesProps> = () => {
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const season: any = seasonCache[seasonId];
  const performance = season.performances?.[0];

  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = season?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : season?.venue?.address?.timezone
      ? season?.venue?.address?.timezone
      : "America/Denver";
  const diffInMinutes = Time.getTimezoneMindifference(timezone);
  const [salesBeginImmediately, setSalesBeginImmediately] = React.useState(
    season?.salesBeginImmediately ?? true
  );

  /* Actions */
  const dispatch = useDispatch();
  const setSeasonSalesBeginImmediately = (salesBeginImmediately) => {
    setSalesBeginImmediately(salesBeginImmediately);
    dispatch(
      SeasonActions.setSeasonSalesBeginImmediately(
        seasonId,
        salesBeginImmediately
      )
    );
    const date = Time.now();
    console.log(date, timezone, diffInMinutes);
    dispatch(SeasonActions.setSeasonScheduleAnnounceAt(seasonId, date));
    dispatch(SeasonActions.setSeasonScheduleTicketsAt(seasonId, date));
  };

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Dates & times</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() =>
                window.open(
                  "https://help.sellout.io/en/articles/4436286-dates-times",
                  "_blank"
                )
              }
            />
          </Flex>
          <Subtitle>
            Select the important dates & times related to this season.
          </Subtitle>
        </TitleContainer>
        {performance?.schedule?.map((item, index) => {
          return (
            <RowToColumn key={index}>
              <CreateEventPerformanceDate
                index={index}
                type={VariantEnum.Season}
              />
              <RowToColumnSpacer />
              <CreateEventEndsAt index={index} type={VariantEnum.Season} />
            </RowToColumn>
          );
        })}
        <Spacer />
        <BooleanInput
          active={salesBeginImmediately}
          onChange={() =>
            setSeasonSalesBeginImmediately(!salesBeginImmediately)
          }
          label="Will sales begin immediately?"
        />
        <Spacer />
        <AnimateHeight open={!salesBeginImmediately} height="190px">
          <CreateEventAnnouncementDate type={VariantEnum.Season} />
          <Spacer />
          <CreateEventTicketsDate type={VariantEnum.Season} />
          <Spacer />
        </AnimateHeight>
        <CreateEventTicketsEndDate type={VariantEnum.Season} />
        <Spacer />
        <CreateEventSendQRCode type={VariantEnum.Season} />
        <Spacer />
        <CreateEventSaveButton season={season} />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateSeasonDatesTimes;
