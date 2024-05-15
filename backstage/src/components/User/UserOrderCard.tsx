import React from 'react';
import styled from 'styled-components';
import UserEventPreview from "./UserEventPreview";
import UserOrderStatus from "./UserOrderStatus";
import {useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import { ModalTypes } from '../modal/Modal';
import * as OrderActions from '../../redux/actions/order.actions';

type PropTypes = {
    order: any
};

const Container = styled.div`
  margin-right: 0px;
  margin-bottom: 10px;
  border-radius: 5px;

  &:hover {
    cursor: pointer;
  }

  @media screen and (min-width: 768px) {
    margin-right: 20px;
    margin-bottom: 20px;
  }
`;

const StatusContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-self: right;
  justify-content: flex-end;
  right: 5px;
  top: 5px;
`;

const UserEventCard: React.FC<PropTypes> = ({
    order
}) => {

    const dispatch = useDispatch();
    const OrderTicketModal = () => {
        dispatch(OrderActions.setOrderId(order._id as string));
        dispatch(AppActions.pushModal(ModalTypes.UserOrderTicket));
    }

    /** Hooks */
    if (!order) return null;
    const { event } = order;
    
    return (
        <Container onClick={OrderTicketModal}>
            <StatusContainer>
                <UserOrderStatus order={order} />
            </StatusContainer>
            <UserEventPreview
                event={event}
                animation
            />
        </Container>
    );
};

export default UserEventCard;
