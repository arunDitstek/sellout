import React from "react";
import { useDispatch } from "react-redux";
import * as ArtistActions from "../../redux/actions/artist.actions";
import SelectImage, { SelectImageSizes } from "../SelectImage";
import IArtistPressKit from "@sellout/models/.dist/interfaces/IArtistPressKit";
import useArtist from "../../hooks/useArtist.hook";

type CreateArtistPosterImageProps = {};

const CreateArtistPosterImage: React.FC<CreateArtistPosterImageProps> = () => {
  /* Hooks */
  const { artist, artistId } = useArtist();

  /* State */
  const pressKit: IArtistPressKit = artist?.pressKits?.[0] as IArtistPressKit;
  const artistImageUrl = pressKit.posterImageUrls[0];

  /* Actions */
  const dispatch = useDispatch();

  const addImage = (imageUrl: string) => {
    dispatch(
      ArtistActions.addPressKitImageUrl(
        artistId,
        pressKit._id,
        imageUrl
      )
    );
  };

  const removeImage = (imageUrl: string) => {
    dispatch(
      ArtistActions.removePressKitImageUrl(
        artistId,
        pressKit._id,
        imageUrl
      )
    );
  };

  const toggleImageUrl = (imageUrl: string) => {
    if (Boolean(!imageUrl)) removeImage(artistImageUrl as string);
    else addImage(imageUrl);
  };

  return (
    <SelectImage
      imageUrl={artistImageUrl}
      setImageUrl={toggleImageUrl}
      label="Performer image"
      size={SelectImageSizes.Large}
    />
  );
};

export default CreateArtistPosterImage;
