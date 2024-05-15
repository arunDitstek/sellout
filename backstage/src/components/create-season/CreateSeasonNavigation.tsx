import React from "react";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import CreateFlowNavigation, {
  CreateFlowNavigationButton,
} from "../create-flow/CreateFlowNavigation";
import styled from "styled-components";
import { media } from "@sellout/ui/build/utils/MediaQuery";

type CreateSeasonNavigationProps = {};

const CreateSeasonNavigation: React.FC<CreateSeasonNavigationProps> = ({ }) => {
  /* State */
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId } = seasonState;

  const buttons: CreateFlowNavigationButton[] = [
    {
      text: "Season Details",
      link: "/create-season/details",
      search: `seasonId=${seasonId}`,
      active: ["/create-season/details"],

    },
    {
      text: "Dates & Times",
      link: "/create-season/dates-times",
      search: `seasonId=${seasonId}`,
      active: ["/create-season/dates-times"],
    },
    {
      text: "Tickets",
      link: "/create-season/ticket-types",
      search: `seasonId=${seasonId}`,
      active: ["/create-season/ticket-types"],
    },
    // {
    //   text: "Upgrades",
    //   link: "/create-season/upgrade-types",
    //   search: `seasonId=${seasonId}`,
    //   active: ["/create-season/upgrade-types"],
    //   width: "80px",
    // },
    {
      text: "Secret Codes",
      link: "/create-season/secret-codes",
      search: `seasonId=${seasonId}`,
      active: ["/create-season/secret-codes"],
    },
    {
      text: "Advanced Options",
      link: "/create-season/advanced-options",
      search: `seasonId=${seasonId}`,
      active: ["/create-season/advanced-options"],
    },
  ];

  return <CreateFlowNavigation buttons={buttons} />;
};

export default CreateSeasonNavigation;
