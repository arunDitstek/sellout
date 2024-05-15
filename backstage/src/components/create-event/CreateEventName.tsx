import React from "react";
import styled from "styled-components";
import * as EventActions from "../../redux/actions/event.actions";
import Input from "@sellout/ui/build/components/Input";
import useEvent from "../../hooks/useEvent.hook";
import { useDispatch } from "react-redux";
import * as SeasonActions from "../../redux/actions/season.actions";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";

const Container = styled.div`
  position: relative;
  max-width: 400px;
  input{
    max-width: 400px;
    width: 100%;
  }
`;

type CreateEventNameProps = { type: string };

const CreateEventName: React.FC<CreateEventNameProps> = ({ type }) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const setSeasonName = (name: string) =>
    dispatch(SeasonActions.setSeasonName(seasonId, name));

  const setEventName = (name: string) =>
    dispatch(EventActions.setEventName(eventId, name));

  return (
    <Container>
      <Input
        label={type === VariantEnum.Event ? "Event name" : "Season name"}
        placeholder="Ex. An Evening with The Beatles"
        value={
          type === VariantEnum.Event
            ? (event?.name as string)
            : (season?.name as string)
        }
        onChange={(e: React.FormEvent<HTMLInputElement>) =>
          type === VariantEnum.Event
            ? setEventName(e.currentTarget.value)
            : setSeasonName(e.currentTarget.value)
        }
        maxLength={80}
      />
    </Container>
  );
};

export default CreateEventName;
