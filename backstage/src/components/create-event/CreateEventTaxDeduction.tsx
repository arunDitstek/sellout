import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as EventActions from "../../redux/actions/event.actions";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import {
  EventTaxDeductionEnum,
  EventSaleTaxEnum,
} from "@sellout/models/.dist/interfaces/IEvent";
import useEvent from "../../hooks/useEvent.hook";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { BackstageState } from "../../redux/store";
import * as FeeActions from "../../redux/actions/fee.actions";
import { FeeTypeEnum } from "@sellout/models/.dist/interfaces/IFee";
import { NEW_FEE_ID } from "../../redux/reducers/fee.reducer";
import { NEW_EVENT_ID } from "../../redux/reducers/event.reducer";
import * as VenueActions from "../../redux/actions/venue.actions";
import * as Percentage from "@sellout/utils/.dist/percentage";
import useVenue from "../../hooks/useVenue.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";

const Container = styled.div`
  position: relative;
`;

type CreateEventTaxDeductionProps = {};

const TaxText = styled.p``;

export const TaxEnum = {
  True: true,
  False: false,
};

const CreateEventTaxDeduction: React.FC<
  CreateEventTaxDeductionProps
> = ({}) => {
  /* Hooks */
  const [salesTaxPercentage, setSalesTaxPercentage] = useState("" as string);
  const { event, eventId } = useEvent();

  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache, venueId } = venueState;
  const venueData = venuesCache[venueId];;

  let { venue } = useVenue(event?.venueId);

  useEffect(() => {
    if (eventId === NEW_EVENT_ID) {
      setSalesTaxPercentage(venueData?.tax as string);
    } else {
      setSalesTaxPercentage(venue?.tax as string);
      const taxx: any = event?.fees?.filter(
        (a) => a.name === EventSaleTaxEnum.SalesTax
      );
      if (taxx?.length > 0) {
        dispatch(VenueActions.setVenueId(event?.venueId as string));
      }
    }
  }, [venue?.tax]);

  /* Actions */
  const dispatch = useDispatch();
  const setTaxDeduction = (taxDeduction: EventTaxDeductionEnum) => {
    const isVenueSelected = event?.venueId?.length === 0;
    const isTaxSelected = event?.taxDeduction;
    if (isVenueSelected) {
      dispatch(
        AppActions.showNotification(
          "Select any venue.",
          AppNotificationTypeEnum.Warning
        )
      );
    } else if (taxDeduction === EventTaxDeductionEnum.true) {
      if (!isTaxSelected) {
        setSalesTaxPercentage(venue?.tax as string);
        dispatch(EventActions.setEventTaxDeduction(eventId, TaxEnum.True));
        dispatch(
          FeeActions.setFee("new", {
            name: EventSaleTaxEnum.SalesTax,
            type: FeeTypeEnum.Percent,
            value: Percentage.input(venue?.tax),
          })
        );
        dispatch(FeeActions.setFeeId(NEW_FEE_ID));
        saveFee();
      }
    } else {
      deleteSaletax();
      dispatch(EventActions.setEventTaxDeduction(eventId, TaxEnum.False));
      dispatch(EventActions.saveEvent(false, false));
    }
  };
  ///////////////// Tax Add In Additional Fee ////////////////
  const saveFee = () =>
    dispatch(FeeActions.saveFee(eventId, VariantEnum.Event));

  const deleteSaletax = () => {
    const taxx: any = event?.fees.filter(
      (a) => a.name === EventSaleTaxEnum.SalesTax
    );
    if (taxx.length > 0) {
      dispatch(
        FeeActions.deleteFee(taxx[taxx.length - 1]._id as string, eventId)
      );
      dispatch(FeeActions.setFeeId(""));
    }
  };

  useEffect(() => {
    if (event?.venueId?.length === 0) {
      dispatch(EventActions.setEventTaxDeduction(eventId, TaxEnum.False));
      deleteSaletax();
    }
    if (!taxDeduction) {
      deleteSaletax();
      dispatch(EventActions.setEventTaxDeduction(eventId, TaxEnum.False));
    }
  }, [event?.venueId]);

  /** Render */
  const items = Object.values(EventTaxDeductionEnum).map(
    (taxDeduction: EventTaxDeductionEnum) => {
      return {
        text: taxDeduction,
        value: taxDeduction,
      };
    }
  );

  const taxDeduction = event?.taxDeduction as boolean;
  return (
    <Container>
      <Dropdown
        value={
          taxDeduction
            ? EventTaxDeductionEnum.true
            : EventTaxDeductionEnum.false
        }
        items={items}
        onChange={(taxDeduction: EventTaxDeductionEnum) => {
          setTaxDeduction(taxDeduction);
        }}
        label="Apply Sales Tax"
      />

      {event?.taxDeduction === true && (
        <TaxText>
          {" "}
          Sales tax of {parseFloat(salesTaxPercentage).toFixed(2)}% will
          automatically be applied to all orders.
        </TaxText>
      )}
    </Container>
  );
};

export default CreateEventTaxDeduction;
