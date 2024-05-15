import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Flex from "@sellout/ui/build/components/Flex"
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalTypes,
} from "./Modal";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  width: 400px;
  ${media.mobile`
    width: 100%;
  `};
`;

type ConfirmActionModalProps = {};

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = () => {
  /* State */
  const {
    confirmAction: {
      title = 'Are you sure?',
      message,
      confirm,
      confirmText = 'CONFIRM',
      cancel,
      cancelText = 'CANCEL',
    },
  } = useSelector((state: BackstageState) => state.app);
  const loading = useSelector((state: BackstageState) => state.app.loadingConfirm);
  /* Actions */
  const dispatch = useDispatch();

  const close = () => {
    dispatch(AppActions.popModal());
  };

  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title={title} close={close} />
      <Container>
        <ModalContent>{message}</ModalContent>
      </Container>
      <ModalFooter>
        <div />
        <Flex>
          {cancel && (
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={cancelText}
              margin="0 10px 0 0"
              onClick={() => {
                if (cancel) cancel();
              }}
            />
          )}
          <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            onClick={() => {
              if (confirm) confirm();
            }}
            loading={loading}
          />
        </Flex>
      </ModalFooter>
    </ModalContainer>
  );
};

export default ConfirmActionModal;