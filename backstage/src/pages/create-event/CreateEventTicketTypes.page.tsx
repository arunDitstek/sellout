import React, { Fragment } from "react";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import * as SeasonActions from "../../redux/actions/season.actions";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import TicketType from "../../components/TicketType";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import { ModalTypes } from "../../components/modal/Modal";
import Button, {
  ButtonTypes,
  ButtonIconPosition,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import useEvent from "../../hooks/useEvent.hook";
import { Icons, Icon, Colors, Flex } from "@sellout/ui";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SelectEventSeatingChart from "../../components/create-event/SelectEventSeatingChart";
import SelectSeasonSeatingChart from "../../components/create-season/SelectSeasonSeatingChart";
import {
  Container,
  Content,
  TitleContainer,
  Title,
  Subtitle,
  Spacer,
  NoContent,
  NoContentText,
} from "../../components/create-flow/CreateFlowStyles";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../models/enums/VariantEnum";

type CreateEventTicketTypesProps = { saveOnChanges?: boolean };

const CreateEventTicketTypes: React.FC<CreateEventTicketTypesProps> = ({
  saveOnChanges = true,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const isEvent = window.location.href.includes("eventId");
  const isSeason = window.location.href.includes("seasonId");
  const addTicketType = () => {
    if (isEvent && event) {
      dispatch(EventActions.addTicketType(eventId));
      dispatch(AppActions.pushModal(ModalTypes.TicketType, { saveOnChanges }));
    } else if (season) {
      dispatch(SeasonActions.addSeasonTicketType(seasonId));
      dispatch(
        AppActions.pushModal(ModalTypes.SeasonTicketType, { saveOnChanges })
      );
    }
  };

  /* Render */
  const ticketData = isEvent ? event : season;
  const hasContent = Boolean(ticketData?.ticketTypes?.length);
  const seated = eventId ? EventUtil.isSeated(event) : true;

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center" justify="space-between" margin="0 0 10px">
            <Flex align="center">
              <Title>Tickets</Title>
              <Icon
                icon={Icons.HelpSolid}
                size={18}
                top="3px"
                color={Colors.Grey5}
                margin="0 0 0 8px"
                onClick={() =>
                  window.open(
                    "https://help.sellout.io/en/articles/4433943-creating-tickets",
                    "_blank"
                  )
                }
              />
            </Flex>
            <Button
              type={ButtonTypes.Thin}
              state={
                seated || isSeason && season ? ButtonStates.Disabled : ButtonStates.Active
              }
              text={seated || isSeason && season ? "TICKET TYPES LOCKED" : "CREATE TICKET"}
              icon={seated || isSeason && season ? Icons.Lock : Icons.Plus}
              iconPosition={ButtonIconPosition.Left}
              iconSize={12}
              onClick={() => addTicketType()}
            />
          </Flex>
          <Subtitle>
            Create unlimited ticket types and modify their pricing and
            availability.
          </Subtitle>
        </TitleContainer>
        {!hasContent && (
          <Fragment>
            <NoContent>
              <NoContentText>No tickets yet</NoContentText>
            </NoContent>
            <Spacer />
          </Fragment>
        )}
        {ticketData?.seatingChartKey && (
          <Fragment>
            {eventId && !event?.seasonId ? (
              <SelectEventSeatingChart showChart={false} />
            ) : (
              <>
                {season ? (
                  <SelectSeasonSeatingChart showChart={false} />
                ) : (
                  <>
                    <Subtitle>
                      This event is seated and will use the seating chart of the
                      selected season.
                    </Subtitle>
                    <Spacer />
                  </>
                )}
              </>
            )}
            <Spacer />
          </Fragment>
        )}

        {ticketData?.ticketTypes?.map((ticketType: ITicketType) => {
          return (
            <Fragment key={ticketType._id}>
              <TicketType ticketType={ticketType} />
              <Spacer />
            </Fragment>
          );
        })}
        {ticketData?.ticketTypes && ticketData?.ticketTypes.length > 0 && (
          <CreateEventSaveButton season={season} event={event} />
        )}
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventTicketTypes;
