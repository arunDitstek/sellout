import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as SeasonActions from "../redux/actions/season.actions";

type NavigateToSeasonDetails = (seasonId?: string, path?: string) => void;

type NavigateToSeasonDetailsHook = () => NavigateToSeasonDetails;

const useNavigateToSeasonDetails: NavigateToSeasonDetailsHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setSeasonId = (seasonId: string) =>
    dispatch(SeasonActions.setSeasonId(seasonId));

  const seasonDetails = React.useCallback((seasonId, path = "/overview") => {
    setSeasonId(seasonId);
    history.push(
      `/admin/dashboard/seasons/details${path}?seasonId=${seasonId}`
    );
  }, []);

  /** Return */
  return seasonDetails;
};

export default useNavigateToSeasonDetails;
