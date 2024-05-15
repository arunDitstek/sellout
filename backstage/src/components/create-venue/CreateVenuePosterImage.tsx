import React from "react";
import { useDispatch } from "react-redux";
import * as VenueActions from "../../redux/actions/venue.actions";
import SelectImage, { SelectImageSizes } from "../SelectImage";
import useVenue from "../../hooks/useVenue.hook";

type CreateVenuePosterImageProps = {};

const CreateVenuePosterImage: React.FC<CreateVenuePosterImageProps> = () => {
  /* Hooks */
  const { venue, venueId } = useVenue();

  /* State */
  const venueImageUrl = venue?.imageUrls?.[0];

  /* Actions */
  const dispatch = useDispatch();

  const addImage = (imageUrl: string) => {
    dispatch(
      VenueActions.addVenueImageUrl(
        venueId,
        imageUrl
      )
    );
  };

  const removeImage = (imageUrl: string) => {
    dispatch(
      VenueActions.removeVenueImageUrl(
        venueId,
        imageUrl
      )
    );
  };

  const toggleImageUrl = (imageUrl: string) => {
    if(Boolean(!imageUrl)) {
      removeImage(venueImageUrl as string)
    } else {
      if(venueImageUrl) {
        removeImage(venueImageUrl);
      }
      addImage(imageUrl);
    }
  }

  return (
    <SelectImage
      imageUrl={venueImageUrl}
      setImageUrl={toggleImageUrl}
      label="Venue image"
      size={SelectImageSizes.Large}
    />
  );
};
 
export default CreateVenuePosterImage;
