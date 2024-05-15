import gql from "graphql-tag";
import { merge } from "lodash";
import { makeExecutableSchema } from "graphql-tools";
import { GraphQLUpload } from "graphql-upload";
import { resolvers as userResolvers } from "./resolvers/user";
import { resolvers as userProfileResolvers } from "./resolvers/userProfile";
import { resolvers as organizationResolvers } from "./resolvers/organization";
import { resolvers as orderResolvers } from "./resolvers/order";
import { resolvers as platformSettingsResolvers } from "./resolvers/platformSettings";
import { resolvers as stripeResolvers } from "./resolvers/stripe";
import { resolvers as venueResolvers } from "./resolvers/venue";
import { resolvers as artistResolvers } from "./resolvers/artist";
import { resolvers as eventResolvers } from "./resolvers/event";
import { resolvers as roleResolvers } from "./resolvers/role";
import { resolvers as fileUploadResolvers } from "./resolvers/fileUpload";
import { resolvers as webFlowResolvers } from "./resolvers/webFlow";
import { resolvers as feeResolvers } from "./resolvers/fee";
import { resolvers as seatingResolvers } from "./resolvers/seating";
import { resolvers as seasonResolvers } from "./resolvers/season";
import { AnalyticsTypeEnum } from "@sellout/models/.dist/interfaces/IAnalytics";
import { FeeAppliedByEnum } from "@sellout/models/.dist/interfaces/IFee";

