import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as FeeActions from "../redux/actions/fee.actions";
import * as AppActions from "../redux/actions/app.actions";
import { Colors, Icon, Icons } from "@sellout/ui";
import IFee, { FeeTypeEnum } from "@sellout/models/.dist/interfaces/IFee";
import * as Price from "@sellout/utils/.dist/price";
import Flex from "@sellout/ui/build/components/Flex";
import { ModalTypes } from "./modal/Modal";
import * as Polished from "polished";
import EventItemControls from "./EventItemControls";
import useEvent from "../hooks/useEvent.hook";
import { EventSaleTaxEnum } from "@sellout/models/.dist/interfaces/IEvent";
import useSeason from "../hooks/useSeason.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
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
    cursor: pointer;
  }

  &:active {
    border: 1px solid ${Colors.Grey4};
  }
`;

const Content = styled.div`
  padding: 20px;
`;

const Title = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Value = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

type FeeProps = {
  fee: IFee;
};

const Fee: React.FC<FeeProps> = ({ fee }) => {
  /* State */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const editFee = () => {
    dispatch(FeeActions.setFeeId(fee._id as string));
    if (fee.name !== EventSaleTaxEnum.SalesTax) {
      dispatch(AppActions.pushModal(ModalTypes.Fee));
    }
  };

  const popModal = () => dispatch(AppActions.popModal());

  const deleteFee = () => {
    popModal();
    dispatch(FeeActions.deleteFee(fee._id as string, eventId, seasonId));
  };

  const confirmDeleteFee = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Are you sure?",
        message: `Are you sure you want to delete fee ${fee.name}? This action cannot be undone.`,
        confirm: deleteFee,
        cancel: popModal,
      })
    );
  };

  /** Render */
  const isFlat = fee.type === FeeTypeEnum.Flat;
  return (
    <Container>
      {fee.name !== EventSaleTaxEnum.SalesTax && (
        <EventItemControls
          remove={confirmDeleteFee}
          itemCount={
            event ? event?.fees?.length ?? 0 : season?.fees?.length ?? 0
          }
        />
      )}
      <Content onClick={() => editFee()}>
        <Flex justify="space-between" align="center">
          <Title>
            <Flex>
              <Icon
                icon={Icons.FeeSolid}
                color={Colors.Grey1}
                size={14}
                margin="0 7px 0 0"
                top="-1px"
              />
              {fee.name}
            </Flex>
          </Title>
        </Flex>
        <Flex justify="space-between" margin="5px 0 0">
          <Value>
            {isFlat
              ? `$${Price.output(fee.value, true)}`
              : `${fee.value.toFixed(2)}%`}
            /{fee.appliedTo.toLowerCase()}
          </Value>
        </Flex>
      </Content>
    </Container>
  );
};

export default Fee;
