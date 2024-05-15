import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import { SendQRCodeEnum } from "@sellout/models/.dist/interfaces/IEvent";
import * as SeasonActions from "../../redux/actions/season.actions";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";

const Container = styled.div`
  position: relative;
`;

type CreateEventSendQRCodeProps = { type: string };

const CreateEventAge: React.FC<CreateEventSendQRCodeProps> = ({ type }) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const setEventSendQRCode = (sendQRCode: SendQRCodeEnum) =>
    dispatch(EventActions.setEventSendQRCode(eventId, sendQRCode));

  const setSeasonSendQRCode = (sendQRCode: SendQRCodeEnum) =>
    dispatch(SeasonActions.setSeasonSendQRCode(seasonId, sendQRCode));

  const items = Object.values(SendQRCodeEnum).map(
    (sendQRCode: SendQRCodeEnum) => {
      return {
        text: sendQRCode,
        value: sendQRCode,
      };
    }
  );

  /** Render */
  return (
    <Container>
      <Dropdown
        value={
          type === VariantEnum.Event ? event?.sendQRCode : season?.sendQRCode
        }
        items={items}
        onChange={(sendQRCode: SendQRCodeEnum) => {
          if (type === VariantEnum.Event) {
            setEventSendQRCode(sendQRCode);
          } else {
            setSeasonSendQRCode(sendQRCode);
          }
        }}
        label="When will customers receive their tickets?"
      />
    </Container>
  );
};

export default CreateEventAge;
