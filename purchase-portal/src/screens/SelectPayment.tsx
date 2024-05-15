import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import * as AppActions from "../redux/actions/app.actions";
import * as OrderActions from "../redux/actions/order.actions";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import TextButton from "@sellout/ui/build/components/TextButton";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import Dropdown, { IDropdownItem } from "@sellout/ui/build/components/Dropdown";
import IStripePaymentMethod from "@sellout/models/.dist/interfaces/IStripePaymentMethod";
import ICreateOrderParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding-bottom: 200px;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: 30px;
`;

type SelectPaymentProps = {};

const CardIconMap: Record<string, React.ReactNode> = {
  visa: (
    <Icon icon={Icons.Visa} size={14} margin="0 7px 0 0" color={Colors.Grey1} />
  ),
  mastercard: (
    <Icon
      icon={Icons.Mastercard}
      size={14}
      margin="0 7px 0 0"
      color={Colors.Grey1}
    />
  ),
  discover: (
    <Icon
      icon={Icons.Discover}
      size={14}
      margin="0 7px 0 0"
      color={Colors.Grey1}
    />
  ),
  amex: (
    <Icon icon={Icons.Amex} size={14} margin="0 7px 0 0" color={Colors.Grey1} />
  ),
};

const SelectPayment: React.FC<SelectPaymentProps> = () => {
  /** State **/
  const { order, user } = useSelector((state: PurchasePortalState) => state);
  const { userProfile } = user;

  const { paymentMethodId } = order;

  /** Actions **/
  const dispatch = useDispatch();
  const addCard = () => dispatch(AppActions.setScreen(ScreenEnum.AddPayment));

  const setPaymentMethod = (paymentMethodId: string) =>
    dispatch(OrderActions.setPaymentMethodId(paymentMethodId));

  /** Render **/
  const items: IDropdownItem[] =
    userProfile?.stripeCustomer.paymentMethods.map(
      (paymentMethod: IStripePaymentMethod) => {
        return {
          text: `**** **** **** ${paymentMethod.last4} | Exp. ${paymentMethod.expMonth}/${paymentMethod.expYear}`,
          icon: CardIconMap[paymentMethod.brand],
          value: paymentMethod.paymentMethodId,
        };
      }
    ) ?? [];

  const selectedItem =
    items.find((item) => item.value === paymentMethodId) ?? null;
  const value = selectedItem?.text;
  const icon = selectedItem?.icon;

  return (
    <Container>
      <ScreenHeader title="Payment method" />
      <Content>
        <Dropdown
          value={value}
          icon={icon}
          items={items}
          onChange={(paymentMethodId: string) => {
            setPaymentMethod(paymentMethodId);
          }}
          label="Select payment method"
          width="100%"
        />
        <TextButton
          icon={Icons.PlusCircleLight}
          onClick={() => addCard()}
          margin="15px 0 0"
        >
          Add card
        </TextButton>
      </Content>
    </Container>
  );
};

export default SelectPayment;
