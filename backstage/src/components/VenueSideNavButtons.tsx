import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import SubSideNavigationButtons from '../elements/SubSideNavigationButtons';
import { Icons } from '@sellout/ui'
import useNavigateToCreateVenue from '../hooks/useNavigateToCreateVenue.hook';

const VenueSideNavButtons: React.FC = () => {
  /* Hooks */
  const { pathname } = useLocation();
  const history = useHistory();
  const navigateToCreateVenue = useNavigateToCreateVenue();

  /* State */
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venueId } = venueState;

  const buttons = [
    {
      icon: Icons.EyeLight,
      activeIcon: Icons.EyeSolid,
      text: 'Overview',
      onClick: () => history.push(`/admin/dashboard/venues/details/overview?venueId=${venueId}`),
      active: () => pathname === '/admin/dashboard/venues/details/overview',
    },
    {
      icon: Icons.MetricsLight,
      activeIcon: Icons.MetricsSolid,
      text: 'Metrics',
      onClick: () => history.push(`/admin/dashboard/venues/details/metrics?venueId=${venueId}`),
      active: () => pathname === '/admin/dashboard/venues/details/metrics',
    },
    {
      icon: Icons.CalendarDayLight,
      activeIcon: Icons.CalendarDaySolid,
      text: 'Events',
      onClick: () => history.push(`/admin/dashboard/venues/details/events?venueId=${venueId}`),
      active: () => pathname === '/admin/dashboard/venues/details/events',
    },
    {
      icon: Icons.SeatingLight,
      activeIcon: Icons.SeatingSolid,
      text: 'Seating Charts',
      onClick: () => history.push(`/admin/dashboard/venues/details/seating?venueId=${venueId}`),
      active: () => {
        return (
          pathname === "/admin/dashboard/venues/details/seating" ||
          pathname === "/admin/dashboard/venues/details/seating/create"
        );
      },
    },
    {
      line: true,
    },
    {
      icon: Icons.EditLight,
      activeIcon: Icons.Edit,
      text: 'Edit Venue',
      onClick: () => navigateToCreateVenue(venueId),
      active: () => null,
    },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default VenueSideNavButtons;
