import ISalesReport from "./ISalesReport";

export enum TaskTypes {
  SendOrderQrCodeEmail = 'SendOrderQrCodeEmail',
  UpdateWebFlowEvent = 'UpdateWebFlowEvent',
  TicketOnDayofEvent = 'TicketOnDayofEvent',
  SalesReport = 'SalesReport',
  NotifyEvent = "NotifyEvent"
}

export default interface ITask {
  _id?: string;
  taskType: TaskTypes;
  createdAt?: number;
  executeAt: number;
  startedAt?: number;
  endedAt?: number;
  success?: boolean;
  canceledAt?: number;
  userId?: string;
  orgId?: string;
  eventId?: string;
  orderId?: string;
  venueIds?: string[];
  artistIds?: string[];
  subscription?: ISalesReport;
  email?: string
}

