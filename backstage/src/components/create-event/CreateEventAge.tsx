import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as EventActions from "../../redux/actions/event.actions";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import { SeasonAgeEnum } from "@sellout/models/.dist/interfaces/ISeason";
import { EventAgeEnum } from "@sellout/models/.dist/interfaces/IEvent";
import useEvent from "../../hooks/useEvent.hook";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import * as SeasonActions from "../../redux/actions/season.actions";

const Container = styled.div`
  position: relative;
`;

type CreateEventAgeProps = { type: string };

const CreateEventAge: React.FC<CreateEventAgeProps> = ({ type }) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();
  /* Actions */
  const dispatch = useDispatch();
  const setEventAge = (age: any) =>
    dispatch(EventActions.setEventAge(eventId, age));

  const setSeasonAge = (age: any) =>
    dispatch(SeasonActions.setSeasonAge(seasonId, age));
  /** Render */
  const items = Object.values(EventAgeEnum).map((age: EventAgeEnum) => {
    return {
      text: age,
      value: age,
    };
  });

  return (
    <Container>
      <Dropdown
        value={type === VariantEnum.Event ? event?.age : season?.age}
        items={items}
        onChange={(age: any) => {
          type === VariantEnum.Event ? setEventAge(age) : setSeasonAge(age);
        }}
        label="Age restriction"
      />
    </Container>
  );
};

export default CreateEventAge;
