import React, { Fragment } from "react";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import Promotion from "../../components/Promotion";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import { Icons, Icon, Colors, Flex } from "@sellout/ui";
import { ModalTypes } from "../../components/modal/Modal";
import Button, {
  ButtonTypes,
  ButtonIconPosition,
} from "@sellout/ui/build/components/Button";
import useEvent from "../../hooks/useEvent.hook";
import {
  Container,
  Content,
  TitleContainer,
  Title,
  Subtitle,
  Spacer,
  NoContent,
  NoContentText,
} from "../../components/create-flow/CreateFlowStyles";
import * as SeasonActions from "../../redux/actions/season.actions";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../models/enums/VariantEnum";

type CreateEventPromotionsProps = { saveOnChanges?: boolean };

const CreateEventPromotions: React.FC<CreateEventPromotionsProps> = ({
  saveOnChanges = true,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();
  const isEvent = window.location.href.includes("eventId");

  /* Actions */
  const dispatch = useDispatch();
  const addPromotion = () => {
    if (isEvent &&  eventId) {
      dispatch(EventActions.addPromotion(eventId));
      dispatch(AppActions.pushModal(ModalTypes.Promotion, { saveOnChanges }));
    } else if (seasonId) {
      dispatch(SeasonActions.addPromotion(seasonId));
      dispatch(
        AppActions.pushModal(ModalTypes.SeasonPromotion, { saveOnChanges })
      );
    }
  };

  /* Render */
  const promotionData = isEvent ? event : season;
  const hasContent = Boolean(promotionData?.promotions?.length);

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center" justify="space-between" margin="0 0 10px">
            <Flex align="center">
              <Title>Secret codes</Title>
              <Icon
                icon={Icons.HelpSolid}
                size={18}
                top="3px"
                color={Colors.Grey5}
                margin="0 0 0 8px"
                onClick={() =>
                  window.open(
                    "https://help.sellout.io/en/articles/4436311-secret-codes",
                    "_blank"
                  )
                }
              />
            </Flex>
            <Button
              type={ButtonTypes.Thin}
              text="CREATE CODE"
              icon={Icons.Plus}
              iconPosition={ButtonIconPosition.Left}
              iconSize={12}
              onClick={() => addPromotion()}
            />
          </Flex>
          <Subtitle>
            Codes that can be used to access presales, discounts, and secret
            tickets.
          </Subtitle>
        </TitleContainer>
        {!hasContent && (
          <Fragment>
            <NoContent>
              <NoContentText>No secret codes yet</NoContentText>
            </NoContent>
            <Spacer />
          </Fragment>
        )}
        {promotionData?.promotions?.map((promotion: IEventPromotion) => {
          return (
            <Fragment key={promotion._id}>
              <Promotion key={promotion._id} promotion={promotion} />
              <Spacer />
            </Fragment>
          );
        })}
        <CreateEventSaveButton season={season} event={event} />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventPromotions;
