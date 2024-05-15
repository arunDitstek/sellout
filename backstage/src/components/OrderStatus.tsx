import React from "react";
import styled from "styled-components";
import { rgba } from "polished";
import { Colors } from "@sellout/ui";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";

type StatusProps = {
  color: string;
  margin?: string;
  orderDetailModal?: boolean;
};

const Status = styled.div<StatusProps>`
  height: 20px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background-color: ${(props) =>
    props.orderDetailModal ? props.color : rgba(props.color, 0.1)};
  color: ${(props) => (props.orderDetailModal ? Colors.White : props.color)};
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  margin: ${(props) => props.margin};
`;

type OrderStatusProps = {
  order?: IOrder;
  margin: string;
  orderDetailModal?: boolean;
};

const OrderStatus: React.FC<OrderStatusProps> = ({
  order,
  margin,
  orderDetailModal,
}) => {
  if (!order) return <div />;

  const { state, hidden } = order;

  let text: string | undefined = "Paid";
  let color: string = Colors.Green;

  if (state === "Active") {
    text = "Paid";
    color = Colors.Green;
  }

  if (state !== "Active") {
    color = Colors.Orange;
    text = state?.toString();
  }

  if (state === "Refunded") {
    color = Colors.Red;
    text = "Refunded";
  }

  // Complimentary
  if (OrderUtil.isComp(order)) {
    color = Colors.Blue;
    text = "Complimentary";

    if (state === "Refunded") {
      color = Colors.Red;
      text = "Refunded";
    }
    
    if (state === "Canceled" ) {
      color = Colors.Orange;
      text = "Canceled";
    }
  }

  // RSVP
  if (OrderUtil.isRSVP(order)) {
    color = Colors.Blue;
    text = "RSVP";
    if (state !== "Active") {
      color = Colors.Orange;
      text = state?.toString();
    }
    if (state === "Refunded") {
      color = Colors.Red;
      text = "Canceled";
    }
  }

  if (hidden) {
    text = "Season";
    color = Colors.Yellow;
  }
  return (
    <Status color={color} margin={margin} orderDetailModal={orderDetailModal}>
      {text}
    </Status>
  );
};

export default OrderStatus;
