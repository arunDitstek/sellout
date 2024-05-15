import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Colors, Icon, Icons } from "@sellout/ui";
import * as Polished from "polished";
import { BackstageState } from "../../redux/store";
import { FadeIn, CardPop } from "@sellout/ui/build/components/Motion";
import ImageCropperModal from "./ImageCropperModal";
import ChangePhoneNumberModal from "./ChangePhoneNumberModal";
import AddSecondaryEmailModal from "./AddSecondaryEmailModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import CreateEventTicketTypeModal from "../create-event/modal/CreateEventTicketTypeModal";
import CreateSeasonTicketTypeModal from "../create-season/modal/CreateSeasonTicketTypeModal";
import CreateEventUpgradeTypeModal from "../create-event/modal/CreateEventUpgradeTypeModal";
import CreateSeasonUpgradeTypeModal from "../create-season/modal/CreateSeasonUpgradeTypeModal";
import CreateEventPromotionModal from "../create-event/modal/CreateEventPromotionModal";
import CreateSeasonPromotionModal from "../create-season/modal/CreateSeasonPromotionModal";
import CreateEventFeeModal from "../create-event/modal/CreateEventFeeModal";
import CreateEventCustomFieldModal from "../create-event/modal/CreateEventCustomFieldModal";
import AddRoleModal from "./AddRoleModal";
import DeleteRoleModal from "./DeleteRoleModal";
import ChangeRoleModal from "./ChangeRoleModal";
import ConfirmActionModal from "./ConfirmActionModal";
import SaveChangesModal from "./SaveChangesModal";
import CreateVenueModal from "./CreateVenueModal";
import CreateHeadliningArtistModal from "./CreateHeadliningArtistModal";
import CreateOpeningArtistModal from "./CreateOpeningArtistModal";
import AddTerminalDeviceModal from "./AddTerminalDeviceModal";
import CancelEventModal from "./CancelEventModal";
import OrganizationInviteModal from "./OrganizationInviteModal";
import OrderDetailsModal from "./OrderDetailsModal";
import PublishEventModal from "./PublishEventModal";
import EventPublishedModal from "./EventPublishedModal";
import SeasonPublishedModal from "./SeasonPublishedModal";
import RefundModal from "./RefundModal";
import UserOrderTicketModal from "./UserOrderTicketModal";
import SeeOrderDetailsModal from "./SeeOrderDetailsModal";
import PublishSeasonModal from "./PublishSeasonModal";
import CancelOrderModal from "./CancelOrderModal";
import SubscribeSalesReportModal from "./SubscribeSalesReportModal";
import AdjustCheckIn from "./AdjustCheckInModal";
import FeeModal from "./FeeModal";
import UpdateCustomerModal from "./UpdateCustomerModal";
import TicketBlockModal from "./AddTicketBlockModal";
import UpdateTicketBlockModal from "./UpdateTicketBlockModal";

export enum ModalTypes {
  ImageCropper = "ImageCropper",
  ChangePhoneNumber = "ChangePhoneNumber",
  ChangePassword = "ChangePassword",
  ChangeEmail = "ChangeEmail",
  AddSecondaryEmail = "AddSecondaryEmail",
  TicketType = "TicketType",
  SeasonTicketType = "SeasonTicketType",
  UpgradeType = "UpgradeType",
  SeasonUpgradeType = "SeasonUpgradeType",
  Promotion = "Promotion",
  CustomField = "CustomField",
  Fee = "Fee",
  OrderDetails = "OrderDetails",
  SaveChanges = "SaveChanges",
  ConfirmAction = "ConfirmAction",
  AddRole = "AddRole",
  DeleteRole = "DeleteRole",
  ChangeRole = "ChangeRole",
  CreateVenue = "CreateVenue",
  CreateHeadliningArtist = "CreateHeadliningArtist",
  CreateOpeningArtist = "CreateOpeningArtist",
  AddTerminalDevice = "AddTerminalDevice",
  CancelEvent = "CancelEvent",
  CancelOrder = "CancelOrder",
  OrganizationInvite = "OrganizationInvite",
  PublishEvent = "PublishEvent",
  EventPublished = "EventPublished",
  Refund = "Refund",
  UserOrderTicket = "UserOrderTicket",
  SeeOrderDetailsModal = "SeeOrderDetailsModal",
  PublishSeasonModal = "PublishSeasonModal",
  SeasonPromotion = "SeasonPromotion",
  SeasonPublishedModal = "SeasonPublishedModal",
  SubscribeSalesReport = "SubscribeSalesReport",
  AdjustCheckIn = "AdjustCheckIn",
  FeeModal = "FeeModal",
  UpdateCustomer = "UpdateCustomer",
  TicketHold ="TicketHold",
  UpdateTicketBlockModal="UpdateTicketBlockModal"
}

