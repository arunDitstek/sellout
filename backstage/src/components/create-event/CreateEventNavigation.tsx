import React from "react";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import CreateFlowNavigation, {
  CreateFlowNavigationButton,
} from "../create-flow/CreateFlowNavigation";

type CreateEventNavigationProps = {};

const CreateEventNavigation: React.FC<CreateEventNavigationProps> = ({}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  const buttons: CreateFlowNavigationButton[] = [
    {
      text: "Event Details",
      link: "/create-event/details",
      search: `eventId=${eventId}`,
      active: ["/create-event/details"],
      width: "100px",
    },
    // {
    //   text: "Venue",
    //   link: "/create-event/venue",
    //   search: `eventId=${eventId}`,
    //   active: ["/create-event/venue"],
    //   width: "60px",
    // },
    {
      text: "Dates & Times",
      link: "/create-event/dates-times",
      search: `eventId=${eventId}`,
      active: ["/create-event/dates-times"],
      width: "108px",
    },
    {
      text: "Tickets",
      link: "/create-event/ticket-types",
      search: `eventId=${eventId}`,
      active: ["/create-event/ticket-types"],
      width: "66px",
    },
    {
      text: "Upgrades",
      link: "/create-event/upgrade-types",
      search: `eventId=${eventId}`,
      active: ["/create-event/upgrade-types"],
      width: "80px",
    },
    {
      text: "Secret Codes",
      link: "/create-event/secret-codes",
      search: `eventId=${eventId}`,
      active: ["/create-event/secret-codes"],
      width: "104px",
    },
    {
      text: "Advanced Options",
      link: "/create-event/advanced-options",
      search: `eventId=${eventId}`,
      active: ["/create-event/advanced-options"],
      width: "133px",
    },
  ];

  return <CreateFlowNavigation buttons={buttons} />;
};

export default CreateEventNavigation;
