import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import SelectImage, { SelectImageSizes } from "../SelectImage";
import * as SeasonActions from "../../redux/actions/season.actions";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";

type SelectEventPosterImageProps = { type: string };

const SelectEventPosterImage: React.FC<SelectEventPosterImageProps> = ({
  type,
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const { season, seasonId } = useSeason();
  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();

  const setEventPosterImageUrl = (posterImageUrl: string) =>
    dispatch(EventActions.setEventPosterImageUrl(eventId, posterImageUrl));

  const setSeasonPosterImageUrl = (posterImageUrl: string) =>
    dispatch(SeasonActions.setSeasonPosterImageUrl(seasonId, posterImageUrl));

  return (
    <SelectImage
      imageUrl={
        type === VariantEnum.Event ? event.posterImageUrl : season?.posterImageUrl
      }
      setImageUrl={
        type === VariantEnum.Event
          ? setEventPosterImageUrl
          : setSeasonPosterImageUrl
      }
      size={SelectImageSizes.Large}
      label="Poster image"
    />
  );
};

export default SelectEventPosterImage;
