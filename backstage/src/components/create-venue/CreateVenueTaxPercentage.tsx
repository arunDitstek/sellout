import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as VenueActions from "../../redux/actions/venue.actions";
import FormattedfullInput, {
  InputfullFormats,
} from "@sellout/ui/build/components/FormattedfullInput";
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

type CreateVenueTaxProps = {
  width?: string;
};

const CreateVenueTax: React.FC<CreateVenueTaxProps> = ({}) => {
  /* Hooks */
  const { venue, venueId } = useVenue();
  /* Actions */
  const dispatch = useDispatch();
  const setVenueTax = (tax: string) => {
    if (parseFloat(tax) < 0) {
      tax = "0";
    }
    dispatch(VenueActions.setVenue(venueId, { tax }));
  };
  const setVenueTaxes = (tax: string) => {
    if (parseFloat(tax) > 0) {
      tax = parseFloat(tax).toFixed(2).toString();
    }
    dispatch(VenueActions.setVenue(venueId, { tax }));
  };

  /** Render */
  return (
    <Container>
      <FormattedfullInput
        label="Sales Tax Percent"
        subLabel="(optional)"
        type="number"
        placeholder="0"
        value={venue?.tax as string}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          setVenueTax(event.currentTarget.value);
        }}
        onMouseLeave={(event: React.FormEvent<HTMLInputElement>) => {
          setVenueTaxes(event.currentTarget.value);
        }}
        format={InputfullFormats.Percent}
      />
    </Container>
  );
};

export default CreateVenueTax;
