export default interface IPagination {
  pageSize: number;
  pageNumber: number;
}

export enum PaginationTypes {
  Orders = "Orders",
  EventWaitList = "EventWaitList",
  EventOrders = "EventOrders",
  CustomerOrders = "CustomerOrders",
  Events = "Events",
  Artists = "Artists",
  Venues = "Venues",
  PlateformSettings = "PlateformSettings",
  OrganizationSettings = "OrganizationSettings",
  EventSettings = "EventSettings",
  Customers = "Customers",
  Organizations = "Organizations",
}

export type PaginationMap = Map<PaginationTypes, IPagination>;
