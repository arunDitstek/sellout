import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Input from "@sellout/ui/build/components/Input";
import useSeason from "../../hooks/useSeason.hook";
import * as SeasonActions from "../../redux/actions/season.actions";
import { VariantEnum } from "../../models/enums/VariantEnum";

const Container = styled.div`
  position: relative;
  max-width: 400px;
  input{
    max-width: 400px;
    width: 100%;
  }
`;

type CreateEventSubtitleProps = { type: string };

const CreateEventSubtitle: React.FC<CreateEventSubtitleProps> = ({ type }) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const setEventSubtitle = (subtitle: string) =>
    dispatch(EventActions.setEventSubtitle(eventId, subtitle));

  const setSeasonSubtitle = (subtitle: string) =>
    dispatch(SeasonActions.setSeasonSubtitle(seasonId, subtitle));

  /** Render */
  return (
    <Container>
      <Input
        label="Subtitle"
        subLabel="(optional)"
        placeholder="Ex. Featuring The Rolling Stones"
        value={
          type === VariantEnum.Event
            ? (event.subtitle as string)
            : (season?.subtitle as string)
        }
        onChange={(e: React.FormEvent<HTMLInputElement>) =>
          type === VariantEnum.Event
            ? setEventSubtitle(e.currentTarget.value)
            : setSeasonSubtitle(e.currentTarget.value)
        }
        maxLength={80}
      />
    </Container>
  );
};

export default CreateEventSubtitle;
