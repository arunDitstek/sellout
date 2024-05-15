import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as ArtistActions from '../redux/actions/artist.actions';

type NavigateToArtistDetails = (artistId?: string, path?: string) => void;

type NavigateToArtistDetailsHook = () => NavigateToArtistDetails;

const useNavigateToArtistDetails: NavigateToArtistDetailsHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setArtistId = (artistId: string) => dispatch(ArtistActions.setArtistId(artistId));

  const artistDetails = React.useCallback((artistId, path = '/overview') => {
    setArtistId(artistId);
    history.push(`/admin/dashboard/performers/details${path}?artistId=${artistId}`);
  }, []);

  /** Return */
  return artistDetails;
};

export default useNavigateToArtistDetails;
