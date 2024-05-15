import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as VenueActions from "../../redux/actions/venue.actions";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import Error from "../../elements/Error";
import * as Validation from "@sellout/ui/build/utils/Validation";
import useVenue from "../../hooks/useVenue.hook";
import IAddress from "@sellout/models/.dist/interfaces/IAddress";
import AddressSearchDropdown from "@sellout/ui/build/components/AddressSearchDropdown";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  width: 500px;
  ${media.mobile`
    max-width:350px;
    width: 100%;
  `};
`;

type CreateVenueAddressProps = {
  width?: string;
};

const CreateVenueAddress: React.FC<CreateVenueAddressProps> = ({}) => {
  /* Hooks */
  const { venue, venueId } = useVenue();

  /* Actions */
  const dispatch = useDispatch();
  const setVenueAddres = (address: IAddress) =>
    dispatch(VenueActions.setVenue(venueId, { address }));

  /** Render */
  return (
    <Container>
      <AddressSearchDropdown
        label="Venue address"
        value={venue?.address as IAddress}
        onChange={setVenueAddres}
        width="100%"
      />
    </Container>
  );
};

export default CreateVenueAddress;
