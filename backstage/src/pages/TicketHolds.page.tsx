import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { ButtonContainer, TableContainer } from "./EventOrders.page";
import { Page } from "../components/PageLayout";
import TicketHoldsTable from "../components/TicketHoldsTable";
import FilterButton from "../elements/FilterButton";
import { Icons } from "@sellout/ui";
import { ModalTypes } from "../components/modal/Modal";
import * as AppActions from "../redux/actions/app.actions";
import * as EventActions from "../redux/actions/event.actions";
import { useQuery } from "@apollo/react-hooks";
import GET_EVENT from "@sellout/models/.dist/graphql/queries/event.query";
import useEventHook from "../hooks/useEvent.hook";
import styled from "styled-components";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const SearchContainer = styled.div`
  margin: 0px 24px 24px 0px;
  display: flex;
  justify-content: end;
  ${media.mobile`
   display: block;
  `};
`;

type TicketHoldsProps = {};

const TicketHolds: React.FC<TicketHoldsProps> = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");

  /** State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;
  useEventHook(eventId, true);

  /* Hooks */
  const onClick = () => {
    dispatch(EventActions.addTicketHolds(eventId));
    dispatch(AppActions.pushModal(ModalTypes.TicketHold));
  };

  /* GraphQl */
  const { data } = useQuery(GET_EVENT, {
    variables: {
      eventId,
    },
    fetchPolicy: "network-only",
  });
  /* Render */
  return (
    <>
      <Page>
        <SearchContainer>
          <ButtonContainer>
            <FilterButton
              text={"Create Hold Block"}
              icon={Icons.TicketSolid}
              // loading={batchPrintLoading}
              onClick={() => onClick()}
            />
          </ButtonContainer>
        </SearchContainer>
        <TableContainer>
          <TicketHoldsTable holdTickets={data?.event?.holds} />
        </TableContainer>
      </Page>
    </>
  );
};

export default TicketHolds;
