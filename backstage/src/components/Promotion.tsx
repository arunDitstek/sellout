import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as EventActions from "../redux/actions/event.actions";
import * as AppActions from "../redux/actions/app.actions";
import { Colors, Icon, Icons } from "@sellout/ui";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import Flex from "@sellout/ui/build/components/Flex";
import ProgressBar from "../elements/ProgressBar";
import { ModalTypes } from "./modal/Modal";
import * as Polished from "polished";
import EventItemControls from "./EventItemControls";
import useEvent from "../hooks/useEvent.hook";
import usePermission from "../hooks/usePermission.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
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

type PromotionProps = {
  promotion: IEventPromotion;
  saveOnChanges?: boolean;
};

const Promotion: React.FC<PromotionProps> = ({
  promotion,
  saveOnChanges = true,
}) => {
  /* State */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();
  const hasPermission = usePermission();
  const isEvent = window.location.href.includes("eventId");

  /* Actions */
  const dispatch = useDispatch();
  const saveEvent = () => {
    if (isEvent && eventId) {
      dispatch(EventActions.saveEvent(false, false));
    } else if (seasonId) {
      dispatch(SeasonActions.saveSeason(false, false));
    }
  };

  const editPromotion = () => {
    if (isEvent && eventId) {
      dispatch(EventActions.setPromotionId(promotion._id as string));
      dispatch(AppActions.pushModal(ModalTypes.Promotion, { saveOnChanges }));
    } else if (seasonId) {
      dispatch(SeasonActions.setPromotionId(promotion._id as string));
      dispatch(
        AppActions.pushModal(ModalTypes.SeasonPromotion, { saveOnChanges })
      );
    }
  };

  const togglePromotionActive = () => {
    if (eventId) {
      dispatch(
        EventActions.setPromotionActive(
          eventId,
          promotion._id as string,
          !promotion.active
        )
      );
    } else if (seasonId) {
      dispatch(
        SeasonActions.setPromotionActive(
          seasonId,
          promotion._id as string,
          !promotion.active
        )
      );
    }
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const movePromotionUp = () => {
    if (eventId) {
      dispatch(EventActions.movePromotionUp(eventId, promotion._id as string));
    } else if (seasonId) {
      dispatch(
        SeasonActions.movePromotionUp(seasonId, promotion._id as string)
      );
    }
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const movePromotionDown = () => {
    if (eventId) {
      dispatch(
        EventActions.movePromotionDown(eventId, promotion._id as string)
      );
    } else if (seasonId) {
      dispatch(
        SeasonActions.movePromotionDown(seasonId, promotion._id as string)
      );
    }
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const popModal = () => dispatch(AppActions.popModal());

  const removePromotion = () => {
    popModal();
    if (isEvent && eventId) {
      dispatch(EventActions.removePromotion(eventId, promotion._id as string));
    } else if (seasonId) {
      dispatch(
        SeasonActions.removePromotion(seasonId, promotion._id as string)
      );
    }
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const confirmDeletePromotion = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Are you sure?",
        message: `Are you sure you want to delete secret code ${promotion.code}? This action cannot be undone.`,
        confirm: removePromotion,
        cancel: popModal,
      })
    );
  };

  const used = promotion.totalQty - promotion.remainingQty;

  /** Render */
  return (
    <Container showPointer={Boolean(hasPermission(RolesEnum.ADMIN))}>
      {hasPermission(RolesEnum.ADMIN) && (
        <EventItemControls
          active={promotion.active}
          toggleActive={togglePromotionActive}
          moveUp={movePromotionUp}
          moveDown={movePromotionDown}
          remove={confirmDeletePromotion}
          itemCount={
            eventId
              ? event?.promotions?.length ?? 0
              : season?.promotions?.length ?? 0
          }
        />
      )}

      <Content
        onClick={() =>
          hasPermission(RolesEnum.ADMIN) ? editPromotion() : null
        }
      >
        <Flex justify="space-between" align="center">
          <Title>
            <Flex>
              <Icon
                icon={Icons.KeySolid}
                color={Colors.Grey1}
                size={12}
                margin="0 7px 0 0"
                top="-2px"
              />
              {promotion.code}
            </Flex>
          </Title>
        </Flex>
        <Spacer />
        <Flex justify="space-between" margin="0 0 10px">
          <Text>{`${used}/${promotion.totalQty} Used`}</Text>
        </Flex>
        <Flex>
          <ProgressBar value={used} maxValue={promotion.totalQty} />
        </Flex>
      </Content>
    </Container>
  );
};

export default Promotion;
