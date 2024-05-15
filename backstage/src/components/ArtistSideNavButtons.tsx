import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { Icons } from "@sellout/ui";
import SubSideNavigationButtons from '../elements/SubSideNavigationButtons';
import useNavigateToCreateArtist from '../hooks/useNavigateToCreateArtist.hook';

const ArtistSideNavButtons: React.FC = () => {
  /* Hooks */
  const { pathname } = useLocation();
  const history = useHistory();
  const navigateToCreateArtist = useNavigateToCreateArtist();

  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId } = artistState;

  const buttons = [
    {
      icon: Icons.EyeLight,
      activeIcon: Icons.EyeSolid,
      text: "Overview",
      onClick: () =>
        history.push(
          `/admin/dashboard/performers/details/overview?artistId=${artistId}`
        ),
      active: () => pathname === "/admin/dashboard/performers/details/overview",
    },
    {
      icon: Icons.MetricsLight,
      activeIcon: Icons.MetricsSolid,
      text: "Metrics",
      onClick: () =>
        history.push(
          `/admin/dashboard/performers/details/metrics?artistId=${artistId}`
        ),
      active: () => pathname === "/admin/dashboard/performers/details/metrics",
    },
    {
      icon: Icons.CalendarDayLight,
      activeIcon: Icons.CalendarDaySolid,
      text: "Events",
      onClick: () =>
        history.push(
          `/admin/dashboard/performers/details/events?artistId=${artistId}`
        ),
      active: () => pathname === "/admin/dashboard/performers/details/events",
    },
    {
      line: true,
    },
    {
      icon: Icons.EditLight,
      activeIcon: Icons.Edit,
      text: "Edit Performer",
      onClick: () => navigateToCreateArtist(artistId),
      active: () => null,
    },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default ArtistSideNavButtons;
