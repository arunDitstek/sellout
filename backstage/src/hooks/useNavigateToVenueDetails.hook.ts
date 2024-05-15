import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as VenueActions from '../redux/actions/venue.actions';

type NavigateToVenueDetails = (venueId?: string, path?: string) => void;

type NavigateToVenueDetailsHook = () => NavigateToVenueDetails;

const useNavigateToVenueDetails: NavigateToVenueDetailsHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setVenueId = (venueId: string) => dispatch(VenueActions.setVenueId(venueId));

  const venueDetails = React.useCallback((venueId, path = '/overview') => {
    setVenueId(venueId);
    history.push(`/admin/dashboard/venues/details${path}?venueId=${venueId}`);
  }, []);

  /** Return */
  return venueDetails;
};

export default useNavigateToVenueDetails;
