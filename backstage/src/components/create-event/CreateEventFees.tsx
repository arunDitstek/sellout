import React, { Fragment } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import * as FeeActions from "../../redux/actions/fee.actions";
import TextButton from "@sellout/ui/build/components/TextButton";
import { Icons } from "@sellout/ui";
import { ModalTypes } from "../../components/modal/Modal";
import BooleanInput from "../../elements/BooleanInput";
import IFee from "@sellout/models/.dist/interfaces/IFee";
import Fee from "../Fee";
import FeeUtil from "@sellout/models/.dist/utils/FeeUtil";
import { NEW_FEE_ID } from "../../redux/reducers/fee.reducer";
import useEvent from "../../hooks/useEvent.hook";
import { Content, Spacer } from "../../components/create-flow/CreateFlowStyles";
import useSeason from "../../hooks/useSeason.hook";

const Container = styled.div``;

type CreateEventFeesProps = {};

const CreateEventFees: React.FC<CreateEventFeesProps> = () => {
  /* Hooks */
  const { event } = useEvent();
  const { season } = useSeason();

  /* State */
  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const fees = FeeUtil.promoterFees(
    isEvent
      ? event?.fees.filter((fee: any) => fee.filters.length === 0)
      : season?.fees.filter((fee: any) => fee.filters.length === 0)
  );
  const [hasFees, setHasFees] = React.useState(fees?.length > 0);

  /* Actions */
  const dispatch = useDispatch();
  const addFee = () => {
    dispatch(FeeActions.setFeeId(NEW_FEE_ID));
    dispatch(AppActions.pushModal(ModalTypes.Fee));
  };

  const popModal = () => {
    dispatch(AppActions.popModal());
  };

  const pushRemoveOptionWarning = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Delete additional fees",
        message: `You must manually delete each additional fees by clicking the trash can icon before selecting this option.`,
        confirmText: "OKAY",
        confirm: popModal,
        cancel: null,
      })
    );
  };

  /* Render */
  return (
    <Container>
      <Content>
        <BooleanInput
          active={hasFees}
          onChange={() => {
            if (fees?.length) {
              pushRemoveOptionWarning();
            } else {
              if (!hasFees) {
                addFee();
              }
              setHasFees(!hasFees);
            }
          }}
          label="Would you like to add any additional fees?"
        />
        {(() => {
          if (!hasFees) return null;

          return (
            <Fragment>
              <Spacer />
              {fees?.map((fee: IFee) => {
                // const fee = feesCache[eventFee._id as string];
                // if (!fee) return null;
                return (
                  <Fragment key={fee._id}>
                    <Fee key={fee._id} fee={fee} />
                    <Spacer />
                  </Fragment>
                );
              })}
              <TextButton onClick={() => addFee()} icon={Icons.PlusCircleLight}>
                {fees?.length ? "Add another extra fee" : "Add an extra fee"}
              </TextButton>
            </Fragment>
          );
        })()}
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventFees;