export const urlSafeModalTypes = {
  // [ModalTypes.TicketType]: ModalTypes.TicketType,
  // [ModalTypes.UpgradeType]: ModalTypes.UpgradeType,
  [ModalTypes.Promotion]: ModalTypes.Promotion,
  [ModalTypes.Fee]: ModalTypes.Fee,
  [ModalTypes.CustomField]: ModalTypes.CustomField,
  [ModalTypes.OrderDetails]: ModalTypes.OrderDetails,
  // [ModalTypes.TicketHold]: ModalTypes.TicketHold,
};

export enum ModalPositions {
  Top = "Top",
  Center = "Center",
}

const positions = {
  [ModalTypes.ImageCropper]: ModalPositions.Top,
  [ModalTypes.ChangePhoneNumber]: ModalPositions.Top,
  [ModalTypes.ChangePassword]: ModalPositions.Top,
  [ModalTypes.ChangeEmail]: ModalPositions.Top,
  [ModalTypes.AddSecondaryEmail]: ModalPositions.Top,
  [ModalTypes.TicketType]: ModalPositions.Top,
  [ModalTypes.UpgradeType]: ModalPositions.Top,
  [ModalTypes.Promotion]: ModalPositions.Top,
  [ModalTypes.Fee]: ModalPositions.Top,
  [ModalTypes.CustomField]: ModalPositions.Top,
  [ModalTypes.OrderDetails]: ModalPositions.Top,
  [ModalTypes.SaveChanges]: ModalPositions.Top,
  [ModalTypes.ConfirmAction]: ModalPositions.Center,
  [ModalTypes.AddRole]: ModalPositions.Top,
  [ModalTypes.DeleteRole]: ModalPositions.Top,
  [ModalTypes.ChangeRole]: ModalPositions.Top,
  [ModalTypes.CreateVenue]: ModalPositions.Top,
  [ModalTypes.CreateHeadliningArtist]: ModalPositions.Top,
  [ModalTypes.CreateOpeningArtist]: ModalPositions.Top,
  [ModalTypes.AddTerminalDevice]: ModalPositions.Top,
  [ModalTypes.CancelEvent]: ModalPositions.Top,
  [ModalTypes.CancelOrder]: ModalPositions.Top,
  [ModalTypes.OrganizationInvite]: ModalPositions.Top,
  [ModalTypes.PublishEvent]: ModalPositions.Top,
  [ModalTypes.EventPublished]: ModalPositions.Top,
  [ModalTypes.Refund]: ModalPositions.Top,
  [ModalTypes.UserOrderTicket]: ModalPositions.Top,
  [ModalTypes.SubscribeSalesReport]: ModalPositions.Top,
  [ModalTypes.AdjustCheckIn]: ModalPositions.Top,
  [ModalTypes.FeeModal]: ModalPositions.Top,
  [ModalTypes.UpdateCustomer]: ModalPositions.Top,
  [ModalTypes.TicketHold]: ModalPositions.Top,
  [ModalTypes.UpdateTicketBlockModal]: ModalPositions.Top,


};

/********************************************************************************
 *  Modal
 *******************************************************************************/

type ContainerProps = {
  isTop: boolean;
};

const Container = styled(FadeIn) <ContainerProps>`
  position: fixed;
  height: ${(props) => (props.isTop ? "100%" : "100%")};
  width: 100%;
  background-color: ${Polished.rgba(Colors.Black, 0.4)};
  display: flex;
  justify-content: center;
  align-items: ${(props) => (props.isTop ? "flex-start" : "center")};
  padding: ${(props) => (props.isTop ? "100px 0" : "0")};
  z-index: 9999;
  overflow-y: scroll;
`;


type ModalProps = {};

const Modal: React.FC<ModalProps> = () => {
  /* State */
  const appState = useSelector((state: BackstageState) => state.app);
  const {
    modal: { modals },
  } = appState;

  /** Render */

  if (!modals.length) return null;

  const isTop =
    positions[[...modals].pop() as ModalTypes] === ModalPositions.Top;

  return (
    <Container duration={0.1} isTop={isTop}>
      {modals.map((modal, index) => {
        return (
          <RenderModal
            key={index}
            modal={modal}
            active={index === modals.length - 1}
          />
        );
      })}
    </Container>
  );
};

export default Modal;

/********************************************************************************
 *  Render Modal
 *******************************************************************************/

type RenderModalContainerProps = {
  active: boolean;
};

const RenderModalContainer = styled.div<RenderModalContainerProps>`
  position: ${(props) => (props.active ? null : "absolute")};
  top: ${(props) => (props.active ? null : "-10000000px")};
  left: ${(props) => (props.active ? null : "-10000000px")};
  @media (max-width: 767px){
    width: 90%;
  }
`;

type RenderModalProps = {
  modal: ModalTypes;
  active: boolean;
};

