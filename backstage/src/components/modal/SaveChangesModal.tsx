import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Flex from "@sellout/ui/build/components/Flex"
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import { useHistory } from "react-router-dom";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  max-width: 400px;
`;

type SaveChangesModalProps = {};

const SaveChangesModal: React.FC<SaveChangesModalProps> = () => {
  const history = useHistory()
  /* State */
  const { 
    title = 'Unsaved changes', 
    message = 'You have unsaved changes. Would you like to save them?',
    confirmText = 'SAVE CHANGES',
    cancelText = 'DISCARD CHANGES',
    saveChanges,
    discardChanges, 
    nextUrl
  }: ISaveChanges = useSelector(
    (state: BackstageState) => state.app.saveChanges
  );

  /* Actions */
  const dispatch = useDispatch();

  const cancel = () => {
    // dispatch(AppActions.discardChanges());
  }

  const close = () => dispatch(AppActions.popModal());

  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title={title} close={close} />
      <ModalContent>
        <Container>
          {message}
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <Flex>
          <Button
            type={ButtonTypes.Thin}
            state={ButtonStates.Warning}
            text={cancelText}
            margin="0 10px 0 0"
            onClick={() => {
              if(discardChanges) {
                discardChanges();
                close();
                if(nextUrl) {
                  history.push(nextUrl);
                }
              }
            }}
          />
          <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            onClick={async () => {
              if(saveChanges) {
                close();
                saveChanges();
              };
            }}
          />
        </Flex>
      </ModalFooter>
    </ModalContainer>
  );
};

export default SaveChangesModal;