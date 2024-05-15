import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import { Colors } from "@sellout/ui/build/Colors";
import TicketTypeProduct from "../components/TicketTypeProduct";
import PromotionCodeInput from "../components/PromotionCodeInput";
import ScreenHeader from "../components/ScreenHeader";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px 70px;
`;

const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Waiver = styled.div`
  font-size: 1.2rem;
  line-height: 1.8rem;
  font-weight: 500;
  color: ${Colors.Grey1};
`;

type LiabilityWaiverProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const LiabilityWaiver: React.FC<LiabilityWaiverProps> = ({ event, season }) => {
  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Liability Waiver" />
      <Content>
        <Title>You must agree to this waiver to purchase tickets</Title>
        <Waiver
          dangerouslySetInnerHTML={{
            __html: event
              ? (event?.userAgreement as string)
              : (season?.userAgreement as string),
          }}
        />
      </Content>
    </Container>
  );
};

export default LiabilityWaiver;
