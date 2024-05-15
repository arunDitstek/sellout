import React from 'react';
import { useHistory as useReactRouterHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import * as AppActions from "../redux/actions/app.actions";
import { ModalTypes } from '../components/modal/Modal';
import ISaveChanges from "../models/interfaces/ISaveChanges";

type HistoryHook = () => any;

const useHistory: HistoryHook = () => {
  const history = useReactRouterHistory();

  /* State */
  const {
    hasChanges
  }: ISaveChanges = useSelector(
    (state: BackstageState) => state.app.saveChanges
  );

  /* Actions */
  const dispatch = useDispatch();

  const pushSaveChangesModal = () =>
    dispatch(AppActions.pushModal(ModalTypes.SaveChanges));

  const setSaveChanges = (saveChanges: Partial<ISaveChanges>) => {
    dispatch(AppActions.setSaveChanges(saveChanges));
  };

  /* Hooks */
  const push = React.useCallback((location: string) => {
    
    if (hasChanges) {
      setSaveChanges({
        nextUrl: location,
      })
      pushSaveChangesModal();
    } else {
      history.push(location)
    }
  }, [hasChanges]);

  return {
    ...history,
    push,
  }
};

export default useHistory;
