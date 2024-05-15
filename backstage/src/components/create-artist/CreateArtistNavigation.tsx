import React from "react";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import CreateFlowNavigation, {
  CreateFlowNavigationButton,
} from "../create-flow/CreateFlowNavigation";

type CreateArtistNavigationProps = {};

const CreateArtistNavigation: React.FC<CreateArtistNavigationProps> = ({}) => {
  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId } = artistState;
  const buttons: CreateFlowNavigationButton[] = [
    {
      text: "Performer Details",
      link: "/admin/dashboard/performers/create/details",
      search: `artistId=${artistId}`,
      active: ["/admin/dashboard/performers/create/details"],
      width: "127px",
    },
    // {
    //   text: "Genres",
    //   link: "/admin/dashboard/performers/create/genres",
    //   search: `artistId=${artistId}`,
    //   active: ["/admin/dashboard/performers/create/genres"],
    //   width: "65px",
    // },
    // {
    //   text: "Social",
    //   link: "/admin/dashboard/performers/create/social",
    //   search: `artistId=${artistId}`,
    //   active: ["/admin/dashboard/performers/create/social"],
    //   width: "58px",
    // },
    // {
    //   text: "Contacts",
    //   link: "/admin/dashboard/performers/create/contacts",
    //   search: `artistId=${artistId}`,
    //   active: ["/admin/dashboard/performers/create/contacts"],
    //   width: "69px",
    // },
  ];

  return <CreateFlowNavigation buttons={buttons} />;
};

export default CreateArtistNavigation;
