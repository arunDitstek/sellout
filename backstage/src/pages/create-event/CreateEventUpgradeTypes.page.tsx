import React, { Fragment } from "react";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import UpgradeType from "../../components/UpgradeType";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import { Icons, Flex, Icon, Colors } from "@sellout/ui";
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

type CreateEventUpgradeTypesProps = { saveOnChanges?: boolean };

const CreateEventUpgradeTypes: React.FC<CreateEventUpgradeTypesProps> = ({
  saveOnChanges = true,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();

  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const isSeason = firstPath === "create-season";

  /* Actions */
  const dispatch = useDispatch();
  const addUpgradeType = () => {
    if (isEvent) {
      dispatch(EventActions.addUpgradeType(eventId));
      dispatch(AppActions.pushModal(ModalTypes.UpgradeType, { saveOnChanges }));
    } else if (isSeason) {
      dispatch(SeasonActions.addUpgradeType(seasonId));
      dispatch(
        AppActions.pushModal(ModalTypes.SeasonUpgradeType, { saveOnChanges })
      );
    }
  };

  /* Render */
  const upgradeData = isEvent ? event : season;
  const hasContent = Boolean(upgradeData?.upgrades?.length);

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center" justify="space-between" margin="0 0 10px">
            <Flex align="center">
              <Title>Upgrades</Title>
              <Icon
                icon={Icons.HelpSolid}
                size={18}
                top="3px"
                color={Colors.Grey5}
                margin="0 0 0 8px"
                onClick={() =>
                  window.open(
                    "https://help.sellout.io/en/articles/4436424-upgrades",
                    "_blank"
                  )
                }
              />
            </Flex>
            <Button
              type={ButtonTypes.Thin}
              text="CREATE UPGRADE"
              icon={Icons.Plus}
              iconPosition={ButtonIconPosition.Left}
              iconSize={12}
              onClick={() => addUpgradeType()}
            />
          </Flex>
          <Subtitle>
            Optional add-on items that can be purchased alongside tickets at
            checkout.
          </Subtitle>
        </TitleContainer>
        {!hasContent && (
          <Fragment>
            <NoContent>
              <NoContentText>No upgrades yet</NoContentText>
            </NoContent>
            <Spacer />
          </Fragment>
        )}
        {upgradeData?.upgrades?.map((upgradeType: IEventUpgrade) => {
          return (
            <Fragment key={upgradeType._id}>
              <UpgradeType key={upgradeType._id} upgradeType={upgradeType} />
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

export default CreateEventUpgradeTypes;
