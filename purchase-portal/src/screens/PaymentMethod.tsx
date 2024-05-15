import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { Colors } from "@sellout/ui/build/Colors";
import { Icons } from "@sellout/ui/build/components/Icon";
import ScreenHeader from "../components/ScreenHeader";
import * as AppActions from "../redux/actions/app.actions";
import * as OrderActions from "../redux/actions/order.actions";
import Select from "../components/Select";
import ICreateOrderParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import { Label } from "@sellout/ui";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

type PaymentMethodProps = {};

const PaymentMethod: React.FC<PaymentMethodProps> = () => {
  /** Actions **/
  const dispatch = useDispatch();
  const setOrder = (params: Partial<ICreateOrderParams>) => {
    dispatch(OrderActions.setCreateOrderParams(params));
    dispatch(AppActions.navigateForward());
  };
  /** Render **/
  const options = [
    {
      text: "Card reader",
      icon: Icons.CalculatorLight,
      onClick: () =>
        setOrder({ paymentMethodType: PaymentMethodTypeEnum.CardReader }),
    },
    {
      text: "Manual card entry",
      icon: Icons.CreditCardBackLight,
      onClick: () =>
        setOrder({ paymentMethodType: PaymentMethodTypeEnum.CardEntry }),
    },
    {
      text: "Cash",
      icon: Icons.Cash,
      onClick: () =>
        setOrder({ paymentMethodType: PaymentMethodTypeEnum.Cash }),
    },
    {
      text: "Check",
      icon: Icons.Cash,
      onClick: () =>
        setOrder({ paymentMethodType: PaymentMethodTypeEnum.Check }),
    },
  ];
  return (
    <Container>
      <ScreenHeader title="Payment method" />
      <Content>
        <Label text="Choose a payment method" />
        <Select options={options} />
      </Content>
    </Container>
  );
};

export default PaymentMethod;
