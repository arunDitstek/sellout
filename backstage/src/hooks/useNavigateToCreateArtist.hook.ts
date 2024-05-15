import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as ArtistActions from "../redux/actions/artist.actions";
import { NEW_ARTIST_ID } from '../redux/reducers/artist.reducer';

type NavigateToCreateArtist = (artistId?: string, artistType?: boolean) => void;

type NavigateToCreateArtistHook = () => NavigateToCreateArtist;

const useNavigateToCreateArtist: NavigateToCreateArtistHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setArtistId = (artistId: string) => dispatch(ArtistActions.setArtistId(artistId));


  const createArtist = React.useCallback((artistId = NEW_ARTIST_ID, artistType = false) => {
    setArtistId(artistId);
    if(artistId === NEW_ARTIST_ID || artistType) {
      history.push(`/admin/dashboard/performers/create/type?artistId=${artistId}`);
    } else {
      history.push(`/admin/dashboard/performers/create/details?artistId=${artistId}`);
    }
  }, []);

  /** Return */
  return createArtist;
};

export default useNavigateToCreateArtist;
