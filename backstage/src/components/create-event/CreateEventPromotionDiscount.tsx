import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Toggle from "../../elements/Toggle";
import IEventPromotion, {
  EventPromotionAppliesToEnum,
  EventPromotionDiscountTypeEnum,
} from "@sellout/models/.dist/interfaces/IEventPromotion";
import Label from "@sellout/ui/build/components/Label";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import * as Price from "@sellout/utils/.dist/price";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import Flex from "@sellout/ui/build/components/Flex";
import * as Percentage from "@sellout/utils/.dist/percentage";

type CreateEventPromotionDiscountProps = {
  promotion: IEventPromotion;
  showToggle?: boolean;
};

const CreateEventPromotionDiscount: React.FC<
  CreateEventPromotionDiscountProps
> = ({ promotion, showToggle = true }) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, promotionId } = eventState;

  /* Actions */
  const dispatch = useDispatch();

  const setPromotion = (promotion: Partial<IEventPromotion>) =>
    dispatch(
      EventActions.setPromotion(eventId, promotionId as string, promotion)
    );

  /** Render */
  const isFlat = promotion.discountType === EventPromotionDiscountTypeEnum.Flat;

  const types = Object.values(EventPromotionDiscountTypeEnum).map(
    (type: EventPromotionDiscountTypeEnum) => {
      return {
        text: type,
        value: type,
      };
    }
  );

  const discountAppliesTo = Object.values(EventPromotionAppliesToEnum).map(
    (type: EventPromotionAppliesToEnum) => {
      return {
        text: type,
        value: type,
      };
    }
  );
  
  return (
    <>
      <Dropdown
        label="Applies To"
        value={`${promotion.appliesTo}`}
        width="116px"
        items={discountAppliesTo}
        onChange={(appliesTo: EventPromotionAppliesToEnum) => {
          setPromotion({
            appliesTo,
          });
          if (appliesTo === EventPromotionAppliesToEnum.PerOrder) {
            setPromotion({
              ticketTypeIds: [],
            });
          }
        }}
      />
      <Dropdown
        label="Discount type"
        value={`${promotion.discountType}`}
        width="116px"
        items={types}
        onChange={(discountType: EventPromotionDiscountTypeEnum) => {
          setPromotion({
            discountType,
          });
        }}
      />
      <FormattedInput
        label="Discount Amount" // keeps items in line
        placeholder={isFlat ? '"0.00"' : "10"}
        width="95px"
        value={
          isFlat
            ? Price.output(promotion.discountValue)
            : promotion.discountValue
        }
        onChange={(e: React.FormEvent<HTMLInputElement>) =>
          setPromotion({
            discountValue: isFlat
            ? (Price.input(e.currentTarget.value) as string)
            : Percentage.input(e.currentTarget.value),
          })
        }
        format={isFlat ? InputFormats.Price : InputFormats.Percent}
      />
    </>
  );
};

export default CreateEventPromotionDiscount;
