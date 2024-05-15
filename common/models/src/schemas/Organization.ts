import shortid from 'shortid';
import Address from './Address';
import { TicketFormatAsEnum } from '../interfaces/IOrganization';

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  authyId: {
    type: String,
    required: false,
    default: null,
  },
  stripeId: {
    type: String,
    required: false,
    default: null,
  },
  orgName: {
    type: String,
    required: false,
    default: null,
  },
  orgUrls: {
    type: [String],
    required: false,
    default: null,
  },
  orgLogoUrl: {
    type: String,
    required: false,
    default: null,
  },
  orgColorHex: {
    type: String,
    required: false,
    default: null,
  },
  bio: {
    type: String,
    required: false,
    default: null,
  },
  email: {
    type: String,
    required: false,
    default: null,
  },
  phoneNumber: {
    type: String,
    required: false,
    default: null,
  },
  facebookPixelId: {
    type: String,
    required: false,
    default: null,
  },
  googleAnalyticsId: {
    type: String,
    required: false,
    default: null,
  },
  address: Address,
  isSeasonTickets:{
    type: Boolean,
    required: false,
    default: false
  },isTegIntegration:{
    type: Boolean,
    required: false,
    default: false
  },validateMemberId:{
    type: Boolean,
    required: false,
    default: false
  },tegClientID:{
    type: String,
    required: false,
    default: false
  },tegSecret:{
    type: String,
    required: false,
    default: false
  },tegURL:{
    type: String,
    required: false,
    default: false
  },ticketFormat:{
    type:String,
    required:false,
    default:TicketFormatAsEnum.Standard
  },locationId:{
    type: String,
    required: false,
    default: false
  }
};
