import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import { Colors } from "@sellout/ui/build/Colors";
import { PurchasePortalState } from "../redux/store";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";

const Container = styled.div`
  position: relative;
  height: 24px;
  width: 24px;
  background-color: ${Colors.Grey4};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  transition: 0.2s;

  &:hover {
    background-color: ${Colors.Grey3};
  }
`;

type BackButtonProps = {};

const BackButton: React.FC<BackButtonProps> = () => {
  /** Actions **/

  const {
    app: { eventId, seasonId,waitList },
  } = useSelector((state: PurchasePortalState) => state);

  const setError = (errorMsg: string) =>
    dispatch(AppActions.setError(ErrorKeyEnum.PaymentCardError, errorMsg));
  const dispatch = useDispatch();
  const navigateBackward = () => {
    if (eventId && !waitList) {
      dispatch(AppActions.navigateBackward());
    }
    if (waitList){
      dispatch(AppActions.setWaitList(false));
    }
     else if (seasonId) {
      dispatch(AppActions.seasonNavigateBackward());
    }
    setError("");
  };

  /** Render **/
  return (
    <Container>
      <Icon
        icon={Icons.BackArrow}
        color={Colors.White}
        onClick={() => navigateBackward()}
        size={16}
        top="1px"
      />
    </Container>
  );
};

export default BackButton;
