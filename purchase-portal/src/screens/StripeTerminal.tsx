import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import * as OrderActions from "../redux/actions/order.actions";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import Flex from "@sellout/ui/build/components/Flex";
import Dropdown, { IDropdownItem } from "@sellout/ui/build/components/Dropdown";
import { Reader } from "@stripe/terminal-js";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  height: 430px;
`;

const Content = styled.div`
  position: relative;
  margin: 24px 0 0;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: calc(100% - 100px);
`;

const DropdownContainer = styled.div`
  height: 100px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey3};
  margin-top: 10px;
`;
const ErrorMessage = styled.p`
  color: red;
`;

type StripeTerminalScreenProps = {};

const StripeTerminalScreen: React.FC<StripeTerminalScreenProps> = () => {
  /** State **/
  const { terminalConnected, selectedReader, terminalReaders } = useSelector(
    (state: PurchasePortalState) => state.order
  );
  const { app, order, user } = useSelector(
    (state: PurchasePortalState) => state
  );
  const errorMsg: any = app.errors[ErrorKeyEnum.ConFirmOrderError];

  /** Actions **/
  const dispatch = useDispatch();
  const connectToStripeTerminalReader = (reader: Reader) =>
    dispatch(OrderActions.connectToStripeTerminalReader(reader));

  /** Render **/
  const items: IDropdownItem[] =
    terminalReaders
      ?.filter((reader: Reader) => reader.status === "online")
      .map((reader: Reader) => {
        return {
          text: reader?.label ?? "Unlabeled Reader",
          value: reader,
        };
      }) ?? [];

  return (
    <Container>
      <ScreenHeader title="Card reader" />
      <Content>
        {terminalConnected ? (
          <Fragment>
            <DropdownContainer>
              <Dropdown
                value={selectedReader?.label ?? ""}
                items={items}
                onChange={(reader: any) => {
                  connectToStripeTerminalReader(reader);
                }}
                label="Select card reader"
                width="100%"
              />
            </DropdownContainer>
            <Flex flex="1" direction="column" align="center" justify="center">
              <Icon
                icon={Icons.CalculatorSolid}
                color={Colors.Grey3}
                size={36}
              />

              <Text>Swipe, dip, or tap a payment method on the reader</Text>
              <ErrorMessage>{errorMsg}</ErrorMessage>
            </Flex>
          </Fragment>
        ) : (
          <ErrorMessage>{"Card Reader is not connected"}</ErrorMessage>
        )}
      </Content>
    </Container>
  );
};

export default StripeTerminalScreen;
