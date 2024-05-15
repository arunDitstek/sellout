import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import * as OrderActions from "../redux/actions/order.actions";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import * as Price from "@sellout/utils/.dist/price";
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/IOrder";
import { saturate } from "polished";

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

const Text = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
  margin-top: 5px;
`;

type CashPaymentProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const CashPayment: React.FC<CashPaymentProps> = ({ event, season }) => {
  /** State **/
  const { order } = useSelector((state: PurchasePortalState) => state);
  const {
    cashTendered,
    createOrderParams: { tickets, upgrades, paymentMethodType },
  } = order;

  

  /** Actions **/
  const dispatch = useDispatch();
  const setCashTendered = (cashTendered: number) => {
    
    dispatch(OrderActions.setCashTendered(cashTendered));
  };

  /** Render **/
  // let guestFees = PaymentUtil.calculateGuestFee(
  //   tickets as any,
  //   event ? (event as any) : (season as any)
  // );

  const totalParams = {
    tickets,
    upgrades,
    fees: event ? event?.fees : season?.fees,
    paymentMethodType,
  };

  const total = PaymentUtil.calculatePaymentTotal(totalParams as any).total ;

  return (
    <Container>
      <ScreenHeader title="Cash payment" />
      <Content>
        <FormattedInput
          label="Enter cash tendered"
          placeholder="0.00"
          width="150px"
          inputWidth={true}
          value={cashTendered ? Price.output(cashTendered) : ""}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            setCashTendered(Price.input(e.currentTarget.value));
          }}
          format={InputFormats.Price}
        />
        <Text>{`Must enter an amount more than $${Price.output(
          total,
          true
        )}`}</Text>
      </Content>
    </Container>
  );
};

export default CashPayment;
