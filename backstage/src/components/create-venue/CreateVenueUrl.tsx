import React from "react";
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

type CreateVenueUrlProps = {
  width?: string;
};

const CreateVenueUrl: React.FC<CreateVenueUrlProps> = ({

}) => {
  /* Hooks */
  const { venue, venueId } = useVenue();

  /* Actions */
  const dispatch = useDispatch();
  const setVenueUrl = (url: string) =>
    dispatch(VenueActions.setVenue(venueId, { url }));
  /** Render */
  return (
    <Container>
      <Input
        label="Website"
        subLabel='(optional)'
        type="text"
        placeholder="https://"
        size={InputSizes.Regular}
        value={!venue?.url ? "" as string : venue?.url as string}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          setVenueUrl(event.currentTarget.value);
        }}
        // HANDLE ERROR
        // validationError={"This is an eror"}
        maxLength={80}
      />
    </Container>
  );
};

export default CreateVenueUrl;
