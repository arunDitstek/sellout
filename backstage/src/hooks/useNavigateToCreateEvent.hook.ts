import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as EventActions from "../redux/actions/event.actions";
import { NEW_EVENT_ID } from '../redux/reducers/event.reducer';

type NavigateToCreateEvent = (eventId?: string, eventType?: boolean) => void;

type NavigateToCreateEventHook = () => NavigateToCreateEvent;

const useNavigateToCreateEvent: NavigateToCreateEventHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setEventId = (eventId: string) => dispatch(EventActions.setEventId(eventId));


  const createEvent = React.useCallback((eventId = NEW_EVENT_ID, eventType = false) => {
    setEventId(eventId);
    // if(eventId === NEW_EVENT_ID || eventType) {
    //   history.push(`/create-event/type?eventId=${eventId}`);
    // } else {
    //   history.push(`/create-event/details?eventId=${eventId}`);
    // }
    history.push(`/create-event/details?eventId=${eventId}`);
  }, []);

  /** Return */
  return createEvent;
};

export default useNavigateToCreateEvent;
