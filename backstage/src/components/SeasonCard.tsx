import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import ProgressBar from "../elements/ProgressBar";
import * as Price from "@sellout/utils/.dist/price";
import { useMobileMedia } from "@sellout/ui/build/utils/MediaQuery";
import usePermission from "../hooks/usePermission.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import SeasonStatus from "./SeasonStatus";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import {
  AnimatedContainer,
  BottomContainer,
  BottomText,
  BottomTextContainer,
  Flexy,
  Gradient,
  IconContainer,
  ImgDiv,
  InfoContainer,
  InnerContainer,
  Name,
  Subtitle,
  Type,
  UnanimatedContainer,
} from "./EventCard";

export enum SeasonCardTypes {
  Modal = "Modal",
  Standard = "Standard",
}

const SeasonStatusContainer = styled.div`
  margin: 16px;
  position: absolute;
`;

type PropTypes = {
  season: ISeasonGraphQL;
  onClick?: Function;
  margin?: string;
  footer?: boolean;
  type?: SeasonCardTypes;
};

const getConfig = (
  type: SeasonCardTypes | undefined,
  footer: boolean,
  mobile: boolean
) => {
  switch (type) {
    case SeasonCardTypes.Modal:
      return { height: "210px", width: "100%", innerHeight: "210px" };
    case SeasonCardTypes.Standard:
      return {
        height: footer ? "250px" : "192px",
        width: "274px",
        innerHeight: "192px",
      };
    default:
      return {
        height: footer ? "250px" : "192px",
        width: "274px",
        innerHeight: "192px",
      };
  }
};

const SeasonCard: React.FC<PropTypes> = ({
  season,
  onClick,
  margin,
  footer = true,
  type,
}) => {
  /** Hooks */
  const isMobile = useMobileMedia();
  const hasPermission = usePermission();

  /** State */
  const { venue, ticketTypes, analytics } = season;
  const address = venue?.address;
  const venueLocation = `${venue?.name || ""}${
    address ? `, ${address.city}, ${address.state}` : ""
  }`;
  const totalTicketQty = Object.values(ticketTypes as ITicketType[]).reduce(
    (prev, ticket) => {
      return prev + Number(ticket.totalQty);
    },
    0
  );
  const remainingTicketQty = Object.values(ticketTypes as ITicketType[]).reduce(
    (prev, ticket) => {
      return prev + Number(ticket.remainingQty);
    },
    0
  );
  const soldTicketQty = totalTicketQty - remainingTicketQty;
  const percentSold = Math.floor((soldTicketQty / totalTicketQty) * 100) || 0;
  const totalSalesSegment = (analytics as any)?.segments?.[1] ?? false;

  let totalSales: null | number = null;
  if (totalSalesSegment) {
    totalSales = AnalyticsUtil.getTotalValue(totalSalesSegment.coordinates);
  }

  /** Render */
  const Container: any = onClick ? AnimatedContainer : UnanimatedContainer;
  const { width, height, innerHeight } = getConfig(type, footer, isMobile);

  return (
    <Container
      margin={margin}
      footer={footer}
      width={width}
      height={height}
      onClick={onClick ? () => onClick() : undefined}
    >
      <InnerContainer footer={footer} width={width} height={innerHeight}>
        <ImgDiv
          footer={footer}
          src={season?.posterImageUrl ? season.posterImageUrl : ""}
        />
        <SeasonStatusContainer>
          <SeasonStatus season={season} />
        </SeasonStatusContainer>
        <Gradient footer={footer}>
          <InfoContainer>
            <Name>{season.name || "Untitled season"}</Name>
            {season.subtitle && <Subtitle>{season.subtitle}</Subtitle>}
            {venueLocation && (
              <Flexy>
                <IconContainer>
                  <Icon
                    icon={Icons.MapPinLight}
                    size={12}
                    margin="0px 5px 0px 0px"
                    color={Colors.White}
                  />
                </IconContainer>
                <Type>{venueLocation}</Type>
              </Flexy>
            )}
          </InfoContainer>
        </Gradient>
      </InnerContainer>
      {footer && (
        <BottomContainer>
          <BottomTextContainer>
            <BottomText>{`${percentSold}% ${"Sold"}`}</BottomText>
            {/* Metrics  */}
            {hasPermission(RolesEnum.ADMIN) && (
              <BottomText>${Price.output(totalSales, true)}</BottomText>
            )}
          </BottomTextContainer>
          <ProgressBar value={soldTicketQty} maxValue={totalTicketQty} />
        </BottomContainer>
      )}
    </Container>
  );
};

export default SeasonCard;
