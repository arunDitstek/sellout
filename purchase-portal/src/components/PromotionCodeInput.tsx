import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import * as OrderActions from "../redux/actions/order.actions";
import { Colors } from "@sellout/ui/build/Colors";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons } from "@sellout/ui/build/components/Icon";
import makeEventHandler from "@sellout/ui/build/utils/makeEventHandler";
import * as AppActions from "../redux/actions/app.actions";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import { EventPromotionTypeEnum } from "@sellout/models/.dist/interfaces/IEventPromotion";
import * as Time from "@sellout/utils/.dist/time";
import { useLazyQuery } from "@apollo/react-hooks";
import GET_PROMO_CODE from "@sellout/models/.dist/graphql/queries/promoCodeVerify.query";

type ContainerProps = {
  open: boolean;
  height: string;
  padding: boolean;
};

const Container = styled.div<ContainerProps>`
  height: ${(props) => props.height};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: calc(100% - 48px);
  background-color: ${Colors.White};
  transition: height 0.25s ease-out;
  overflow: hidden;
  padding-left: ${(props) => (props.padding ? "24px" : "0")};
`;

type PromotionCodeInputProps = {
  open: boolean;
  close?: Function;
  padding?: boolean;
  setShowPromotionCodeButton?: any;
};

const PromotionCodeInput: React.FC<PromotionCodeInputProps> = ({
  open,
  close,
  padding = true,
  setShowPromotionCodeButton,
}) => {
  /** Hooks **/
  const { event } = useEvent();
  const { season } = useSeason();
  const {
    app: { errors },
    order: { createOrderParams },
  } = useSelector((state: PurchasePortalState) => state);
  const [loading, setLoading] = useState(false);
  const [promotionCode, setPromotionCode] = useState(
    createOrderParams.promotionCode || ""
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (open && inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const isOnSale = event
    ? EventUtil.isOnSale(event)
    : SeasonUtil.isOnSale(season);
  const dispatch = useDispatch();
  const eventHandler = makeEventHandler();
  const onChangePromotionCode = eventHandler((value: string) =>
    setPromotionCode(value)
  );
  const setError = (errorMsg: string) =>
    dispatch(AppActions.setError(ErrorKeyEnum.Global, errorMsg));

  const [getPromoTickets, { data, error }] = useLazyQuery(GET_PROMO_CODE, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      if (data.eventTickets.length > 0 && setShowPromotionCodeButton) {
        setShowPromotionCodeButton(true);
      }
    },
    onError(error) {
      setError(error?.message.split(":")[1]);
    },
  });

  const now = Time.now();
  const checkPromotionCode = () => {
    getPromoTickets({
      variables: {
        seasonId: season?._id,
        eventId: event?._id,
        promoCode: promotionCode,
      },
    });

    dispatch(
      OrderActions.setCreateOrderParams({
        tickets: [],upgrades:[]
      })
    );
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (close) close();
    }, 250);
  };

  React.useEffect(() => {
    const ticket = data?.eventTickets;
    const activeTickets =
      ticket &&
      ticket.filter(
        (a: any) =>
          a.active &&
          a.remainingQty &&
          a.startsAt < now &&
          now < a.endsAt &&
          (!isOnSale
            ? a?.promoType === EventPromotionTypeEnum.PreSale
            : a?.promoType === EventPromotionTypeEnum.Unlock)
      );

    const isOverRideLimit =
      ticket &&
      ticket.filter(
        (a: any) =>
          a.active &&
          a.remainingQty &&
          a.startsAt < now &&
          now < a.endsAt &&
          a?.promoType === EventPromotionTypeEnum.LimitOverride
      );

    const promotionCodeTickets =
      activeTickets &&
      activeTickets.reduce((cur: string[], a: any) => {
        return [...cur, ...a.eventTickets];
      }, []);
    const promotionCodeUpgrades =
      activeTickets &&
      activeTickets.reduce((cur: string[], a: any) => {
        return [...cur, ...a.eventUpgrades];
      }, []);
    const visibleUpgrades =
      promotionCodeUpgrades &&
      promotionCodeUpgrades.filter((a: any) => a.visible);
    const visibleTickets =
      promotionCodeTickets &&
      promotionCodeTickets.filter((a: any) => a.visible);
    //const activeTickets = ticket && (ticket[0]?.active && ticket[0]?.remainingQty > 0 && ticket[0]?.startsAt < now && now < ticket[0]?.endsAt)
    //const promoCodeTickets = ticket && ticket[0]
    //const promoTypeCheck = !isOnSale ? promoCodeTickets?.promoType === EventPromotionTypeEnum.PreSale : promoCodeTickets?.promoType === EventPromotionTypeEnum.Unlock

    if (
      (visibleTickets && visibleTickets.length > 0) ||
      (visibleUpgrades && visibleUpgrades.length > 0)
    ) {
      dispatch(
        OrderActions.setCreateOrderParams({
          promotionCode,
        })
      );
    } else if (isOverRideLimit && isOverRideLimit.length > 0) {
      dispatch(
        OrderActions.setCreateOrderParams({
          promotionCode,
        })
      );
    } else {
        if (activeTickets && activeTickets.length === 0) {
          setError("This code is invalid.");
        } else {
          setError("There are no tickets or upgrades for this code.");
        }
    }
  }, [data]);

  // Clear the global error when the promotion code changes
  React.useEffect(() => {
    setError("");
  }, [promotionCode]);

  return (
    <Container height={open ? "60px" : "0px"} open={open} padding={padding}>
      <Input
        autoFocus={open}
        inputRef={inputRef}
        value={promotionCode}
        placeholder="Enter a secret code"
        icon={Icons.KeyRegular}
        onChange={onChangePromotionCode}
        onSubmit={checkPromotionCode}
        canSubmit={promotionCode.length > 0}
        size={InputSizes.Large}
        loading={loading}
        width="calc(100% - 2px)"
      />
    </Container>
  );
};

export default PromotionCodeInput;