const schema = gql`
  scalar Upload

  ######################################################################
  # User
  ######################################################################

  type User {
    _id: String!
    firstName: String!
    lastName: String!
    email: String!
    emailVerifiedAt: Int
    phoneNumber: String!
    phoneNumberVerifiedAt: Int
    orgContextId: String
    orgRole: String
    role: Role
    userProfile: UserProfile
    phoneNumberWaitingForVerify: String
    emailWaitingForVerify: String
    preferredLogin: String
    createdAt: Int
    secondaryEmails: [String]
  }

  input UserInput {
    email: String!
    password: String
    firstName: String
    lastName: String
    phoneNumber: String
    secondaryEmail: Boolean
  }

  type UserProfile {
    _id: String!
    userId: String
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
    user: User
    authyId: String
    stripeCustomerId: String
    stripeCustomer: StripeCustomer
    imageUrl: String
    orgIds: [String]
    eventIds: [String]
    venueIds: [String]
    artistIds: [String]
    address: Address
    analytics: Analytics
    metrics: [Metrics]
  }

  type UserProfileAdmin {
    _id: String!
    userId: String
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
    user: User
    authyId: String
    stripeCustomerId: String
    imageUrl: String
    orgIds: [String]
    eventIds: [String]
    venueIds: [String]
    artistIds: [String]
    address: Address
    analytics: Analytics
    metrics: [Metrics]
  }
  input UserProfileInput {
    imageUrl: String
    address: AddressInput
  }

  type Metrics {
    _id: String!
    orgId: String!
    createdAt: Int!
    # Value
    lifeTimeValue: Int
    yearToDateValue: Int
    lifeTimeValueRefunded: Int
    yearToDateValueRefunded: Int
    # Tickets
    lifeTimeTicketsPurchased: Int
    yearToDateTicketsPurchased: Int
    lifeTimeTicketsRefunded: Int
    yearToDateTicketsRefunded: Int
    # Upgrades
    lifeTimeUpgradesPurchased: Int
    yearToDateUpgradesPurchased: Int
    lifeTimeUpgradesRefunded: Int
    yearToDateUpgradesRefunded: Int
    # Orders
    lifeTimeOrdersPurchased: Int
    yearToDateOrdersPurchased: Int
    lifeTimeOrdersRefunded: Int
    yearToDateOrdersRefunded: Int
    eventIds:[String]
  }
  

  type UserExists {
    userId: String
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
    hasPassword: Boolean
    preferredLogin: String
    phoneNumberVerifiedAt: Int
    promoAvailable: Boolean
  }

  type Register {
    registered: Boolean!
    emailVerified: Boolean!
    userProfile: UserProfile
  }

  type Authentication {
    user: User!
    token: String!
  }

  type SendUserEmailVerification {
    sent: Boolean!
  }

  type SendUserPhoneVerification {
    sent: Boolean!
  }

  type VerifyUserPhoneNumber {
    phoneVerified: Boolean!
  }

  ######################################################################
  # Organization
  ######################################################################

  type Organization {
    _id: String
    userId: String
    user: User
    createdAt: Int
    authyId: String
    stripeId: String
    stripeConnectAccount: StripeConnectAccount
    orgName: String
    orgUrls: [String]
    address: Address
    orgLogoUrl: String
    orgColorHex: String
    bio: String
    email: String
    phoneNumber: String
    webFlowEntity: WebFlowEntity
    webFlow: WebFlow
    seating: Seating
    facebookPixelId: String
    googleAnalyticsId: String
    isSeasonTickets: Boolean
    isTegIntegration: Boolean
    validateMemberId: Boolean

    tegClientID:String
    tegSecret:String
    tegURL:String
    ticketFormat:String
    locationId: String
  }

  type OrganizationView {
    orgName: String
    orgUrls: [String]
    address: Address
    orgLogoUrl: String
    orgColorHex: String
    stripeId: String
    bio: String
    email: String
    phoneNumber: String
    facebookPixelId: String
    googleAnalyticsId: String
    isSeasonTickets: Boolean
    isTegIntegration: Boolean
    validateMemberId: Boolean
    tegClientID:String
    tegSecret:String
    tegURL:String
    ticketFormat:String
    locationId: String
  }

  input OrganizationInput {
    orgName: String
    orgUrls: [String]
    address: AddressInput
    orgLogoUrl: String
    orgColorHex: String
    bio: String
    email: String
    phoneNumber: String
    facebookPixelId: String
    googleAnalyticsId: String
    isSeasonTickets: Boolean
    isTegIntegration: Boolean
    validateMemberId: Boolean
    tegClientID:String
    tegSecret:String
    tegURL:String
    ticketFormat:String
    locationId: String
  }

  ######################################################################
  # Venue
  ######################################################################

  type Venue {
    _id: String
    orgId: String
    name: String
    description: String
    capacity: Int
    url: String
    tax: String
    imageUrls: [String]
    venueGlobalId: String
    address: Address
    webFlowEntity: WebFlowEntity
  }

  input VenueInput {
    _id: String
    orgId: String
    name: String
    description: String
    capacity: Int
    tax: String
    address: AddressInput
    url: String
    imageUrls: [String]
    venueGlobalId: String
  }

  ######################################################################
  # Artist, Contacts & Press Kits
  ######################################################################

  type Artist {
    _id: String
    orgId: String
    type: String
    name: String
    genres: [String]
    socialAccounts: [SocialAccountLink]
    pressKits: [ArtistPressKit]
    contacts: [ArtistContact]
    artistGlobalId: String
    createdAt: Int
    webFlowEntity: WebFlowEntity
  }

  input ArtistInput {
    _id: String
    orgId: String
    type: String
    name: String
    genres: [String]
    socialAccounts: [SocialAccountLinkInput]
    pressKits: [ArtistPressKitInput]
    contacts: [ArtistContactInput]
    artistGlobalId: String
  }

  input PaymentDetailsInput {
    number: String
    exp_month: String
    exp_year: String
    cvc: String
    name: String
  }
  type ArtistContact {
    _id: String
    firstName: String
    lastName: String
    title: String
    company: String
    email: String
    phoneNumber: String
  }

  input ArtistContactInput {
    _id: String
    firstName: String
    lastName: String
    title: String
    company: String
    email: String
    phoneNumber: String
  }

  type ArtistPressKit {
    _id: String
    title: String
    description: String
    posterImageUrls: [String]
    links: [SocialAccountLink]
  }

  input ArtistPressKitInput {
    _id: String
    title: String
    description: String
    posterImageUrls: [String]
    links: [SocialAccountLinkInput]
  }

  type SocialAccountLink {
    _id: String
    platform: String
    link: String
  }

  input SocialAccountLinkInput {
    _id: String
    platform: String
    link: String
  }

  ######################################################################
  # Event
  ######################################################################

  type Event {
    _id: String!
    orgId: String!
    organization: OrganizationView
    type: String!
    name: String
    subtitle: String
    description: String
    posterImageUrl: String
    venueId: String
    venue: Venue
    createdAt: Int
    publishable: Boolean
    seatingChartKey: String
    seatingPublicKey: String
    age: String
    active: Boolean
    cancel: Boolean
    sendQRCode: String
    userAgreement: String
    processAs: String
    location: Address
    schedule: EventSchedule
    performances: [Performance]
    ticketTypes: [TicketType]
    holds: [TicketHold]
    upgrades: [EventUpgrade]
    promotions: [EventPromotion]
    customFields: [EventCustomField]
    exchange: TicketExchange
    fees: [Fee]
    artists: [Artist]
    webFlowEntity: WebFlowEntity
    hasOrders: Boolean
    published: Boolean
    taxDeduction: Boolean
    analytics: Analytics
    salesBeginImmediately: Boolean
    isMultipleDays: Boolean
    totalDays: String
    seasonId: String
    ticketDeliveryType: String
    physicalDeliveryInstructions: String
    isGuestTicketSale: Boolean
    guestTicketPerMember: String
    subscription: [SubscriptionSalesReport]
    stub:String
    waitList:[WaitList]
  }

  input EventInput {
    _id: String
    isMultipleDays: Boolean
    totalDays: String
    orgId: String
    type: String
    name: String
    subtitle: String
    description: String
    posterImageUrl: String
    venueId: String
    publishable: Boolean
    cancel: Boolean
    seatingChartKey: String
    age: String
    taxDeduction: Boolean
    sendQRCode: String
    userAgreement: String
    processAs: String
    location: AddressInput
    schedule: EventScheduleInput
    performances: [PerformanceInput]
    ticketTypes: [TicketTypeInput]
    holds: [TicketHoldInput]
    upgrades: [EventUpgradeInput]
    promotions: [EventPromotionInput]
    customFields: [EventCustomFieldInput]
    exchange: TicketExchangeInput
    fees: [FeeInput]
    salesBeginImmediately: Boolean
    seasonId: String
    ticketDeliveryType: String
    physicalDeliveryInstructions: String
    isGuestTicketSale: Boolean
    guestTicketPerMember: String
    subscription: [SalesReportInput]
    isHold: Boolean
    stub:String
    waitList:[WaitListQueryInput]
  }

  input SeasonInput {
    _id: String
    orgId: String
    type: String
    name: String
    subtitle: String
    description: String
    posterImageUrl: String
    venueId: String
    publishable: Boolean
    cancel: Boolean
    seatingChartKey: String
    age: String
    taxDeduction: Boolean
    sendQRCode: String
    userAgreement: String
    processAs: String
    location: AddressInput
    schedule: EventScheduleInput
    performances: [PerformanceInput]
    ticketTypes: [TicketTypeInput]
    holds: [TicketHoldInput]
    upgrades: [EventUpgradeInput]
    promotions: [EventPromotionInput]
    customFields: [EventCustomFieldInput]
    exchange: TicketExchangeInput
    fees: [FeeInput]
    salesBeginImmediately: Boolean
    numberOfEvent: Int
    eventIds: [String]
    isGuestTicketSale: Boolean
  }
  type Season {
    _id: String!
    orgId: String!
    organization: OrganizationView
    type: String!
    name: String
    subtitle: String
    description: String
    posterImageUrl: String
    venueId: String
    venue: Venue
    createdAt: Int
    publishable: Boolean
    seatingChartKey: String
    seatingPublicKey: String
    age: String
    active: Boolean
    cancel: Boolean
    sendQRCode: String
    userAgreement: String
    processAs: String
    location: Address
    schedule: EventSchedule
    performances: [Performance]
    ticketTypes: [TicketType]
    holds: [TicketHold]
    upgrades: [EventUpgrade]
    promotions: [EventPromotion]
    customFields: [EventCustomField]
    exchange: TicketExchange
    fees: [Fee]
    events: [Event]
    artists: [Artist]
    webFlowEntity: WebFlowEntity
    hasOrders: Boolean
    published: Boolean
    taxDeduction: Boolean
    analytics: Analytics
    salesBeginImmediately: Boolean
    eventIds: [String]
    numberOfEvent: Int
    isGuestTicketSale: Boolean
  }

  type EventSchedule {
    announceAt: Int
    ticketsAt: Int
    ticketsEndAt: Int
    startsAt: Int
    endsAt: Int
  }

  input EventScheduleInput {
    announceAt: Int
    ticketsAt: Int
    ticketsEndAt: Int
    startsAt: Int
    endsAt: Int
  }

  type Performance {
    _id: String!
    name: String!
    headliningArtistIds: [String]
    headliningArtists: [Artist]
    openingArtistIds: [String]
    openingArtists: [Artist]
    venueId: String
    venueStageId: String
    price: Int
    posterImageUrl: String
    videoLink: String
    songLink: String
    schedule: [PerformanceSchedule]
  }
 

  input PerformanceInput {
    _id: String
    name: String
    headliningArtistIds: [String]
    openingArtistIds: [String]
    venueId: String
    venueStageId: String
    price: Int
    posterImageUrl: String
    videoLink: String
    songLink: String
    schedule: [PerformanceScheduleInput]
  }

  type PerformanceSchedule {
    doorsAt: Int
    startsAt: Int
    endsAt: Int
  }

  input PerformanceScheduleInput {
    doorsAt: Int
    startsAt: Int
    endsAt: Int
  }

  type TicketType {
    _id: String
    name: String!
    totalQty: Int!
    remainingQty: Int!
    purchaseLimit: Int!
    visible: Boolean!
    performanceIds: [String]!
    tiers: [TicketTier]!
    description: String!
    rollFees: Boolean
    promo: String
    values: String
    dayIds: [String]
    value: Int
    price: Int
    ticketsAvailable: Boolean
  }

  input TicketTypeInput {
    _id: String
    name: String
    totalQty: Int
    remainingQty: Int
    purchaseLimit: Int
    visible: Boolean
    dayIds: [String]
    performanceIds: [String]
    tiers: [TicketTierInput]
    description: String
    rollFees: Boolean
    promo: String
    values: String
  }

  type TicketTier {
    _id: String
    name: String!
    price: Int!
    startsAt: Int!
    endsAt: Int!
    totalQty: Int!
    remainingQty: Int!
  }

  input TicketTierInput {
    _id: String
    name: String
    price: Int
    startsAt: Int
    endsAt: Int
    totalQty: Int
    remainingQty: Int
  }

  type TicketHold {
    _id: String
    name: String!
    ticketType:String
    totalHeld:Int
    totalCheckedIn:Int
    totalReleased:Int
    totalOutstanding:Int
    qty: Int!
    ticketTypeId: String!
  }

  input TicketHoldInput {
    _id: String
    name: String
    ticketType:String
    totalHeld:Int
    totalCheckedIn:Int
    totalReleased:Int
    totalOutstanding:Int
    qty: Int
    ticketTypeId: String
  }


  type EventUpgrade {
    _id: String
    name: String!
    price: Int!
    totalQty: Int!
    remainingQty: Int!
    purchaseLimit: Int
    complimentary: Boolean
    complimentaryWith: String
    complimentaryQty: Int
    ticketTypeIds: [String]!
    imageUrl: String!
    description: String!
    visible: Boolean
    rollFees: Boolean
    values: String
  }

  input EventUpgradeInput {
    _id: String
    name: String
    price: Int
    totalQty: Int
    remainingQty: Int
    ticketTypeIds: [String]
    complimentary: Boolean
    complimentaryWith: String
    complimentaryQty: Int
    purchaseLimit: Int
    imageUrl: String
    description: String
    visible: Boolean
    rollFees: Boolean
    values: String
  }

  type EventPromotion {
    _id: String
    code: String
    type: String
    totalQty: Int
    remainingQty: Int
    ticketTypeIds: [String]
    upgradeIds: [String]
    active: Boolean
    startsAt: Int
    endsAt: Int
    useLimit: Int
    discountType: String
    discountValue: Float
    overRideMax: Int
    overRideMaxUpg:Int
    appliesTo:String
  }

  input EventPromotionInput {
    _id: String
    code: String
    type: String
    totalQty: Int
    remainingQty: Int
    overRideMax: Int
    overRideMaxUpg:Int
    ticketTypeIds: [String]
    upgradeIds: [String]
    active: Boolean
    startsAt: Int
    endsAt: Int
    useLimit: Int
    discountType: String
    discountValue: Float
    appliesTo:String

  }

  type EventCustomField {
    _id: String
    label: String
    type: String
    minLength: Int
    maxLength: Int
    minValue: Int
    maxValue: Int
    required: Boolean
    active: Boolean
    options: [String]
    discountValue: Float
  }

  input EventCustomFieldInput {
    _id: String
    label: String
    type: String
    minLength: Int
    maxLength: Int
    minValue: Int
    maxValue: Int
    required: Boolean
    options: [String]
    active: Boolean
  }

  type TicketExchange {
    allowed: String!
    percent: Int!
  }

  type SubscriptionSalesReport{
    _id: String
    email: String
    frequency: String
  }

  input TicketExchangeInput {
    allowed: String!
    percent: Int!
  }

  ######################################################################
  # Fee
  ######################################################################

  type Fee {
    _id: String!
    name: String!
    orgId: String
    eventId: String
    seasonId: String
    type: String!
    value: Float!
    appliedTo: String!
    appliedBy: String!
    minAppliedToPrice: Int
    maxAppliedToPrice: Int
    filters: [String]
    createdBy: String!
    createdAt: Int!
    updatedBy: String!
    updatedAt: Int!
    disabled: Boolean!
    amount: Float
    paymentMethods: [String]
    isApplyPlatformFee:Boolean
  }

  input FeeInput {
    _id: String
    name: String
    eventId: String
    seasonId: String
    type: String
    value: Float
    appliedTo: String
    appliedBy: String
    minAppliedToPrice: Int
    maxAppliedToPrice: Int
    filters: [String]
    paymentMethods: [String]
    amount: Int
    isApplyPlatformFee:Boolean

  }
  input TicketRestrictionInput{
    eventId:String
    seasonId:String
    teiMemberId:[String]!
  }

  ######################################################################
  # Order
  ######################################################################




 type TicketRestriction{
  eventId:String
  seasonId:String
  teiMemberId:[String]
  invalidTeiMemberIds:[String]
  guestTicketCounts: [GuestTicketCounts]
 }

 type GuestTicketCounts{
  teiMemberId: String
  count: Int
  inValid: Boolean
 } 

  type Order {
    _id: String!
    userId: String
    user: User
    organization:Organization
    seasonId: String
    userProfile: UserProfile
    orgId: String!
    eventId: String
    eventName: String
    event: Event
    tax: Float
    venueIds: [String!]!
    venues: [Venue]
    artistIds: [String!]!
    artists: [Artist]
    feeIds: [String]!
    fees: [Fee]
    processingFee: OrderProcessing
    promoterFee: OrderProcessing
    stripeChargeId: String
    qrCodeUrl: String
    stripeCharge: StripeCharge
    tickets: [OrderTicket]
    upgrades: [OrderUpgrade]!
    recipientEmails: [String]
    state: String
    refundedAmount: Int
    type: String
    channel: String
    createdAt: Int!
    createdBy: String!
    creator: User
    promotionCode: String
    ipAddress: String
    address: Address
    customFields: [OrderCustomField]
    refundReason: String
    payments: [Payment]
    hidden: Boolean
    season: Season
    printed: Boolean
    parentSeasonOrderId: String
    email: String
    discountCode:String
    discountAmount:Int
  }

  type OrderDetails{
    eventId: String
    ticketSold: Int
    ticketScanned: Int
    ticketUnscanned:Int
  }

  type OrderProcessing {
    refund: Refund
    amount: Float
  }

  input PaymentCalculationInput {
    eventId: String
    tickets: [OrderTicketInput]
    upgrades: [OrderUpgradeInput]
    promotions:[EventPromotionInput]
    paymentMethodType: String
  }
  
  type PaymentCalculationType {
      salesTax: String
      total: String
      promoterFees: String
      stripeFees: String
      selloutFees: String
      orderSubtotal: String
      subTotal: String
      totalFees: String
      totalWithoutTaxFees: String
      guestFeeForPromoter: String
      guestFeeForSellout: String
      discountAmount:Int
  }


  input OrderInput {
    _id: String
    userId: String
    orgId: String!
    eventId: String!
    tickets: [OrderTicketInput]
    upgrades: [OrderUpgradeInput]
    fees: [FeeInput]
    type: String
    channel: String
    promotionCode: String
    customFields: [OrderCustomFieldInput]
    paymentMethodType: String
    paymentIntentId: String
    holdToken: String
    parentSeasonOrderId: String
    discountCode:String
    discountAmount:Int
    discount:Int

  }

  input OrderSeasonInput {
    _id: String
    userId: String
    orgId: String!
    eventId: String
    seasonId: String
    tickets: [OrderTicketInput]
    upgrades: [OrderUpgradeInput]
    type: String
    channel: String
    promotionCode: String
    customFields: [OrderCustomFieldInput]
    paymentMethodType: String
    paymentIntentId: String
    holdToken: String
  }

  input OrderPaymentIntentInput {
    _id: String
    userId: String
    orgId: String!
    eventId: String!
    tickets: [OrderTicketInput]
    upgrades: [OrderUpgradeInput]
    promotionCode: String
    channel: String!
    paymentMethodType: String
    paymentMethodId: String
    stalePaymentIntentId: String
    discountCode:String
    discount:Int
  }

  input OrderSeasonPaymentIntentInput {
    _id: String
    userId: String
    orgId: String!
    seasonId: String!
    tickets: [OrderTicketInput]
    upgrades: [OrderUpgradeInput]
    promotionCode: String
    channel: String!
    paymentMethodType: String
    paymentMethodId: String
    stalePaymentIntentId: String
  }

  input ScanInput {
    scanned: Boolean
    scannedAt: Int
    scannedBy: String
    startsAt: Int
  }

  input UpdateOrderInput{
    orderId: String
    ticketId: String
    scan: [ScanInput]
    email: String
  }

  input UpdateGuestOrderInput{
    orderId: String
    email: String
  }

  input SalesReportInput{
    email: String
    frequency: String
    eventId: String
  }
  input WaitListInput{
    name: String
    email: String
    phoneNumber: String
    createdAt: Int
  }

  type OrderTicket {
    _id: String
    name: String
    ticketTypeId: String
    ticketTierId: String
    price: Int
    origionalPrice: Int
    rollFees: Boolean
    paymentId: String
    seat: String
    refund: Refund
    scan: [Scan]
    state: String
    qrCodeUrl: String
    values: String
    dayIds: [String]
    teiMemberId: String
    isMemberIdValid: Boolean
    teiMemberInfo: TeiMemberInfo
    guestTicket: Boolean
  }

  input OrderTicketInput {
    _id: String
    name: String
    ticketTypeId: String!
    ticketTierId: String!
    price: Int!
    origionalPrice: Int
    rollFees: Boolean
    seat: String
    values: String
    description: String
    dayIds: [String]
    teiMemberId: String
    isMemberIdValid: Boolean
    teiMemberInfo:TeiMemberInfoInput
    guestTicket: Boolean
  }

  input TeiMemberInfoInput{
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
  }

  type OrderUpgrade {
    _id: String
    name: String
    upgradeId: String
    price: Int
    rollFees: Boolean
    paymentId: String
    refund: Refund
    scan: Scan
    state: String
    qrCodeUrl: String
  }

  input OrderUpgradeInput {
    _id: String
    name: String
    upgradeId: String!
    price: Int!
    rollFees: Boolean
    description: String
  }

  type Refund {
    refunded: Boolean
    refundedAt: Int
    refundedBy: String
    refundReason: String
    refundedAmount: Int
  }

  type Scan {
    scanned: Boolean
    scannedAt: Int
    scannedBy: String
    scannedByUser: User
    startsAt: Int
  }

  type OrderCustomField {
    _id: String
    label: String
    value: String
    customFieldId: String
    type: String
  }

  type TeiMemberInfo {
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
  }

  input OrderCustomFieldInput {
    _id: String
    label: String
    value: String
    customFieldId: String
    type: String
  }

  type Payment {
    _id: String
    paymentIntentId: String
    amount: Int
    transferAmount: Int
    feeAmount: Int
    feeIds: [String]
    createdAt: Int
    tax: Int
    createdBy: String
    promotionCode: String
    paymentMethodType: String
    discountCode:String
    discount:Int
  }

  type CreateOrderPaymentIntentResponse {
    paymentIntentId: String
    clientSecret: String
    ephemeralKey: String
  }

  type ordersChargeUpdate {
    message: String
  }

  type OrderReport {
    url: String
    message: String
  }
  
  ######################################################################
  # Role
  ######################################################################

  type Role {
    _id: String
    orgId: String
    org: Organization
    userId: String
    userEmail: String
    user: User
    token: String
    createdAt: Int
    createdBy: String
    role: String
    acceptedAt: Int
  }

  input RoleInput {
    orgId: String!
    userId: String
    userEmail: String!
    role: String!
  }

  ######################################################################
  # WebFlow
  ######################################################################

  type WebFlow {
    _id: String
    orgId: String
    sites: [WebFlowSite]
    entities: [WebFlowEntity]
    createdAt: Int
    updatedAt: Int
  }

  type WebFlowSite {
    _id: String
    name: String
    webFlowId: String
    enabled: Boolean
    previewUrl: String
    domains: [WebFlowSiteDomain]
    createdAt: Int
    updatedAt: Int
  }

  type WebFlowSiteDomain {
    name: String
    lastPublishedAt: Int
  }

  type WebFlowEntityId {
    webFlowSiteId: String
    webFlowEntityId: String
    slug: String
    webFlowSite: WebFlowSite
  }

  type WebFlowEntity {
    _id: String
    entityType: String
    name: String
    selloutId: String
    webFlowIds: [WebFlowEntityId]
    alwaysPublishTo: [String]
    createdAt: Int
    updatedAt: Int
  }

  ######################################################################
  # Analytics
  ######################################################################

  type Analytics {
    label: String
    interval: String
    intervalOptions: [String]
    coordinates: [Coordinate]
    segments: [Analytics]
    type: String
    totalValue: Float
  }

  type Coordinate {
    x: Float
    y: Float
  }

  input AnalyticsQueryInput {
    eventId: String
    seasonId: String
    venueId: String
    artistId: String
    startDate: Int
    endDate: Int
    interval: String
    types: [String]
  }

  ######################################################################
  # Stripe
  ######################################################################

  type StripeConnectAccount {
    name: String
    country: String
    email: String
    payoutsEnabled: Boolean
    stripeAccountId: String
  }

  type StripeCustomer {
    stripeCustomerId: String
    email: String
    paymentMethods: [StripePaymentMethod]
  }

  type stripePublishKey{
    publicStripeKey : String
  }

  type StripePaymentMethod {
    paymentMethodId: String
    brand: String
    last4: String
    expMonth: String
    expYear: String
    funding: String
    country: String
    type: String
  }

  type Card {
    brand: String
    last4: String
    expMonth: Int
    expYear: Int
    funding: String
    country: String
  }

  type StripeCharge {
    brand: String
    last4: String
  }

  type StripeTerminalReader {
    id: String
    label: String
    type: String
    location: String
    serialNumber: String
    status: String
    ipAddress: String
  }

  ######################################################################
  # Seating
  ######################################################################

  type Seating {
    publicKey: String
    secretKey: String
    designerKey: String
  }

  ######################################################################
  # Miscellaneous
  ######################################################################

  type Address {
    address1: String
    address2: String
    city: String
    state: String
    zip: String
    country: String
    phone: String
    lat: Float
    lng: Float
    placeId: String
    placeName: String
    timezone: String
  }

  input AddressInput {
    address1: String
    address2: String
    city: String
    state: String
    zip: String
    country: String
    phone: String
    lat: Float
    lng: Float
    placeId: String
    placeName: String
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }

  type PlatformSettings {
    stripeClientId: String!
    stripeRedirectUrl: String!
    webFlowSiteId: String!
  }

  type DeleteEventResponse {
    ordersCount: Int
    ordersRefundedCount: Int
    deleted: Boolean
  }

  type RefundEventOrdersResponse {
    allRefunded: Boolean!
    refundCount: Int!
    refundAmount: Int!
    feeAmount: Int!
    dryRun: Boolean!
  }

  input PaginationInput {
    pageSize: Int
    pageNumber: Int
  }

  # Deprecated, use model
  # specific QueryInputs below
  input QueryInput {
    userId: String
    eventId: String
    artistId: String
    venueId: String
    startDate: Int
    endDate: Int
  }

  input OrganizationQueryInput {
    name: String
    orgIds: [String]
    startDate: Int
    endDate: Int
    any: Boolean
    orgQuery: String
  }

  input UserProfileQueryInput {
    eventIds: [String]
    venueIds: [String]
    artistIds: [String]
    userIds: [String]
    name: String
    email: String
    phoneNumber: String
    any: Boolean
    orgId: String
  }

  type WaitList {
    eventIds: [String]
    venueIds: [String]
    artistIds: [String]
    userIds: [String]
    name: String
    email: String
    phoneNumber: String
    createdAt:Int
    any: Boolean
    orgId: String
  }


  input WaitListQueryInput {
    eventIds: [String]
    venueIds: [String]
    artistIds: [String]
    userIds: [String]
    name: String
    email: String
    phoneNumber: String
    createdAt:Int
    any: Boolean
    orgId: String
    eventQuery:String
  }

  type GenerateUserProfileReport {
      url: String
      message: String
    }

  input OrderQueryInput {
    orderIds: [String]
    eventIds: [String]
    seasonIds: [String]
    venueIds: [String]
    artistIds: [String]
    userIds: [String]
    states: [String]
    types: [String]
    userQuery: String
    startDate: Int
    endDate: Int
    any: Boolean
    hidden: Boolean
    sortBy: String
    orgId:[String]

  }

  input EventQueryInput {
    name: String
    venueIds: [String]
    artistIds: [String]
    userIds: [String]
    startDate: Int
    endDate: Int
    sortBy: String
    orderBy: Int
    published: Boolean
    any: Boolean
    cancel: Boolean
    eventQuery:String
  }

  input SeasonQueryInput {
    name: String
    eventIds: [String]
    venueIds: [String]
    artistIds: [String]
    userIds: [String]
    startDate: Int
    endDate: Int
    sortBy: String
    orderBy: Int
    published: Boolean
    any: Boolean
    cancel: Boolean
  }

  input VenueQueryInput {
    name: String
    venueIds: [String]
    any: Boolean
  }

  input ArtistQueryInput {
    name: String
    artistIds: [String]
    any: Boolean
  }

  type EventTickets {
    promoType: String
    overRideMax: Int
    overRideMaxUpg:Int
    remainingQty: Int
    active: Boolean
    startsAt: Int
    endsAt: Int
    eventTickets: [TicketType]
    eventUpgrades:[EventUpgrade]
    discountType:String
    discountValue:Float
    appliesTo:String 
    ticketTypeIds:[String]
    selectedTicket:[String]
  }

  type SeasonTickets {
    promoType: String
    remainingQty: Int
    active: Boolean
    startsAt: Int
    endsAt: Int
    seasonTickets: [TicketType]
  }

  ######################################################################
  # Queries and Mutations
  ######################################################################

  type Query {
    # User
    user: User
    userExists(
      email: String
      phoneNumber: String
      promoCode: String
      eventId: String
      seasonId: String
    ): UserExists

    # User Profile
    userProfile: UserProfile
    userProfileAdmin: UserProfileAdmin
    userProfilesAdmin(
      query: UserProfileQueryInput
      pagination: PaginationInput
    ): [UserProfileAdmin]

    userProfiles(
      query: UserProfileQueryInput
      pagination: PaginationInput
    ): [UserProfile]

    # Organization
    organization: Organization
    organizations(
      query: OrganizationQueryInput
      pagination: PaginationInput
    ): [Organization]

    # Order
    orderDetails(eventId:String):OrderDetails
    eventOrderCount(eventId:String): Int

    
    order(orderId: String): Order
    orders(query: OrderQueryInput, pagination: PaginationInput): [Order]
    orderAnalytics(query: AnalyticsQueryInput!): [Analytics]
    ordersChargeUpdate: ordersChargeUpdate
    ticketRestriction(query: TicketRestrictionInput):TicketRestriction

    # Event
    event(eventId: String): Event
    searchEvents(query: WaitListQueryInput,eventId: String): Event
    eventQuery(query: WaitListQueryInput,eventId: String,pagination: PaginationInput): Event
    notifyEvent(eventId:String,email:String): Event


    events(query: EventQueryInput, pagination: PaginationInput): [Event]
    eventsList: [Event]
    eventsDetails(eventId: String): Event
    eventTickets(
      eventId: String
      seasonId: String
      promoCode: String
    ): [EventTickets]

    eventDiscounts(
      eventId: String
      seasonId: String
      discountCode: String
      userId:String
      selectedTicket:[String]
    ): [EventTickets]

    # Season
    season(seasonId: String): Season
    seasons(query: SeasonQueryInput, pagination: PaginationInput): [Season]
    seasonTickets(seasonId: String, promoCode: String): [SeasonTickets]
    seasonsList: [Season]
    seasonsDetails(seasonId: String): Season

    # Venue
    venue(venueId: String): Venue
    venues(query: VenueQueryInput, pagination: PaginationInput): [Venue]
    globalVenues(name: String, pagination: PaginationInput): [Venue]

    # Artist
    artist(artistId: String): Artist
    artists(query: ArtistQueryInput, pagination: PaginationInput): [Artist]
    artistsById: [Artist]
    globalArtists(name: String, pagination: PaginationInput): [Artist]

    # Fee
    fee(feeId: String!): Fee
    fees(feeIds: [String]!, orgId: String): [Fee]
    eventFees(eventId: String!): [Fee]


    seasonFees(seasonId: String!): [Fee]
    seasonEvents(seasonId: String): [Event]
    listFees(feeIds: [String]!): [Fee]
    organizationFees(orgId: String!): [Fee]
    platformFees: [Fee]
    processingFee: String
    eventFeeCalculation(query:PaymentCalculationInput): PaymentCalculationType


    # Role
    role(roleId: String): Role
    roles(query: QueryInput, pagination: PaginationInput): [Role]
    userRoles: [Role]
    isSuperUser: Boolean

    # WebFlow
    webFlow: WebFlow
    webFlowEntity: WebFlowEntity
    webFlowSites: [WebFlowSite]

    # Stripe
    stripeConnectAccount: StripeConnectAccount
    stripeCustomer: StripeCustomer
    stripeCharge: StripeCharge
    getStripeCardByMethod(paymentMethodId: String!): StripePaymentMethod
    stripePublishKey: stripePublishKey

    # Stripe Terminal
    listStripeTerminalReaders: [StripeTerminalReader]
    createStripeLocationId: String


    # Seating
    seating(orgId: String): Seating
    seatingPublicKey: String

    # Platform
    platformSettings: PlatformSettings
  }

  type Mutation {
    # User
    register(user: UserInput): Register
    login(email: String!, password: String!): Authentication
    forgotUserPassword(email: String!): Boolean
    resetUserPassword(forgotPasswordCode: String!, password: String!): Boolean
    resetUserPasswordInApp(oldPassword: String!, newPassword: String!): Boolean
    updateBasicUserInfo(
      firstName: String
      lastName: String
      imageUrl: String
    ): User
    updateUserInfo(
      _id:String
      email: String
      phoneNumber: String
    ): User
    setUserPassword(password: String!): User # for when checkout users sign in to admin
    setUserOrgContextId(orgId: String): Authentication
    addSecondaryEmail(email: String!): User
    deleteSecondaryEmail(email: String!): User
    updateSecondaryEmail(email: String!): User
    makeSecondaryEmailPrimary(email: String!): User
    # update user login Method
    updateUserPreferredLogin(preferredLogin: String!): User
    # User Phone Auth
    sendUserPhoneAuthentication(
      email: String
      phoneNumber: String
      isLogin: Boolean
    ): Boolean
    verifyUserPhoneAuthentication(
      email: String
      phoneNumber: String
      phoneVerificationToken: String!
    ): Authentication
    # User Email
    updateUserEmail(newEmail: String!): User
    sendUserEmailVerification(email: String): SendUserEmailVerification
    verifyUserEmail(emailVerificationToken: String!): Register
    # User Phone Number
    updateUserPhoneNumber(newPhoneNumber: String!): User
    sendUserPhoneVerification: SendUserPhoneVerification
    verifyUserPhoneNumber(
      phoneVerificationToken: String!
    ): VerifyUserPhoneNumber
    deleteUnverifiedUser(
      userId: String
      email: String
      phoneNumber: String
    ): Boolean

    # User Profile
    updateUserProfile(userProfile: UserProfileInput!): UserProfile
    generateUserProfileReport(query: UserProfileQueryInput): GenerateUserProfileReport

    # Organization
    createOrganization: Organization
    updateOrganization(organization: OrganizationInput!): Organization

    # Venue
    createVenue(venue: VenueInput!): Venue
    updateVenue(venue: VenueInput!): Venue

    # Artist
    createArtist(artist: ArtistInput!): Artist
    updateArtist(artist: ArtistInput!): Artist

    # Event
    createEvent(event: EventInput!): Event
    publishEvent(
      eventId: String!
      publishSiteIds: [String]
      unpublishSiteIds: [String]
      published: Boolean
    ): Event
    holdTicket(eventId:String, params:TicketHoldInput): Event
    updateEvent(event: EventInput!): Event
    deleteEvent(orgId: String!, eventId: String!): DeleteEventResponse
    duplicateEvent(eventId: String!): Event
    salesReport(params: SalesReportInput): Event
    createWaitList(params: WaitListInput, eventId: String, type: String, orgId: String): Event
    deleteSubscription(eventId: String, subscriptionId: String): Event
    generateWaitListReport(query: WaitListQueryInput,eventId:String): GenerateUserProfileReport
    # notifyEvent(eventId:String,email:String): Event


    # Fee
    createFee(fee: FeeInput!): Fee
    createOrganizationFee(orgId: String!, fee: FeeInput!): Fee
    createEventOrSeasonFee(orgId: String, eventId: String, seasonId: String, fee:FeeInput!): Fee
    createPlatformFee(fee: FeeInput!): Fee
    updateFee(fee: FeeInput!): Fee
    updateOrganizationFee(orgId: String!, fee: FeeInput!): Fee
    updateEventOrSeasonFee(orgId: String, eventId: String, seasonId: String, fee:FeeInput!): Fee
    updatePlatformFee(fee: FeeInput!): Fee
    disableFee(feeId: String!): Boolean
    deleteOrganizationFee(orgId: String!, feeId: String!): Boolean
    deleteEventOrSeasonFee(orgId: String, eventId: String, seasonId: String, feeId: String!, ): Boolean
    deletePlatformFee(feeId: String!): Boolean
    applyPlatformFeesToAllOrganizations: Boolean

    # Order
    createOrder(params: OrderInput!): Order
    createSeasonOrder(params: OrderSeasonInput!): Order
    createOrderPaymentIntent(
      params: OrderPaymentIntentInput!
    ): CreateOrderPaymentIntentResponse
    createSeasonOrderPaymentIntent(
      params: OrderSeasonPaymentIntentInput!
    ): CreateOrderPaymentIntentResponse

    updateOrder(params: UpdateOrderInput): Order

    updateGuestOrder(params: UpdateGuestOrderInput): Order
    
    
    sendOrderReceiptEmail(orderId: String!): Boolean
    sendSeasonOrderReceiptEmail(orderId: String!): Boolean
    sendOrderRefundEmail(orderId: String!): Boolean
    sendOrderQRCodeEmail(orderId: String!): Boolean
    scanOrder(
      orderId: String!
      ticketIds: [String]!
      upgradeIds: [String]!
      name: String
      pagination: PaginationInput
    ): Boolean
    refundOrder(
      orderId: String!
      refundAmount: Int
      processingFee: Boolean
      promoterFee: Boolean
      ticketIds: [String]
      upgradeIds: [String]
      refundReason: String
    ): Order
    cancelOrder(
      orderId: String!
      ticketIds: [String]
      upgradeIds: [String]
      cancelReason: String
    ): Order
    refundEventOrders(
      eventId: String!
      dryRun: Boolean!
      refundReason: String
      eventType: String
    ): RefundEventOrdersResponse
    generateOrderReport(query: OrderQueryInput): OrderReport
    breakApartOrder(orderId: String!): Order
    multipleBreakApartOrder(orderId: [String]!):[Order]
    breakApartSeasonOrder(orderId: String!): [Order]
    multipleBreakApartSeasonOrder(orderId: [String]!):[Order]
    batchPrintBreakApartOrder(orderId: [String]!):[Order]
    generateActivityReport(query: OrderQueryInput): OrderReport



    # Role
    createRole(role: RoleInput!, update: Boolean): Role
    deleteRole(roleId: String!): Boolean
    acceptRole(roleId: String!, accept: Boolean!): Role

    # WebFlow
    createWebFlow: WebFlow
    createWebFlowSite(webFlowId: String!, orgId: String!): WebFlow
    remapWebFlowSite(webFlowId: String!): [WebFlow]
    updateVenuePublishing(venueId: String, alwaysPublishTo: [String]): WebFlow

    # Stripe
    connectStripe(connectCode: String!): Boolean
    
    createStripeSetupIntent: String
    attachStripePaymentMethod(paymentMethodId: String!, _id:String): StripePaymentMethod
    createStripeSource(stripeToken: String!, userId: String): StripeCustomer
    deleteStripeSource(sourceId: String!): Boolean
    # Stripe Terminal
    registerStripeTerminalReader(
      label: String
      registrationCode: String
    ): StripeTerminalReader
    deleteStripeTerminalReader(readerId: String!): Boolean
    createStripeTerminalConnectionToken: String

    # Seating
    createOrganizationSeating(orgId: String!): Seating

    # Miscellaneous
    uploadFiles(files: [Upload!]!): [File!]!

    # Season
    createSeason(season: SeasonInput!): Season
    updateSeason(season: SeasonInput!): Season
    publishSeason(seasonId: String!, published: Boolean): Season
  }
`;

