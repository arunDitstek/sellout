import React from "react";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import CreateFlowNavigation, {
  CreateFlowNavigationButton,
} from "../create-flow/CreateFlowNavigation";

type CreateVenueNavigationProps = {};

const CreateVenueNavigation: React.FC<CreateVenueNavigationProps> = () => {
  /* State */
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venueId } = venueState;
  const buttons: CreateFlowNavigationButton[] = [
    {
      text: "Venue Details",
      link: "/admin/dashboard/venues/create/details",
      search: `venueId=${venueId}`,
      active: ["/admin/dashboard/venues/create/details"],
      width: "110px",
    },
  ];

  return <CreateFlowNavigation buttons={buttons} />;
};

export default CreateVenueNavigation;
