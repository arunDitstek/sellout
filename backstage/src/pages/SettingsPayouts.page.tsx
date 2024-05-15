import React from "react";
import styled from "styled-components";
import { Page, PageTitle } from "../components/PageLayout";
import ConnectStripeButton from "../components/ConnectStripeButton";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import { useQuery } from "@apollo/react-hooks";
import { Colors, Flex } from "@sellout/ui";
import Error from "../elements/Error";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import TextButton from "@sellout/ui/build/components/TextButton";
import * as Intercom from "../utils/Intercom";

const Title = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey2};
  font-weight: 500;
  font-size: 1.4rem;
  margin: 10px 0px 30px;
  display: flex;
  align-items: center;
  flex-flow: wrap;
  gap: 10px;
`;

const StripeIdStyle = styled.div`
  color: ${Colors.Grey2};
  font-size: 2.4rem;
  margin: 0px 20px 0px 10px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-flow: wrap;
  gap: 10px;
`;

type SettingsPayoutsProps = {};
const SettingsPayouts: React.FC<SettingsPayoutsProps> = () => {
  const [errorMsg, setErrorMsg] = React.useState("");
  const { data, loading } = useQuery(GET_PROFILE);
  const {
    platformSettings: { stripeClientId },
    organization: { stripeId },
  } = data;
  const stripeRedirectUrl = `${window.location.origin}/admin/dashboard/settings/payouts`;
  const showConnectStripe = Boolean(
    data?.organization && !data?.organization.stripeId
  );
  return (
    <Page>
      {showConnectStripe ? (
        <>
          <Title>
            Please connect your Stripe account to publish events and receive
            payment
          </Title>
          <Subtitle>
            Click the button below to connect your account. Stripe is the
            trusted payment provider for Sellout.
          </Subtitle>
          <ConnectStripeButton
            stripeClientId={stripeClientId}
            stripeRedirectUrl={stripeRedirectUrl}
            stripeId={stripeId}
            setErrorMsg={setErrorMsg}
          />
        </>
      ) : (
        <>
          <RowWrapper>
            <Title>Stripe account connected:</Title>
            <StripeIdStyle>{data?.organization?.stripeId}</StripeIdStyle>
          </RowWrapper>
          <Button
            type={ButtonTypes.Regular}
            text="OPEN YOUR STRIPE DASHBOARD"
            loading={loading}
            margin="20px 0px 15px 0px"
            onClick={() =>
              window.open("https://dashboard.stripe.com", "_blank")
            }
          />
          <Subtitle>
            To change your stripe account, please &nbsp;
            <TextButton onClick={() => Intercom.toggle()}>
              Click Here
            </TextButton>
            &nbsp; to speak with our customer success team.
          </Subtitle>
        </>
      )}
      <Error margin="10px 0px 0px 0px">{errorMsg}</Error>
    </Page>
  );
};

export default SettingsPayouts;
