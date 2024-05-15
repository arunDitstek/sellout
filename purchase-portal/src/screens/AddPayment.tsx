import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import Label from "@sellout/ui/build/components/Label";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import * as Polished from "polished";
import StripeElements from "./../containers/StripeElements";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { StripeElementStyle } from "@stripe/stripe-js";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding-bottom: 200px;

  .Element {
    margin: 0;
    max-width: 100%;
    flex: 1 0 auto;
    outline: 0;
    text-align: left;
    line-height: 1.6rem;
    background: #fff;
    border-radius: 8px;
    transition: box-shadow 0.1s ease, border-color 0.1s ease;
    box-shadow: none;
    font-size: 16px;
    padding-top: 16px;
    padding-left: 3.7rem;
    height: 56px;
    box-sizing: border-box;
  }
`;

const Form = styled.form``;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
  flex: 1;
`;

const Spacer = styled.div`
  width: 8px;
`;

type ElementContainerProps = {
  focused: boolean;
};

const ElementContainer = styled.div<ElementContainerProps>`
  position: relative;
  flex: 1;

  .Element {
    border: 1px solid
      ${(props) => {
        if (props.focused) return Colors.Grey4;
        return Colors.Grey5;
      }};

    &:hover {
      border: 1px solid
        ${(props) => {
          if (props.focused) return Colors.Grey4;
          return Polished.darken(0.05, Colors.Grey5);
        }};
    }
  }
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

const ErrorMessage = styled.p`
  color: red;
`;

enum ElementsEnum {
  CardNumber = "CardNumber",
  CVC = "CVC",
  ExpDate = "ExpDate",
}

type AddPaymentProps = {};

const AddPayment: React.FC<AddPaymentProps> = () => {
  /** State **/
  const [focused, setFocus] = React.useState<ElementsEnum | null>(null);
  const {
    app: { mode, errors },
  } = useSelector((state: PurchasePortalState) => state);
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const errorMsg: any = errors[ErrorKeyEnum.PaymentCardError];
  /** Render **/
  const style: StripeElementStyle = {
    base: {
      fontSize: "16px",
      fontWeight: "500",
      color: Colors.Grey1,
      fontSmoothing: "antialiased",
      fontFamily: "neue-haas-grotesk-display",
      "::placeholder": {
        color: Colors.Grey4,
      },
      ":focus": {},
    },
    invalid: {
      color: Colors.Red,
    },
  };

  const isFocused = (field: ElementsEnum) => field === focused;
  const iconColor = (field: ElementsEnum) =>
    isFocused(field) ? Colors.Grey3 : Colors.Grey4;

  return (
    <Container>
      <ScreenHeader title={isBoxOffice ? "Manual card entry" : "Add payment"} />
      <Content>
        <Label text="Enter your card details" />
        <Form>
          <Row>
            <ElementContainer focused={isFocused(ElementsEnum.CardNumber)}>
              <Icon
                icon={Icons.CreditCardFrontLight}
                color={iconColor(ElementsEnum.CardNumber)}
                size={14}
                position="absolute"
                top="20px"
                left="15px"
              />
              <CardNumberElement
                className="Element"
                options={{ style, placeholder: "Card Number" }}
                onFocus={() => setFocus(ElementsEnum.CardNumber)}
                onBlur={() => setFocus(null)}
              />
            </ElementContainer>
          </Row>
          <Row>
            <ElementContainer focused={isFocused(ElementsEnum.ExpDate)}>
              <Icon
                icon={Icons.CalendarDayLight}
                color={iconColor(ElementsEnum.ExpDate)}
                size={14}
                position="absolute"
                top="20px"
                left="15px"
              />
              <CardExpiryElement
                className="Element"
                options={{ style, placeholder: "Exp. Date" }}
                onFocus={() => setFocus(ElementsEnum.ExpDate)}
                onBlur={() => setFocus(null)}
              />
            </ElementContainer>
            <Spacer />
            <ElementContainer focused={isFocused(ElementsEnum.CVC)}>
              <Icon
                icon={Icons.CreditCardBackLight}
                color={iconColor(ElementsEnum.CVC)}
                size={14}
                position="absolute"
                top="20px"
                left="17px"
              />
              <CardCvcElement
                className="Element"
                options={{ style, placeholder: "CVC" }}
                onFocus={() => setFocus(ElementsEnum.CVC)}
                onBlur={() => setFocus(null)}
              />
            </ElementContainer>
          </Row>
        </Form>
        <ErrorMessage>{errorMsg}</ErrorMessage>
      </Content>
    </Container>
  );
};

const WrappedAddPayment = (props: AddPaymentProps) => (
  <StripeElements useConnectedAccount={false}>
    <AddPayment {...props} />
  </StripeElements>
);

export default WrappedAddPayment;
