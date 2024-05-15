import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';

type StatusProps = {
  margin: string;
};

const Status = styled.div<StatusProps>`
  padding: 5px 10px;
  display: inline-flex;
  align-items: center;
  border-radius: 100px;
  background-color: ${props => props.color};
  color: ${Colors.White};
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  margin: ${props => props.margin};
  position: absolute;
  z-index: 1;
`;

type PropTypes = {
  order?: any, margin?: any
};

const UserOrderStatus: React.FC<PropTypes> = ({ order, margin }) => {
  //  if (!order) return 'Invalid Order State';

  const { state } = order;

  let tickets = order.tickets.filter(a => !a.refund.refunded).length
  let text = tickets > 1
    ? `You have ${tickets} tickets`
    : `You have ${tickets} ticket`;

  if (state === 'Refunded' || tickets.length===0) {
    text = 'Refunded';
  }

  return (
    <Status
      color={Colors.Purple}
      margin={margin}
    >
      {text}
    </Status>
  );
}
export default UserOrderStatus