export const resolvers = merge(
  userResolvers,
  userProfileResolvers,
  organizationResolvers,
  orderResolvers,
  platformSettingsResolvers,
  stripeResolvers,
  venueResolvers,
  artistResolvers,
  eventResolvers,
  roleResolvers,
  fileUploadResolvers,
  webFlowResolvers,
  feeResolvers,
  seatingResolvers,
  seasonResolvers
);

export const executableSchema = makeExecutableSchema({
  resolvers: {
    Upload: GraphQLUpload,
    Organization: {
      user: (org, args, context) =>
        userResolvers.Query.user(org, args, context),
      stripeConnectAccount: (org, args, context) => { }, //stripeResolvers.Query.stripeConnectAccount(org, args, context),
      webFlowEntity: (org, args, context) =>
        webFlowResolvers.Query.webFlowEntity(
          org,
          { entityType: "ORGANIZATION" },
          context
        ),
      webFlow: (org, args, context) =>
        webFlowResolvers.Query.webFlow(org, null, context),
      seating: (org, args, context) =>
        seatingResolvers.Query.seating(org, null, context),
    },
    Event: {
      organization: (event, args, context) =>
        organizationResolvers.Query.organization(event, args, context),
      venue: (event, args, context) =>
        venueResolvers.Query.venue(event, args, context),
      fees: (event, args, context) =>
        feeResolvers.Query.eventFees(event, args, context),
      artists: (event, args, context) => {
        const artistIds = [
          ...new Set(
            event?.performances.reduce((cur, next) => {
              return [
                ...cur,
                ...next.headliningArtistIds,
                ...next.openingArtistIds,
              ];
            }, [])
          ),
        ];
        if (!artistIds.length) return [];
        return artistResolvers.Query.artistsById(event, { artistIds }, context);
      },
      webFlowEntity: (event, args, context) =>
        webFlowResolvers.Query.webFlowEntity(
          event,
          { entityType: "EVENT" },
          context
        ),
      seatingPublicKey: (event, args, context) =>
        seatingResolvers.Query.seatingPublicKey(event, null, context),
      hasOrders: async (event, args, context) => {

        const query = {
          eventId: event._id,
        };


        // const pagination = {
        //   pageSize: 1,
        //   pageNumber: 1,
        // };
        const orders = await orderResolvers.Query.eventOrderCount("",
          query,
          context
        );
        return orders.eventOrderCount > 0;
      },
      analytics: async (event, args, context) => {
        const analytics = await orderResolvers.Query.orderAnalytics(
          event,
          {
            query: {
              eventId: event._id,
              startDate: null,
              endDate: null,
              types: [AnalyticsTypeEnum.EventAnalytics],
            },
          },
          context
        );
        return analytics[0];
      },
    },
    Season: {
      organization: (season, args, context) =>
        organizationResolvers.Query.organization(season, args, context),
      venue: (season, args, context) =>
        venueResolvers.Query.venue(season, args, context),
      fees: (season, args, context) =>
        feeResolvers.Query.seasonFees(season, args, context),
      events: (season, args, context) =>
        feeResolvers.Query.seasonEvents(season, args, context),
      seatingPublicKey: (season, args, context) =>
        seatingResolvers.Query.seatingPublicKey(season, null, context),
      hasOrders: async (season, args, context) => {
        const query = {
          seasonIds: [season._id],
        };
        const pagination = {
          pageSize: 1,
          pageNumber: 1,
        };
        const orders = await orderResolvers.Query.orders(
          season,
          { query, pagination },
          context
        );
        return orders.length > 0;
      },
      analytics: async (season, args, context) => {
        const analytics = await orderResolvers.Query.orderAnalytics(
          season,
          {
            query: {
              seasonId: season?._id,
              startDate: null,
              endDate: null,
              types: [AnalyticsTypeEnum.EventAnalytics],
            },
          },
          context
        );

        return analytics[0];
      },
    },
    Performance: {
      headliningArtists: (performance, args, context) => {
        if (
          !performance.headliningArtistIds ||
          !performance.headliningArtistIds.length
        )
          return [];
        return artistResolvers.Query.artistsById(
          performance,
          { artistIds: performance.headliningArtistIds || [] },
          context
        );
      },
      openingArtists: (performance, args, context) => {
        if (
          !performance.openingArtistIds ||
          !performance.openingArtistIds.length
        )
          return [];
        return artistResolvers.Query.artistsById(
          performance,
          { artistIds: performance.openingArtistIds || [] },
          context
        );
      },
    },
    Venue: {
      webFlowEntity: (venue, args, context) =>
        webFlowResolvers.Query.webFlowEntity(
          venue,
          { entityType: "VENUE" },
          context
        ),
    },
    Artist: {
      webFlowEntity: (artist, args, context) =>
        webFlowResolvers.Query.webFlowEntity(
          artist,
          { entityType: "ARTIST" },
          context
        ),
    },
    Order: {
      organization: (order, args, context) =>
        organizationResolvers.Query.organization(order, args, context),
      user: (order, args, context) =>
        userResolvers.Query.user(order, args, context),
      userProfile: (order, args, context) =>
        userProfileResolvers.Query.userProfile(
          order,
          { userId: order.userId },
          context
        ),
      event: (order, args, context) =>
        eventResolvers.Query.event(order, args, context),
      season: (order, args, context) =>
        seasonResolvers.Query.season(order, args, context),
      // fees: (order, args, context) => feeResolvers.Query.listFees(order, args, context),
      processingFee: async (order, args, context) => {

        // console.log("order +++++>>>> ", order);
        // let ticketAmount = 0;
        // for (let val of order.tickets) {
        //   ticketAmount += val.price;
        // }
        // for (let val of order.upgrades) {
        //   ticketAmount += val.price;
        // }

        const selloutFee = order.fees?.reduce((cur, next) => {
          return next.appliedBy === FeeAppliedByEnum.Sellout ? cur + parseInt(next?.amount) : cur
        }, 0);

        // const promoterFee = order.fees?.reduce((cur, next) => {
        //   return next.name != "Sales tax" && next.appliedBy === FeeAppliedByEnum.Organization ? cur + parseInt(next?.amount) : cur
        // }, 0);


        const stripeFee = order.fees?.reduce((cur, next) => {
          return next.appliedBy === FeeAppliedByEnum.Stripe ? cur + parseInt(next?.amount) : cur
        }, 0);

        // const salesTaxFee = order.fees?.reduce((cur, next) => {
        //   return next.name === "Sales tax" ? cur + parseInt(next?.amount) : cur
        // }, 0);

        // let fees = await feeResolvers.Query.listFees(order, args, context);
        // // let feewithouttax = fees.filter((fee) => fee.name != "Sales tax");
        // let data = await feeResolvers.Query.processingFee(
        //   { fees: fees, order },
        //   args,
        //   context
        // );

        // let amount = ((data.selloutFees + data.stripeFees) as number)
        let amount = selloutFee + stripeFee;

        return {
          refund: order?.processingFee?.refund || { refunded: false, refundedBy: "" },
          amount: amount
        }
        // return {
        //   refund: order?.processingFee?.refund || null,
        //   amount:
        //     order?.payments?.length > 0
        //       ? order?.payments[0]?.amount -
        //       (ticketAmount + order?.payments[0]?.tax)
        //       : data,
        // };
      },
      promoterFee: async (order, args, context) => {
        // let ticketAmount = 0;
        // for (let val of order.tickets) {
        //   ticketAmount += val.price;
        // }
        // for (let val of order.upgrades) {
        //   ticketAmount += val.price;
        // }
        // let fees = await feeResolvers.Query.listFees(order, args, context);
        // // let feewithouttax = fees.filter((fee) => fee.name != "Sales tax");
        // let data = await feeResolvers.Query.processingFee(
        //   { fees: fees, order },
        //   args,
        //   context
        // );
        const promoterFee = order.fees?.reduce((cur, next) => {
          return next.name != "Sales tax" && next.appliedBy === FeeAppliedByEnum.Organization ? cur + parseInt(next?.amount) : cur
        }, 0);

        const salesTaxFee = order.fees?.reduce((cur, next) => {
          return next.name === "Sales tax" ? cur + parseInt(next?.amount) : cur
        }, 0);

        // let amount = ((data.promoterFees + data.salesTax) as number)
        let amount = ((promoterFee + salesTaxFee) as number);

        return {
          refund: order?.promoterFee?.refund || { refunded: false, refundedBy: "" },
          amount: amount
        }
        // return {
        //   refund: order?.promoterFee?.refund || null,
        //   amount:
        //     order?.payments?.length > 0
        //       ? order?.payments[0]?.amount -
        //       (ticketAmount + order?.payments[0]?.tax)
        //       : data.promoterFee,
        // };
      },
      stripeCharge: (order, args, context) => { }, //stripeResolvers.Query.stripeCharge(order, args, context),
      creator: (order, args, context) =>
        userResolvers.Query.user({ userId: order.createdBy }, args, context),
    },
    Scan: {
      scannedByUser: (scan, args, context) =>
        userResolvers.Query.user({ userId: scan.scannedBy }, args, context),
    },
    Role: {
      org: (role, args, context) =>
        organizationResolvers.Query.organization(role, args, context),
      user: (role, args, context) =>
        userResolvers.Query.user(role, args, context),
      token: async (role, args, context) => {
        let auth = await userResolvers.Mutation.setUserOrgContextId(
          role,
          args,
          context
        );
        return auth.token;
      },
    },
    User: {
      userProfile: (user, args, context) =>
        userProfileResolvers.Query.userProfile(
          user,
          { userId: user?._id },
          context
        ),
      role: async (user, args, context) => {
        let roles = await roleResolvers.Query.userRoles(
          user,
          { userId: user._id },
          context
        );
        return roles.find((role) => role.orgId === user.orgContextId);
      },
    },
    UserProfile: {
      user: (userProfile, args, context) =>
        userResolvers.Query.user(userProfile, args, context),
      stripeCustomer: (userProfile, args, context) =>
        stripeResolvers.Query.stripeCustomer(userProfile, args, context),
      analytics: async (userProfile, args, context) => {
        const analytics = await orderResolvers.Query.orderAnalytics(
          userProfile,
          {
            query: {
              userId: userProfile.userId,
              startDate: null,
              endDate: null,
              types: [AnalyticsTypeEnum.UserAnalytics],
            },
          },
          context
        );

        return analytics[0];
      },
    },
    UserProfileAdmin: {
      user: (userProfile, args, context) =>
        userResolvers.Query.user(userProfile, args, context),
      analytics: async (userProfile, args, context) => {
        const analytics = await orderResolvers.Query.orderAnalytics(
          userProfile,
          {
            query: {
              userId: userProfile.userId,
              startDate: null,
              endDate: null,
              types: [AnalyticsTypeEnum.UserAnalytics],
            },
          },
          context
        );

        return analytics[0];
      },
    },
    Register: {
      userProfile: ({ user }, args, context) =>
        userProfileResolvers.Query.userProfile(
          user,
          { userId: user?._id },
          context
        ),
    },
    ...resolvers,
  },
  typeDefs: schema,
});
