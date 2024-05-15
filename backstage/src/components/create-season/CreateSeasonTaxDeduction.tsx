import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import {
  EventTaxDeductionEnum,
  EventSaleTaxEnum,
} from "@sellout/models/.dist/interfaces/IEvent";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { BackstageState } from "../../redux/store";
import * as FeeActions from "../../redux/actions/fee.actions";
import { FeeTypeEnum } from "@sellout/models/.dist/interfaces/IFee";
import { NEW_FEE_ID } from "../../redux/reducers/fee.reducer";
import * as VenueActions from "../../redux/actions/venue.actions";
import * as Percentage from "@sellout/utils/.dist/percentage";
import useVenue from "../../hooks/useVenue.hook";
import useSeason from "../../hooks/useSeason.hook";
import * as SeasonActions from "../../redux/actions/season.actions";
import { NEW_SEASON_ID } from "../../redux/reducers/season.reducer";
import { VariantEnum } from "../../models/enums/VariantEnum";

const Container = styled.div`
  position: relative;
`;

type CreateSeasonTaxDeductionProps = {};

const TaxText = styled.p``;

export const TaxEnum = {
  True: true,
  False: false,
};

const CreateSeasonTaxDeduction: React.FC<
  CreateSeasonTaxDeductionProps
> = ({}) => {
  /* Hooks */
  const [salesTaxPercentage, setSalesTaxPercentage] = useState("" as string);
  const { season, seasonId } = useSeason();

  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache, venueId } = venueState;
  const venueData = venuesCache[venueId];

  let { venue } = useVenue(season?.venueId);

  useEffect(() => {
    if (seasonId === NEW_SEASON_ID) {
      setSalesTaxPercentage(venueData?.tax as string);
    } else {
      setSalesTaxPercentage(venue?.tax as string);
      const taxx: any = season?.fees?.filter(
        (a) => a.name === EventSaleTaxEnum.SalesTax
      );

      if (taxx?.length > 0) {
        dispatch(VenueActions.setVenueId(season?.venueId as string));
      }
    }
  }, [venue?.tax]);

  /* Actions */
  const dispatch = useDispatch();
  const setTaxDeduction = (taxDeduction: EventTaxDeductionEnum) => {
    const isVenueSelected = season?.venueId?.length === 0;
    const isTaxSelected = season?.taxDeduction;
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
        dispatch(SeasonActions.setSeasonTaxDeduction(seasonId, TaxEnum.True));
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
      dispatch(SeasonActions.setSeasonTaxDeduction(seasonId, TaxEnum.False));
      dispatch(SeasonActions.saveSeason(false, false));
    }
  };
  ///////////////// Tax Add In Additional Fee ////////////////
  const saveFee = () =>
    dispatch(FeeActions.saveFee(seasonId, VariantEnum.Season));

  const deleteSaletax = () => {
    const taxx: any = season?.fees.filter(
      (a) => a.name === EventSaleTaxEnum.SalesTax
    );
    if (taxx.length > 0) {
      dispatch(
        FeeActions.deleteFee(taxx[taxx.length - 1]._id as string, "", seasonId)
      );
      dispatch(FeeActions.setFeeId(""));
    }
  };

  useEffect(() => {
    if (season?.venueId?.length === 0) {
      dispatch(SeasonActions.setSeasonTaxDeduction(seasonId, TaxEnum.False));
      deleteSaletax();
    }
    if (!taxDeduction) {
      deleteSaletax();
      dispatch(SeasonActions.setSeasonTaxDeduction(seasonId, TaxEnum.False));
    }
  }, [season?.venueId]);

  /** Render */
  const items = Object.values(EventTaxDeductionEnum).map(
    (taxDeduction: EventTaxDeductionEnum) => {
      return {
        text: taxDeduction,
        value: taxDeduction,
      };
    }
  );

  const taxDeduction = season?.taxDeduction as boolean;

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

      {season?.taxDeduction === true && (
        <TaxText>
          {" "}
          Sales tax of {parseFloat(salesTaxPercentage).toFixed(2)}% will
          automatically be applied to all orders.
        </TaxText>
      )}
    </Container>
  );
};

export default CreateSeasonTaxDeduction;
