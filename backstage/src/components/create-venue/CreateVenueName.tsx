import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as VenueActions from "../../redux/actions/venue.actions";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import useVenue from "../../hooks/useVenue.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  width: 500px;
  ${media.mobile`
    max-width:350px;
    width: 100%;
  `};
`;

type CreateVenueNameProps = {
  width?: string;
};

const CreateVenueName: React.FC<CreateVenueNameProps> = ({}) => {
  /* Hooks */
  const { venue, venueId } = useVenue();

  /* Actions */
  const dispatch = useDispatch();
  const setVenueName = (name: string) =>
    dispatch(VenueActions.setVenue(venueId, { name }));

  /** Render */
  return (
    <Container>
      <Input
        label="Venue name"
        type="text"
        placeholder="Ex. The House of Blues"
        size={InputSizes.Regular}
        value={venue?.name as string}
        // width={width}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          setVenueName(event.currentTarget.value);
        }}
        // HANDLE ERROR
        // validationError={"This is an eror"}
        autoFocus
        maxLength={80}
      />
    </Container>
  );
};

export default CreateVenueName;
