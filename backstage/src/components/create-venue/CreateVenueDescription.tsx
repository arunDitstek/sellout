import React from "react";
import styled from 'styled-components';
import { useDispatch } from "react-redux";
import * as VenueActions from "../../redux/actions/venue.actions";
import RichTextEditor from "../../elements/RichTextEditor";
import useVenue from "../../hooks/useVenue.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  /* width: 600px; */
`;

type CreateVenueDescriptionProps = {};

const CreateVenueDescription: React.FC<CreateVenueDescriptionProps> = () => {
  /* Hooks */
  const { venue, venueId } = useVenue();

  /* Actions */
  const dispatch = useDispatch();
  const setVenueDescription = (description: string) => {
    dispatch(VenueActions.setVenue(venueId, { description }));
  };

  /** Render */
  return (
    <Container>
      <RichTextEditor
        value={venue?.description  ? (venue?.description).replaceAll("<p></p>", "").replaceAll("&#x27;","'").replaceAll("&quot;","'"): "" as string }
        onChange={(description: string) => {
          setVenueDescription(description);
        }}
        placeholder="Enter the venue description"
        label="Venue description"
        subLabel='(optional)'
      />
    </Container>
  );
};

export default CreateVenueDescription;
