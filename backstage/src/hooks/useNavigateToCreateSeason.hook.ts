import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as SeasonActions from "../redux/actions/season.actions";
import { NEW_SEASON_ID } from "../redux/reducers/season.reducer";

type NavigateToCreateSeason = (seasonId?: string) => void;

type NavigateToCreateSeasonHook = () => NavigateToCreateSeason;

const useNavigateToCreateSeason: NavigateToCreateSeasonHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
    const setSeasonnId = (seasonId: string) =>
      dispatch(SeasonActions.setSeasonId(seasonId));

  const createSeason = React.useCallback((seasonId = NEW_SEASON_ID) => {
    setSeasonnId(seasonId);
    history.push(`/create-season/details?seasonId=${seasonId}`);
  }, []);

  /** Return */
  return createSeason;
};

export default useNavigateToCreateSeason;
