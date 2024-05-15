import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as OrderActions from "../redux/actions/order.actions";
import { Colors } from "@sellout/ui/build/Colors";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons } from "@sellout/ui/build/components/Icon";
import makeEventHandler from "@sellout/ui/build/utils/makeEventHandler";
import * as AppActions from "../redux/actions/app.actions";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import { useLazyQuery } from "@apollo/react-hooks";
import GET_DISCOUNT_CODE from "@sellout/models/.dist/graphql/queries/discountCodeVerify.query";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import { PurchasePortalState } from "../redux/store";

type ContainerProps = {
  height: string;
};

const Container = styled.div<ContainerProps>`
  height: ${(props) => props.height};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: ${Colors.White};
  transition: height 0.25s ease-out;
  overflow: hidden;
`;

const DiscountCodeInput: React.FC = () => {
  /** Hooks **/
  const { event } = useEvent();
  const { season } = useSeason();
  const {
    app: { errors },
    order: {
      createOrderParams: { discountCode, userId, tickets },
    },
  } = useSelector((state: PurchasePortalState) => state);

  const [loading, setLoading] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const eventHandler = makeEventHandler();
  const onChangeDiscountCode = eventHandler((value: string) => {
    setDiscountValue(value);
  });
  const setError = (errorMsg: string) =>
    dispatch(AppActions.setError(ErrorKeyEnum.Global, errorMsg));

  const [getDiscountCode, { data, error }] = useLazyQuery(GET_DISCOUNT_CODE, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      if(data?.eventDiscounts[0]?.active){
        dispatch(
          OrderActions.setCreateOrderParams({
            discountCode: discountValue,
           
          })
        );
        dispatch(
          OrderActions.setAppliedDiscounts(
            data?.eventDiscounts as IEventPromotion[]
          )
        );
      }
      else{setError("This is not a valid code"); }
      },
 
    onError(error) {
      setError(error?.message.split(":")[1]);
    },
  });
  let selectedTicket = tickets?.map((item) => item?.ticketTypeId);

  const checkPromotionCode = () => {
    if (discountCode) {
      onClearInput();
      dispatch(
        OrderActions.setCreateOrderParams({
          discountCode: "",
          promotionCode: ""
        })
      );
      dispatch(
        OrderActions.setAppliedDiscounts(
          []
        )
      );
    } else {
      getDiscountCode({
        variables: {
          seasonId: season?._id,
          eventId: event?._id,
          discountCode: discountValue,
          userId,
          selectedTicket: selectedTicket
        },
      });
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 250);
  };

  const onClearInput = () => {
    setDiscountValue("");
    dispatch(
      OrderActions.setCreateOrderParams({
        discountCode: "",
      })
    );
  };



  return (
    <Container height={"60px"}>
      <Input
        inputRef={inputRef}
        value={discountValue || discountCode}
        placeholder="Enter a discount code"
        icon={Icons.KeyRegular}
        onChange={onChangeDiscountCode}
        discountCode={discountCode}
        onSubmit={checkPromotionCode}
        canSubmit={discountValue.length > 0}
        onClear={onClearInput}
        size={InputSizes.Large}
        loading={loading}
        width="calc(100% - 2px)"
        codeApply="discount"
        disabled={discountCode ? true : false}
      />
    </Container>
  );
};

export default DiscountCodeInput;
