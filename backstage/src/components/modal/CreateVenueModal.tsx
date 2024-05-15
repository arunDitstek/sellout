import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import * as VenueActions from "../../redux/actions/venue.actions";
import Button, { ButtonTypes } from '@sellout/ui/build/components/Button';
import Error from '../../elements/Error';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import CreateVenueName from "../create-venue/CreateVenueName";
import CreateVenueAddress from "../create-venue/CreateVenueAddress";
import CreateVenueTax from "../create-venue/CreateVenueTaxPercentage";

const Container = styled.div`
  width: 400px;
`;

const Spacer = styled.div`
  height: 30px;
`;

type CreateVenueModalProps = {}

const CreateVenueModal: React.FC<CreateVenueModalProps> = ({ }) => {
  /* State */
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { errorMsg } = venueState;

  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());

  const createVenue = () => dispatch(VenueActions.createEventVenue());

  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title="Create Venue" close={popModal} />
      <ModalContent>
        <Container>
          <CreateVenueName />
          <Spacer />
          <CreateVenueAddress />
          <Spacer />
          <CreateVenueTax width="400px"/>
          {/* <Spacer /> */}
          {/* <CreateVenuePosterImage /> */}
          {errorMsg && (
            <Error
              children={errorMsg}
              margin="16px 0px 0px"
            />
          )}
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <Button
          type={ButtonTypes.Thin}
          text="CREATE VENUE"
          onClick={() => {
            createVenue();
          }}
        />
      </ModalFooter>
    </ModalContainer>
  );
};

export default CreateVenueModal;
