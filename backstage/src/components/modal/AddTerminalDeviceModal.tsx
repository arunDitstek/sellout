import React, { useState, Fragment } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";
import Error from "../../elements/Error";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import LIST_STRIPE_TERMINAL_READERS from '@sellout/models/.dist/graphql/queries/listStripeTerminalReaders.query'
import REGISTER_STRIPE_TERMINAL_READER from "@sellout/models/.dist/graphql/mutations/registerStripeTerminalReader.mutation";
import { useMutation } from "@apollo/react-hooks";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  width: 100%;
`;

const LoaderContainer = styled.div`
  width: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderText = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 24px;
`;

const Text = styled.div`
  color: ${Colors.Grey2};
  font-size: 1.4rem;
  margin-bottom: 24px;
`;

const AddRoleModal: React.FC = () => {
  /* State */
  const [label, setLabel] = useState("");
  const [registrationCode, setRegisrationCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());

  /* GraphQL */
  const [registerReader, { loading }] = useMutation(REGISTER_STRIPE_TERMINAL_READER, {
    variables: {
      label,
      registrationCode,
    },
    onCompleted(data) {
      popModal();
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
    refetchQueries: [
      {
        query: LIST_STRIPE_TERMINAL_READERS,
      }
    ]
  });

  /* Render */
  return (
    <ModalContainer>
      <ModalHeader title="Add new card reader" close={popModal} />
      {loading ? (
        <LoaderContainer>
          <Loader size={LoaderSizes.Large} color={Colors.Orange} />
        </LoaderContainer>
      ) : (
        <Fragment>
          <ModalContent>
            <Container>
              <HeaderText>
                Follow these steps to connect your card reader:
              </HeaderText>
              <Text>
                1. Connect the reader to the internet via WIFI by plugging in the reader and entering the sequence 0-9-4-3-4.
              </Text>
              <Text>
                2. Follow the on-screen instructions to connect the reader to your WIFI network.
              </Text>
              <Text>
                3. Once connected, enter the sequence 0-7-1-3-9 to display a unique registration code.
              </Text>
              <Text>
                4. Enter the unique registration code below and choose a name for you reader.
              </Text>
              <Input
                label="Registration Code"
                autoFocus
                placeholder="Enter the registration code"
                size={InputSizes.Large}
                value={registrationCode}
                onChange={(event: React.FormEvent<HTMLInputElement>) => {
                  if (errorMsg) setErrorMsg("");
                  setRegisrationCode(event.currentTarget.value);
                }}
                onClear={() => {
                  setRegisrationCode("");
                }}
                margin="0px 0px 24px 0px"
              />
              <Input
                label="Reader name"
                placeholder="Enter a name for you reader"
                size={InputSizes.Large}
                value={label}
                onChange={(event: React.FormEvent<HTMLInputElement>) => {
                  if (errorMsg) setErrorMsg("");
                  setLabel(event.currentTarget.value);
                }}
                onClear={() => {
                  setLabel("");
                }}
              />
              {errorMsg && <Error margin="10px 0px 0px 0px">{errorMsg}</Error>}
            </Container>
          </ModalContent>
          <ModalFooter>
            <div />
            <Button
              type={ButtonTypes.Thin}
              text="ADD READER"
              state={label && registrationCode ? ButtonStates.Active : ButtonStates.Disabled}
              onClick={() => {
                registerReader();
              }}
            />
          </ModalFooter>
        </Fragment>
      )}
    </ModalContainer>
  );
};

export default AddRoleModal;
