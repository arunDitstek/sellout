
import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as VenueActions from "../redux/actions/venue.actions";
import { NEW_VENUE_ID } from '../redux/reducers/venue.reducer';

type NavigateToCreateVenue = (venueId?: string, venueType?: boolean) => void;

type NavigateToCreateVenueHook = () => NavigateToCreateVenue;

const useNavigateToCreateVenue: NavigateToCreateVenueHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setVenueId = (venueId: string) => dispatch(VenueActions.setVenueId(venueId));


  const createVenue = React.useCallback((venueId = NEW_VENUE_ID, venueType = false) => {
    setVenueId(venueId);
    if(venueId === NEW_VENUE_ID || venueType) {
      history.push(`/admin/dashboard/venues/create/details?venueId=${venueId}`);
    } else {
      history.push(`/admin/dashboard/venues/create/details?venueId=${venueId}`);
    }
  }, []);

  /** Return */
  return createVenue;
};

export default useNavigateToCreateVenue;
