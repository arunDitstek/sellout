import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import RichTextEditor from "../../elements/RichTextEditor";
import useSeason from "../../hooks/useSeason.hook";
import * as SeasonActions from "../../redux/actions/season.actions";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  width: 500px;
  ${media.mobile`
        width:100%;
    `};
`;

type CreateEventDescriptionProps = { type: string };

const CreateEventDescription: React.FC<CreateEventDescriptionProps> = ({
  type,
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const { season, seasonId } = useSeason();

  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();
  const setEventDescription = (description: string) =>
    dispatch(EventActions.setEventDescription(eventId, description));

  const setSeasonDescription = (description: string) =>
    dispatch(SeasonActions.setSeasonDescription(seasonId, description));
  /** Render */

  return (
    <Container>
      <RichTextEditor
        value={
          type === VariantEnum.Event
            ? event?.description
              ? (event?.description)
                  .replaceAll("<p></p>", "")
                  .replaceAll("&#x27;", "'")
                  .replaceAll("&quot;", "'")
              : ("" as string)
            : season?.description
            ? (season?.description)
                .replaceAll("<p></p>", "")
                .replaceAll("&#x27;", "'")
                .replaceAll("&quot;", "'")
            : ("" as string)
        }
        onChange={(description: string) => {
          type === VariantEnum.Event
            ? setEventDescription(description)
            : setSeasonDescription(description);
        }}
        placeholder="Enter the event description"
        label="Description"
      />
    </Container>
  );
};

export default CreateEventDescription;
