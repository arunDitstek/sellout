import React, { useEffect } from "react";
import styled from "styled-components";
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import { Icons } from "@sellout/ui/build/components/Icon";
import ScreenHeader from "../components/ScreenHeader";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import ICreateUserParams from "../models/interfaces/ICreateUserParams";
import * as AppActions from "../redux/actions/app.actions";
import * as UserActions from "../redux/actions/user.actions";
import { ErrorKeyEnum, ScreenEnum } from "../redux/reducers/app.reducer";
import USER_EXISTS from "@sellout/models/.dist/graphql/queries/userExists.query";
import * as Validation from "@sellout/ui/build/utils/Validation";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import UPDATE_GUEST_ORDER from '@sellout/models/.dist/graphql/mutations/updateGuestOrder.mutation';
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import * as OrderActions from "../redux/actions/order.actions";

export const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding-bottom: 50px;
`;

export const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

export const Label = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Red};
  margin-bottom: 16px;
  font-weight: 600;
`;

type UserEmailProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const UserEmail: React.FC<UserEmailProps> = ({ event, season }) => {
  /** State **/
  const { app, user, order: { guestCheckout, createOrderParams, order: confirmedOrder } } = useSelector((state: PurchasePortalState) => state);
  const { errors } = app;
  const { promotionCode } = createOrderParams;
  const {
    lastCheckedEmail,
    confirmEmail,
    userExists,
    createUserParams: { email },
  } = user;
  const [lastChecked] = React.useState(lastCheckedEmail);
  const emailError = errors[ErrorKeyEnum.UserEmail];
  const confirmEmailError = errors[ErrorKeyEnum.ConfirmUserEmail];
  const [guestEmail, setGuestEmail] = React.useState("");

  /** Actions **/
  const dispatch = useDispatch();
  const setCreateUserParams = (params: Partial<ICreateUserParams>) =>
    dispatch(UserActions.setCreateUserParams(params));
  const setConfirmEmail = (confirmEmail: string) =>
    dispatch(UserActions.setConfirmEmail(confirmEmail));
  const setError = (key: ErrorKeyEnum, errorMsg: string) =>
    dispatch(AppActions.setError(key, errorMsg));
  const navigateForward = () => {
    if (event) {
      dispatch(AppActions.navigateForward());
    } else if (season) {
      dispatch(AppActions.seasonNavigateForward());
    }
  };
  const setUserExists = (userExists: boolean) =>
    dispatch(UserActions.setUserExists(userExists));

  /** GraphQL **/

  const [onUpdateGuestOrder, { loading: guestLoading }] = useMutation(UPDATE_GUEST_ORDER, {
    onCompleted(data) {
      dispatch(OrderActions.setGuestCheckoutEmail(data.updateGuestOrder?.email));
      dispatch(AppActions.setScreen(ScreenEnum.OrderConfirmed));
      setTimeout(() => dispatch(AppActions.setLoading(false)), 1000);
      setTimeout(() =>
        dispatch(
          AppActions.showNotification(
            "Email sent succsesfully.",
            AppNotificationTypeEnum.Success
          ))
        , 1000);
    },
    onError(error) {
      console.error(error);
    },
  });

  const [getExistsEmail, { loading: emailloading }] = useLazyQuery(USER_EXISTS, {
    fetchPolicy: "network-only",
    context: {
      debounceKey: "USER_EXISTS",
    },
    onCompleted: (data) => {
      if (lastChecked === email) return;
      if (emailError) return;
      if (Boolean(Validation.email.validate(email)?.error) ?? false) return;

      const exists = Boolean(data?.userExists?.userId.length ?? 0 > 0);
      if (exists) {
        setUserExists(true);
        if (data?.userExists?.promoAvailable) {
          navigateForward();
        } else {
          dispatch(
            AppActions.setError(
              ErrorKeyEnum.PromoCodeLimitError,
              "This promo code has already been used by this account." as string
            )
          );
        }
      } else {
        setUserExists(false);
        dispatch(
          AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, "" as string)
        );
      }
    },
  });

  useEffect(() => {
    if (email) {
      getExistsEmail({
        variables: {
          email,
          promoCode: promotionCode,
          eventId: event?._id,
          seasonId: season?._id,
        },
      });
    } else {
      dispatch(
        AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, "" as string)
      );
    }
  }, [email]);

  const errorMsgPromoCode: any = app.errors[ErrorKeyEnum.PromoCodeLimitError];

  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Contact info" />
      <Content>
        <Input
          autoFocus
          type="email"
          label="Email address"
          placeholder="Enter your email address"
          size={InputSizes.Large}
          value={guestEmail || email}
          width="100%"
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            const email = e.currentTarget.value;
            const message =
              Validation.email.validate(email)?.error?.message || "";
            guestCheckout ?
              setGuestEmail(email) :
              setCreateUserParams({ email });
            email ? setError(ErrorKeyEnum.UserEmail, message) : setError(ErrorKeyEnum.UserEmail, "");
          }}
          icon={Icons.EnvelopeLight}
          onClear={() => {
            guestCheckout ?
              setGuestEmail("") :
              setCreateUserParams({ email: "" });
          }}
          margin="0px 0px 20px 0px"
          loading={emailloading}
          validationError={emailError}
        />
        {!userExists && !guestCheckout && (
          <Input
            autoFocus
            type="email"
            label="Confirm email address"
            placeholder="Confirm your email address"
            size={InputSizes.Large}
            value={confirmEmail}
            width="100%"
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setConfirmEmail(e.currentTarget.value);
            }}
            icon={Icons.EnvelopeLight}
            onClear={() => {
              setConfirmEmail("");
            }}
            margin="0px 0px 10px 0px"
            validationError={confirmEmailError}
          />
        )}

        {guestCheckout && guestEmail && <Button
          type={ButtonTypes.Next}
          text={"Submit"}
          loading={guestLoading}
          onClick={() => {
            if (!emailError) {
              dispatch(AppActions.setLoading(true));
              onUpdateGuestOrder({
                variables: {
                  "params": {
                    "orderId": confirmedOrder?._id,
                    "email": guestEmail
                  }
                }
              }
              )
            }
          }}
        />}
        <Label>{errorMsgPromoCode}</Label>
      </Content>
    </Container>
  );
};

export default UserEmail;

