import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as EventActions from "../redux/actions/event.actions";

type NavigateToEventDetails = (eventId?: string, path?: string) => void;

type NavigateToEventDetailsHook = () => NavigateToEventDetails;

const useNavigateToEventDetails: NavigateToEventDetailsHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setEventId = (eventId: string) => dispatch(EventActions.setEventId(eventId));

  const eventDetails = React.useCallback((eventId, path = '/overview') => {
    setEventId(eventId);
    history.push(`/admin/dashboard/events/details${path}?eventId=${eventId}`);
  }, []);

  /** Return */
  return eventDetails;
};

export default useNavigateToEventDetails;
