import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import { Colors, Flex, Icon, Icons } from "@sellout/ui";
import CreateEventName from "../../components/create-event/CreateEventName";
import CreateEventSubtitle from "../../components/create-event/CreateEventSubtitle";
import CreateEventDescription from "../../components/create-event/CreateEventDescription";
import SelectEventPosterImage from "../../components/create-event/SelectEventPosterImage";
import CreateEventAge from "../../components/create-event/CreateEventAge";
import CreateSeasonTaxDeduction from "../../components/create-season/CreateSeasonTaxDeduction";
import CreateEventSongLink from "../../components/create-event/CreateEventSongLink";
import CreateEventVideoLink from "../../components/create-event/CreateEventVideoLink";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import SelectEventVenue from "../../components/create-event/SelectEventVenue";
import BooleanInput from "../../elements/BooleanInput";
import SelectSeasonSeatingChart from "../../components/create-season/SelectSeasonSeatingChart";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
} from "../../components/create-flow/CreateFlowStyles";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import { useQuery } from "@apollo/react-hooks";
import CreateEventTegIntegeration from "../../components/create-event/CreateEventTegIntegeration";
import * as SeasonActions from "../../redux/actions/season.actions";

type CreateSeasonDetailsProps = {
  match: any;
};

const CreateSeasonDetails: React.FC<CreateSeasonDetailsProps> = ({ match }) => {
  /* State */
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const season = seasonCache[seasonId];
  /* Actions */
  const dispatch = useDispatch();

  const { data } = useQuery(GET_PROFILE);
  const setEventPublishable = (publishOnSelloutIO) => {
    dispatch(
      SeasonActions.setSeasonPublishable(seasonId, publishOnSelloutIO as boolean)
    );
  };

  const onEventSeated = () => {
    // if (season?.hasOrders) {
    //   showNotification(
    //     "This field cannot be changed once orders have been created. Please contact support with questions or comments."
    //   );
    //   return;
    // } else if (hasSeating) {
    //   // clearEventSeatingChartFields();
    // } else setHasSeating(!hasSeating);
  };

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Basic info</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() =>
                window.open(
                  "https://help.sellout.io/en/articles/4434081-entering-basic-info",
                  "_blank"
                )
              }
            />
          </Flex>
          <Subtitle>
            Let's get started! Give us the basic heads up information about this
            season.
          </Subtitle>
        </TitleContainer>

        <CreateEventName type={VariantEnum.Season} />
        <Spacer />
        <CreateEventSubtitle type={VariantEnum.Season} />
        <Spacer />
        <SelectEventVenue type={VariantEnum.Season} />
        <Spacer />
        {season.venueId && (
          <>
            <BooleanInput
              active={true}
              onChange={() => onEventSeated()}
              label="Is this event seated?"
            />
            <Spacer />
            <SelectSeasonSeatingChart />
            <Spacer />
          </>
        )}
        <SelectEventPosterImage type={VariantEnum.Season} />
        <Spacer />
        <CreateSeasonTaxDeduction />
        <Spacer />
        <CreateEventDescription type={VariantEnum.Season} />
        <Spacer />
        <CreateEventAge type={VariantEnum.Season} />
        {data?.organization?.isTegIntegration && (
          <>
            <Spacer />
            <CreateEventTegIntegeration type={VariantEnum.Season} />
          </>
        )}
        <Spacer />
        <CreateEventVideoLink type={VariantEnum.Season} />
        <Spacer />
        <CreateEventSongLink type={VariantEnum.Season} />
        <Spacer />
        <BooleanInput
          active={season?.publishable as boolean}
          labelOn={"ON"}
          labelOff={"OFF"}
          onChange={() =>
            setEventPublishable(!season?.publishable)
          }
          label="Publish on Sellout.io website?"
        />
        <Spacer />
        <CreateEventSaveButton season={season} />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateSeasonDetails;