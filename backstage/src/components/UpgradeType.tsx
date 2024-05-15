import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import * as EventActions from "../redux/actions/event.actions";
import * as AppActions from "../redux/actions/app.actions";
import { Colors, Icon, Icons } from "@sellout/ui";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import * as Price from "@sellout/utils/.dist/price";
import Flex from "@sellout/ui/build/components/Flex";
import ProgressBar from "../elements/ProgressBar";
import { ModalTypes } from "./modal/Modal";
import * as Polished from "polished";
import EventItemControls from "./EventItemControls";
import useEvent from "../hooks/useEvent.hook";
import usePermission from "../hooks/usePermission.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as SeasonActions from "../redux/actions/season.actions";
import useSeason from "../hooks/useSeason.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div<{ showPointer: boolean }>`
  position: relative;
  width: 600px;
  border-radius: 10px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid ${Colors.Grey5};
  transition: all 0.2s;
  background: ${Colors.White};
  ${media.mobile`
    width: 100%;
  `};

  &:hover {
    border: 1px solid ${Polished.darken(0.05, Colors.Grey5)};
    cursor: ${(props) => (props.showPointer ? "pointer" : null)};
  }

  &:active {
    border: 1px solid ${Colors.Grey4};
  }
`;

const Content = styled.div`
  padding: 20px;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

const Title = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  width: 80%;
  height: 100%;
  border-radius: 10px 10px 0px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 15px;
  overflow: hidden;
  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

const PriceText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

type UpgradeTypeProps = {
  upgradeType: IEventUpgrade;
  saveOnChanges?: boolean;
};

const UpgradeType: React.FC<UpgradeTypeProps> = ({
  upgradeType,
  saveOnChanges = true,
}) => {
  /* Hooks */

  const { event, eventId } = useEvent();
  const hasPermission = usePermission();

  /* Actions */
  const dispatch = useDispatch();
  const saveEvent = () => {
    dispatch(EventActions.saveEvent(false, false));
  };

  const editUpgradeType = () => {
    dispatch(EventActions.setUpgradeTypeId(upgradeType._id as string));
    dispatch(AppActions.pushModal(ModalTypes.UpgradeType, { saveOnChanges }));
  };

  const toggleUpgradeTypeVisible = () => {
    dispatch(
      EventActions.setUpgradeTypeVisible(
        eventId,
        upgradeType._id as string,
        !upgradeType.visible
      )
    );
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const moveUpgradeTypeUp = () => {
    dispatch(
      EventActions.moveUpgradeTypeUp(eventId, upgradeType._id as string)
    );

    if (saveOnChanges) {
      saveEvent();
    }
  };

  const moveUpgradeTypeDown = () => {
    dispatch(
      EventActions.moveUpgradeTypeDown(eventId, upgradeType._id as string)
    );

    if (saveOnChanges) {
      saveEvent();
    }
  };

  const popModal = () => dispatch(AppActions.popModal());

  const removeUpgradeType = () => {
    popModal();
    dispatch(
      EventActions.removeUpgradeType(eventId, upgradeType._id as string)
    );
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const confirmDeleteUpgradeType = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Are you sure?",
        message: `Are you sure you want to delete upgrade ${upgradeType.name}? This action cannot be undone.`,
        confirm: removeUpgradeType,
        cancel: popModal,
      })
    );
  };

  /** Render */
  const used = upgradeType.totalQty - upgradeType.remainingQty;
  const canDelete = used === 0;

  return (
    <Container showPointer={Boolean(hasPermission(RolesEnum.ADMIN))}>
      {hasPermission(RolesEnum.ADMIN) && (
        <EventItemControls
          active={upgradeType.visible}
          toggleActive={toggleUpgradeTypeVisible}
          moveUp={moveUpgradeTypeUp}
          moveDown={moveUpgradeTypeDown}
          remove={canDelete ? confirmDeleteUpgradeType : undefined}
          itemCount={event?.upgrades?.length ?? 0}
        />
      )}
      <Content
        onClick={() =>
          hasPermission(RolesEnum.ADMIN) ? editUpgradeType() : null
        }
      >
        <Flex justify="space-between" align="center">
          <Title>
            <Flex>
              <Icon
                icon={Icons.UpgradeSolid}
                color={Colors.Grey1}
                size={12}
                margin="0 7px 0 0"
                top="-2px"
              />
              {upgradeType.name}
            </Flex>
          </Title>
        </Flex>
        <Spacer />
        <Flex justify="space-between" margin="0 0 10px">
          <Text>{`${used}/${upgradeType.totalQty} Used`}</Text>
          {hasPermission(RolesEnum.ADMIN) && (
            <PriceText>
              {EventUtil.isRSVP(event as IEventGraphQL)
                ? "RSVP"
                : `$${Price.output(upgradeType.price, true)}`}
            </PriceText>
          )}
        </Flex>
        <Flex>
          <ProgressBar value={used} maxValue={upgradeType.totalQty} />
        </Flex>
      </Content>
    </Container>
  );
};

export default UpgradeType;
