import React from "react";
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import StripeButton from '../assets/images/stripe-button.png';
import gql from 'graphql-tag';
import url from 'url';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import { Flex, Loader, LoaderSizes, Colors } from "@sellout/ui";

const CONNECT_STRIPE = gql`
  mutation connectCode($connectCode: String!) {
    connectStripe(connectCode: $connectCode) 
  }
`;

const ButtonImg = styled.img`
  cursor: pointer;
  width: 185px;
  height: auto;
`;

const Spacer = styled.div`
  width: 15px;
`;

type ConnectStripeButtonProps = {
  stripeClientId?: string;
  stripeRedirectUrl?: string;
  stripeId?: string;
  setErrorMsg: Function;
};

const ConnectStripeButton: React.FC<ConnectStripeButtonProps> = ({
  stripeClientId,
  stripeRedirectUrl,
  stripeId,
  setErrorMsg,
}) => {
  const [connectStripe, { loading, called }] = useMutation(CONNECT_STRIPE, {
    refetchQueries: [{ query: GET_PROFILE }],
    awaitRefetchQueries: true,
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    }
  });
  const parsed = url.parse(window.location.toString(), true);
  const connectCode = parsed.query.code;

  if (connectCode && !loading && !stripeId && !called) {
    connectStripe({
      variables: {
        connectCode,
      },
    });
  }

  const baseLink = 'https://connect.stripe.com/oauth/authorize';
  const clientId = `?client_id=${stripeClientId}`;
  const redirectUrl = `&redirect_uri=${stripeRedirectUrl}`;
  const responseType = '&response_type=code';
  const scopes = '&scope=read_write';
  const connectLink = baseLink + clientId + redirectUrl + responseType + scopes;

  return (
    <Flex align="center">
      <ButtonImg
        onClick={() => loading ? null : window.location.replace(connectLink)}
        src={StripeButton}
      />
      {loading && (
        <>
          <Spacer />
          <Loader size={LoaderSizes.Small} color={Colors.Orange} />
        </>
      )}
    </Flex>
  );
};

export default ConnectStripeButton;