const RenderModal: React.FC<RenderModalProps> = ({ modal, active }) => {
  return (
    <RenderModalContainer active={active}>
      {(() => {
        switch (modal) {
          case ModalTypes.ImageCropper:
            return <ImageCropperModal />;
          case ModalTypes.AddSecondaryEmail:
            return <AddSecondaryEmailModal />;
          case ModalTypes.ChangeEmail:
            return <ChangeEmailModal />;
          case ModalTypes.ChangePassword:
            return <ChangePasswordModal />;
          case ModalTypes.ChangePhoneNumber:
            return <ChangePhoneNumberModal />;
          case ModalTypes.TicketType:
            return <CreateEventTicketTypeModal />;
          case ModalTypes.SeasonTicketType:
            return <CreateSeasonTicketTypeModal />;
          case ModalTypes.UpgradeType:
            return <CreateEventUpgradeTypeModal />;
          case ModalTypes.SeasonUpgradeType:
            return <CreateSeasonUpgradeTypeModal />;
          case ModalTypes.Promotion:
            return <CreateEventPromotionModal />;
          case ModalTypes.SeasonPromotion:
            return <CreateSeasonPromotionModal />;
          case ModalTypes.Fee:
            return <CreateEventFeeModal />;
          case ModalTypes.CustomField:
            return <CreateEventCustomFieldModal />;
          case ModalTypes.SaveChanges:
            return <SaveChangesModal />;
          case ModalTypes.ConfirmAction:
            return <ConfirmActionModal />;
          case ModalTypes.AddRole:
            return <AddRoleModal />;
          case ModalTypes.DeleteRole:
            return <DeleteRoleModal />;
          case ModalTypes.ChangeRole:
            return <ChangeRoleModal />;
          case ModalTypes.CreateVenue:
            return <CreateVenueModal />;
          case ModalTypes.CreateHeadliningArtist:
            return <CreateHeadliningArtistModal />;
          case ModalTypes.CreateOpeningArtist:
            return <CreateOpeningArtistModal />;
          case ModalTypes.AddTerminalDevice:
            return <AddTerminalDeviceModal />;
          case ModalTypes.CancelEvent:
            return <CancelEventModal />;
          case ModalTypes.CancelOrder:
            return <CancelOrderModal />;
          case ModalTypes.OrganizationInvite:
            return <OrganizationInviteModal />;
          case ModalTypes.OrderDetails:
            return <OrderDetailsModal />;
          case ModalTypes.PublishEvent:
            return <PublishEventModal />;
          case ModalTypes.EventPublished:
            return <EventPublishedModal />;
          case ModalTypes.Refund:
            return <RefundModal />;
          case ModalTypes.UserOrderTicket:
            return <UserOrderTicketModal />;
          case ModalTypes.SeeOrderDetailsModal:
            return <SeeOrderDetailsModal />;
          case ModalTypes.PublishSeasonModal:
            return <PublishSeasonModal />;
          case ModalTypes.SeasonPublishedModal:
            return <SeasonPublishedModal />;
          case ModalTypes.SubscribeSalesReport:
            return <SubscribeSalesReportModal />;
          case ModalTypes.AdjustCheckIn:
            return <AdjustCheckIn />;
          case ModalTypes.FeeModal:
            return <FeeModal />;
          case ModalTypes.UpdateCustomer:
            return <UpdateCustomerModal />;
            case ModalTypes.TicketHold:
              return <TicketBlockModal />;
              case ModalTypes.UpdateTicketBlockModal:
              return <UpdateTicketBlockModal />;
          default:
            return <div />;
        }
      })()}
    </RenderModalContainer>
  );
};

/********************************************************************************
 *  Exported Modal Styles - for use in modal implmentations
 *******************************************************************************/

type ModalContainerProps = {
  height?: string;
  width?: string;
  display?: string;
  position?: string;
  top?: string;
  left?: string;
};

export const ModalContainer = styled(CardPop) <ModalContainerProps>`
  position: ${(props) => props.position || "relative"};
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  border-radius: 10px;
  background-color: ${Colors.OffWhite};
  overflow: visible;
  display: ${(props) => props.display};
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  @media (max-width: 991px) {
    width:100%;
    margin: 0 auto;
  }
`;

const ModalHeaderContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 49px;
  padding: 0 20px;
  border-radius: 10px 10px 0px 0px;
  background-color: ${Colors.White};
  border-bottom: 1px solid ${Colors.Grey6};
`;

const ModalTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type ModalHeaderProps = {
  title: string;
  icon?: any;
  close: Function;
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  icon,
  close,
}) => {
  return (
    <ModalHeaderContainer>
      <Row>
        {icon && icon}
        <ModalTitle>{title}</ModalTitle>
      </Row>
      <Icon
        icon={Icons.CancelCircle}
        color={Colors.Grey5}
        hoverColor={Colors.Red}
        size={14}
        onClick={close}
      />
    </ModalHeaderContainer>
  );
};

type ModalContentHeight = {
  height?: string;
  padding?: string;
  backgroundColor?:string
};

export const ModalContent = styled.div<ModalContentHeight>`
  position: relative;
  padding: ${(props) => props.padding || "20px"};
  height: ${(props) => props.height};
  background-color: ${(props) => props.backgroundColor};;
`;

export const ModalFooter = styled.div<ModalContentHeight>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => (props.padding ? props.padding : "9px 20px")};
  background-color: ${Colors.White};
  border-top: 1px solid ${Colors.Grey6};
  border-radius: 0px 0px 10px 10px;
`;
