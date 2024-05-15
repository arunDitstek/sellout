import { ModalTypes } from "../../components/modal/Modal";

export interface ISaveOnChanges {
  saveOnChanges?: boolean;
}

export default interface IModalProps {
  [ModalTypes.ImageCropper]?: {}[];
  [ModalTypes.ChangePhoneNumber]?: {}[];
  [ModalTypes.ChangePassword]?: {}[];
  [ModalTypes.ChangeEmail]?: {}[];
  [ModalTypes.AddSecondaryEmail]?: {}[];
  [ModalTypes.TicketType]?: ISaveOnChanges[];
  [ModalTypes.UpgradeType]?: ISaveOnChanges[];
  [ModalTypes.Promotion]?: ISaveOnChanges[];
  [ModalTypes.CustomField]?: ISaveOnChanges[];
  [ModalTypes.Fee]?: {}[];
  [ModalTypes.OrderDetails]?: {}[];
  [ModalTypes.SaveChanges]?: {}[];
  [ModalTypes.ConfirmAction]?: {}[];
  [ModalTypes.AddRole]?: {}[];
  [ModalTypes.DeleteRole]?: {}[];
  [ModalTypes.ChangeRole]?: {}[];
  [ModalTypes.CreateVenue]?: {}[];
  [ModalTypes.CreateHeadliningArtist]?: {}[];
  [ModalTypes.CreateOpeningArtist]?: {}[];
  [ModalTypes.AddTerminalDevice]?: {}[];
  [ModalTypes.CancelEvent]?: {}[];
  [ModalTypes.CancelOrder]?: {}[];
  [ModalTypes.OrganizationInvite]?: {}[];
  [ModalTypes.PublishEvent]?: {}[];
  [ModalTypes.EventPublished]?: {}[];
  [ModalTypes.Refund]?: {}[];
  [ModalTypes.UserOrderTicket]?: {}[];
  [ModalTypes.SeeOrderDetailsModal]?: {}[];
  [ModalTypes.PublishSeasonModal]?: {}[];
  [ModalTypes.SeasonTicketType]?: {}[];
  [ModalTypes.SeasonUpgradeType]?: {}[];
  [ModalTypes.SeasonUpgradeType]?: {}[];
  [ModalTypes.SeasonPromotion]?: {}[];
  [ModalTypes.SeasonPublishedModal]?: {}[];
  [ModalTypes.AdjustCheckIn]?: {}[];
  [ModalTypes.SubscribeSalesReport]?: {}[];
  [ModalTypes.FeeModal]: any;
  [ModalTypes.UpdateCustomer]: any;
  [ModalTypes.TicketHold]?: any;
  [ModalTypes.UpdateTicketBlockModal]?: any;
}

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type ModalPropTypes = ArrayElement<IModalProps[keyof IModalProps]>;

export type ModalPropType = {
  [Key in keyof IModalProps]: ArrayElement<IModalProps[Key]>;
};
