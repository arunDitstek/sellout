import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import Joi from '@hapi/joi';
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import PbAsyncMessageHandler from '@sellout/service/.dist/PbAsyncMessageHandler';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import { Task } from './Task';
import TaskStore from './TaskStore';
import ITask, { TaskTypes } from '@sellout/models/.dist/interfaces/ITask';
import Tracer from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';
import IOrder from '@sellout/models/.dist/interfaces/IOrder';
import { Frequency } from '@sellout/models/.dist/interfaces/ISalesReport';
import * as moment from 'moment';
import { convertToPdf } from './saleReport';
import { EMBED_URL } from './env'

const tracer = new Tracer('TaskService');
function streamToBuffer(stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on("error", reject);
    stream.on("data", (data) => buffers.push(data));
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
}

// The number of seconds to wait before
// updating an event in webflow.
// This timeout is reset everytime an
// eventUpdated broadcast is received.
const PUBLISH_WEBFLOW_EVENT_TIMEOUT = 15;

export default class TaskService extends BaseService {

  public proxy: IServiceProxy;
  public interval: NodeJS.Timer;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
    this.interval;
  }
  public static main() {
    const serviceName = pb.TaskService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new TaskService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new TaskStore(Task),
    });
    service.run();
  }
  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on('connect', () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
    this.interval = setInterval(() => {
      this.logger.info(`Checking for tasks at ${new Date(Date.now())} -- ${Time.now()}`);
      this.executeCurrentTasks();
      // this.executeSalesReportTasks();
    }, 10000);
    // }, Time.MINUTE * 1);

  }
  public register() {
    this.connectionMgr.subscribe(this.serviceName, 'api', {
      /**
       * Incoming Message Handlers
       */
      createTask: new PbMessageHandler(
        this.createTask,
        pb.CreateTaskRequest,
        pb.CreateTaskResponse,
      ),
      deleteTask: new PbMessageHandler(
        this.deleteTask,
        pb.DeleteTaskRequest,
        pb.DeleteTaskResponse,
      )
    });

    this.connectionMgr.subscribeBroadcast(this.serviceName, {
      eventPublished: new PbAsyncMessageHandler(
        this.eventPublished,
        pb.Broadcast.EventPublishedNotification,
      ),
      eventUpdated: new PbAsyncMessageHandler(
        this.eventUpdated,
        pb.Broadcast.EventUpdatedNotification,
      ),
      orderCreated: new PbAsyncMessageHandler(
        this.orderCreated,
        pb.Broadcast.OrderCreatedNotification,
      ),
      orderRefunded: new PbAsyncMessageHandler(
        this.orderRefunded,
        pb.Broadcast.OrderRefundedNotification,
      ),
      ticketOnDayofEvent: new PbAsyncMessageHandler(
        this.ticketOnDayofEvent,
        pb.Broadcast.ticketOnDayofEvent,
      ),
    });
  }

  /****************************************************************************************
  * Task Creation
  ****************************************************************************************/

  public createTask = async (request: pb.CreateTaskRequest): Promise<pb.CreateTaskResponse> => {
    const span = tracer.startSpan('createTask', request.spanContext);
    const response: pb.CreateTaskResponse = pb.CreateTaskResponse.create();

    /**
     * Validate the task parameters
     */
    const schema = Joi.object().keys({
      taskType: Joi.string().required(),
      executeAt: Joi.number().required(),
      userId: Joi.string(),
      orgId: Joi.string(),
      eventId: Joi.string(),
      orderId: Joi.string(),
      venueIds: Joi.array(),
      artistIds: Joi.array(),
      subscription: Joi.object().keys({
        _id: Joi.string().optional().default(""),
        email: Joi.string().optional().default(""),
        frequency: Joi.string().optional().default("")
      }),
      email: Joi.string().optional().default("")
    });

    const params = schema.validate(request.task[0]);

    if (params.error) {
      this.logger.error(`createTask - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { taskType, executeAt, userId, orgId, eventId, orderId, venueIds, artistIds, subscription, email } = params.value;
    /**
     * Save the Task to storage
     */
    const attributes: ITask = {
      taskType,
      executeAt,
      createdAt: Time.now(),
      userId,
      orgId,
      eventId,
      orderId,
      artistIds,
      venueIds,
      subscription,
      email
    };

    try {
      await this.storage.createTask(span, attributes);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`createTask - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to create task.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public deleteTask = async (request: pb.DeleteTaskRequest): Promise<pb.DeleteTaskResponse> => {
    const span = tracer.startSpan('deleteSubscription', request.spanContext);
    const response: pb.DeleteTaskResponse = pb.DeleteTaskResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().required(),
      subscriptionId: Joi.string().required(),
      startedAt: Joi.string().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`deleteTask - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { eventId, subscriptionId } = params.value;

    try {
      const query = {
        eventId,
        taskType: TaskTypes.SalesReport,
        "subscription._id": subscriptionId,
        startedAt: null
      };
      let deleteTask;
      try {
        deleteTask = await this.storage.deleteTask(query);
        response.status = pb.StatusCode.OK;
        response.task = pb.Task.fromObject(deleteTask);
      } catch (e) {
        this.logger.error(`deleteTask - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Subscription deletion was unsuccessful. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }


    } catch (e) {
      this.logger.error(`deleteTask - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  /****************************************************************************************
  * Broadcast Listeners
  ****************************************************************************************/

  public eventPublished = async (request: pb.Broadcast.EventPublishedNotification): Promise<void> => {
    const span = tracer.startSpan('eventUpdated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`eventPublished - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, eventId } = params.value;

    const findEventRequest = pb.FindEventByIdRequest.create({
      spanContext: span.context().toString(),
      eventId,
    });

    let findEventResponse: pb.FindEventByIdResponse;

    try {
      findEventResponse = await this.proxy.eventService.findEventById(findEventRequest);

      if (!findEventResponse.event) {
        throw new Error('Event ${eventId} does not exist.');
      }

    } catch (e) {
      this.logger.error(`eventPublished - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    const { event } = findEventResponse;

    const { schedule: { announceAt, ticketsAt, ticketsEndAt, startsAt, endsAt } } = event;
    const now = Time.now();
    const updateTimes = [announceAt, ticketsAt, ticketsEndAt, startsAt, endsAt].filter(time => time > now);
    try {
      await Promise.all(updateTimes.map(async time => {
        const updateEventRequest = pb.CreateTaskRequest.create({
          spanContext: span.context().toString(),
          task: {
            orgId,
            eventId,
            taskType: TaskTypes.UpdateWebFlowEvent,
            executeAt: time + 1,
          },
        });
        return await this.createTask(updateEventRequest);
      }));
    } catch (e) {
      this.logger.error(`eventPublished - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    span.finish();
    return;
  }

  public eventUpdated = async (request: pb.Broadcast.EventUpdatedNotification): Promise<void> => {
    const span = tracer.startSpan('eventUpdated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`eventUpdated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, eventId } = params.value;


    let task: ITask;

    try {
      const query = {
        orgId,
        eventId,
        taskType: TaskTypes.UpdateWebFlowEvent,
        startedAt: null,
      };

      task = await this.storage.findBy(span, query);
    } catch (e) {
      this.logger.error(`eventUpdated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    if (task) {
      try {
        await this.storage.updateTask(span, task._id, { executeAt: Time.now() + PUBLISH_WEBFLOW_EVENT_TIMEOUT });
      } catch (e) {
        this.logger.error(`eventUpdated - error: ${e.message}`);
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return;
      }
    } else {
      const createTaskRequest = pb.CreateTaskRequest.create({
        spanContext: span.context().toString(),
        task: {
          orgId,
          eventId,
          taskType: TaskTypes.UpdateWebFlowEvent,
          executeAt: Time.now() + PUBLISH_WEBFLOW_EVENT_TIMEOUT,
        },
      });

      try {
        await this.createTask(createTaskRequest);
      } catch (e) {
        this.logger.error(`eventUpdated - error: ${e.message}`);
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return;
      }
    }

    span.finish();
    return;
  }

  public orderCreated = async (request: pb.Broadcast.OrderCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('orderCreated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      order: Joi.object(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`orderCreated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { order }: { order: IOrder } = params.value;

    const {
      _id: orderId,
      eventId,
      userId,
      orgId
    } = order;

    const findEventRequest = pb.FindEventByIdRequest.create({
      spanContext: span.context().toString(),
      eventId,
    });

    let findEventResponse: pb.FindEventByIdResponse;

    try {

      findEventResponse = await this.proxy.eventService.findEventById(findEventRequest);

      if (!findEventResponse.event) {
        throw new Error('Event ${eventId} does not exist.');
      }

    } catch (e) {
      this.logger.error(`orderCreated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }


    const { event } = findEventResponse;
    const qrCodeEmailAt = EventUtil.qrCodeEmailAt(event);

    // Don't create a task if the QR Code has already been sent
    if (qrCodeEmailAt <= Time.now()) {
      span.finish();
      return;
    }

    let venueIds = [event.venueId];
    let artistIds = [];

    event.performances.forEach(p => {
      artistIds = artistIds
        .concat(p.headliningArtistIds)
        .concat(p.openingArtistIds);

      venueIds = venueIds.concat(p.venueStageId);
    });

    // remove duplicates from arrays
    venueIds = [...new Set(venueIds)];
    artistIds = [...new Set(artistIds)];

    // remove falsey values
    venueIds = venueIds.filter(v => !!v);
    artistIds = artistIds.filter(a => !!a);

    const attributes: ITask = {
      taskType: TaskTypes.SendOrderQrCodeEmail,
      executeAt: qrCodeEmailAt,
      createdAt: Time.now(),
      orderId,
      userId,
      eventId,
      orgId,
      artistIds,
      venueIds,
    };

    try {
      await this.storage.createTask(span, attributes);
    } catch (e) {
      this.logger.error(`orderCreated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    span.finish();
    return;
  }

  public orderRefunded = async (request: pb.Broadcast.OrderRefundedNotification): Promise<void> => {
    const span = tracer.startSpan('orderRefunded', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      userId: Joi.string().required(),
      order: Joi.object(),
      orderId: Joi.string().required(),
      eventId: Joi.string().required(),
      venueIds: Joi.array().optional().default([]),
      artistIds: Joi.array().optional().default([]),
      refundAmount: Joi.number().required(),
      totalRefundedAmount: Joi.number().required(),
      isFullyRefunded: Joi.boolean().required(),
      isFullyCanceled: Joi.boolean().required(),
      refundedTickets: Joi.array().optional().default([]),
      refundedUpgrades: Joi.array().optional().default([]),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`orderRefunded - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, orderId, isFullyCanceled } = params.value;


    // If all the tickets and upgrades
    // have not been canceled
    // then the order is still active
    // and the user should recieve the QR code
    // before show time
    if (!isFullyCanceled) {
      span.finish();
      return;
    }

    let task: ITask;

    try {
      const spanContext = span.context().toString();
      const query = { orgId, orderId, taskType: TaskTypes.SendOrderQrCodeEmail };
      task = await this.storage.findBy(spanContext, query);

      if (!task) {
        throw new Error(`Task with orderId ${orderId} does not exist and cannot be canceled`);
      }

      if (task.startedAt) {
        throw new Error(`Task ${task._id} has already started and cannot be canceled`);
      }

      if (task.canceledAt) {
        throw new Error(`Task ${task._id} has already been canceled.`);
      }

    } catch (e) {
      this.logger.error(`orderRefunded - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    try {
      await this.storage.cancelTask(span.context().toString(), task._id);
    } catch (e) {
      this.logger.error(`orderRefunded - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    span.finish();
    return;
  }

  /****************************************************************************************
  * Task Execution
  ****************************************************************************************/

  private executeCurrentTasks = async (): Promise<void> => {
    const span = tracer.startSpan('executeCurrentTasks');

    let tasks: ITask[];
    try {
      tasks = await this.storage.executeTasks(span, Time.now());
    } catch (e) {
      this.logger.error(`executeCurrentTasks - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    if (!tasks || tasks.length === 0) return;

    const taskPromises = tasks.map(async task => {
      this.logger.info(`Running task ${task._id} of type ${task.taskType}`);
      const spanContext = span.context().toString();

      switch (task.taskType) {
        case TaskTypes.SendOrderQrCodeEmail:
          return this.sendOrderQRCodeEmail(spanContext, task);

        case TaskTypes.UpdateWebFlowEvent:
          return this.updateWebFlowEvent(spanContext, task);

        case TaskTypes.TicketOnDayofEvent:
          return this.ticketOnDayofEvent(spanContext, task);

        case TaskTypes.SalesReport:
          return this.salesReport(spanContext, task);
        case TaskTypes.NotifyEvent:
          return this.notifyEvent(spanContext, task);
        default:
          this.logger.info(`Invalid Task Type: ${task.taskType}.`);
          return null;
      }
    });

    const results = await Promise.all(taskPromises.filter(t => t));

    results.forEach(async task => {
      this.logger.info(`Task ${task._id} complete -- STATUS: ${task.success ? 'SUCCESSFUL' : 'FAILED'}`);

      try {
        await this.storage.updateTask(span, task._id, task);
      } catch (e) {
        this.logger.error(`executeCurrentTasks - error: ${e.message}`);
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return;
      }
    });

  }

  /****************************************************************************************
  * Task Executors
  ****************************************************************************************/

  private sendOrderQRCodeEmail = async (spanContext: string, task: ITask): Promise<ITask> => {
    const span = tracer.startSpan('sendOrderQRCodeEmail', spanContext);
    const request = pb.SendOrderQRCodeEmailRequest.create({
      spanContext,
      orderId: task.orderId,
    });

    try {
      await this.proxy.orderService.sendOrderQRCodeEmail(request);
    } catch (e) {
      this.logger.error(`sendOrderQrCodeEmail - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    // Optimistic
    task.success = true;
    task.endedAt = Time.now();

    span.finish();
    return task;
  }

  private updateWebFlowEvent = async (spanContext: string, task: ITask): Promise<ITask> => {
    const span = tracer.startSpan('updateWebFlowEvent', spanContext);
    const request = pb.UpdateWebFlowEventRequest.create({
      spanContext,
      orgId: task.orgId,
      eventId: task.eventId,
    });

    let response: pb.UpdateWebFlowEventResponse;

    try {
      response = await this.proxy.webFlowService.updateWebFlowEvent(request);
    } catch (e) {
      this.logger.error(`updateWebFlowEvent - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    task.success = response.status === pb.StatusCode.OK;
    task.endedAt = Time.now();

    span.finish();
    return task;
  }


  /***********************************************
   * Send QR code on the day of event
   **********************************************/

  public ticketOnDayofEvent = async (spanContext: string, task: ITask): Promise<ITask> => {
    const span = tracer.startSpan('ticketOnDayofEvent', spanContext);
    const request = pb.SendOrderQRCodeEmailRequest.create({
      spanContext,
      orderId: task.orderId,
    });

    try {
      await this.proxy.orderService.orderQRCodeEmailOnDay(request);
    } catch (e) {
      this.logger.error(`ticketOnDayofEvent - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    // Optimistic
    task.success = true;
    task.endedAt = Time.now();

    span.finish();
    return task;
  }


  public salesReport = async (spanContext: string, task: ITask): Promise<ITask> => {
    const span = tracer.startSpan('salesReport', spanContext);
    const request = pb.SalesReportRequest.create({
      spanContext,
      eventId: task.eventId,

    });

    const request1 = new pb.QueryOrdersRequest.create({
      spanContext,
      orgId: task.orgId,
      query: { eventIds: [task.eventId] },
    });

    let response1: pb.QueryOrdersResponse;
    try {
      response1 = await this.proxy.orderService.queryOrders(request1);
    } catch (e) {

      throw e;
    }



    let event;
    try {
      event = await this.proxy.eventService.findEventById(request);

      const venueRequest = new pb.FindVenueByIdRequest.create({
        spanContext: spanContext,
        venueId: event.event.venueId
      });


      let venue: pb.FindVenueByIdResponse;
      try {
        venue = await this.proxy.venueService.findVenueById(venueRequest)

      } catch (e) {
        throw e;
      }

      const feeRequest = new pb.ListEventFeesRequest.create({
        spanContext,
        orgId: task.orgId,
        eventId: task.eventId,
      });

      let fee: pb.ListEventFeesResponse;
      try {
        fee = await this.proxy.feeService.listEventFees(feeRequest);
      } catch (e) {
        throw e;
      }

      const organizationRequest = new pb.FindOrganizationRequest.create({
        spanContext: spanContext,
        orgId: event.event.orgId
      });

      let organization: pb.FindOrganizationResponse;
      try {
        organization = await this.proxy.organizationService.findOrganization(organizationRequest);
      } catch (e) {
        throw e;
      }

      async function generateSalesReport(
        response1, event, venue, organization, fee
      ): Promise<Buffer> {
        const stream = await convertToPdf(response1, event, venue, organization, fee)
        return await streamToBuffer(stream);
      }
      const salesreport = await generateSalesReport(response1 as any, event as any, venue as any, organization as any, fee as any);

      const file = {
        file: salesreport,
        filename: "salesreport.pdf",
        mimetype: "application/pdf",
        encoding: "utf8",
      };

      const uploadFileRequest = pb.UploadFileRequest.create({
        spanContext: span.context().toString(),
        orgId: task.orgId,
        files: [file],
        // Gzipping must be turned off for QR codes
        // otherise Plivo MMS will not work
        gzip: false,
      });
      let uploadFileResponse: pb.UploadFileResponse;
      try {
        uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
          uploadFileRequest
        );
      } catch (e) {
        this.logger.error(e);
        throw e;
      }

      const { url } = uploadFileResponse.files[0];
      let currentDate = Time.now();
      let endDate = event?.event?.schedule?.endsAt;
      let executeAt = task.executeAt;
      if (task.subscription.frequency == Frequency.Daily) {
        if (currentDate < endDate) {
          executeAt = executeAt + 1 * 24 * 60 * 60;

          const createTaskRequest = pb.CreateTaskRequest.create({
            spanContext: span.context().toString(),
            task: [
              {
                eventId: task.eventId,
                taskType: TaskTypes.SalesReport,
                executeAt: executeAt,
                orgId: task.orgId,
                subscription: task.subscription
              },
            ],
          });

          try {
            this.createTask(createTaskRequest);
          } catch (e) {
            this.logger.error(
              `Task salesReport service - error 9 - eventId: ${task.eventId}: ${e.message}`
            );
            span.setTag("error", true);
            span.log({ errors: e.message });
            span.finish();
          }

        } else {
        }
      } else {
        const start = moment.unix(currentDate);
        const end = moment.unix(endDate);
        const result = end.diff(start, 'day');
        if (result > 7) {
          executeAt = task.executeAt + 7 * 24 * 60 * 60;
          const createTaskRequest = pb.CreateTaskRequest.create({
            spanContext: span.context().toString(),
            task: [
              {
                eventId: task.eventId,
                taskType: TaskTypes.SalesReport,
                executeAt: executeAt,
                orgId: task.orgId,
                subscription: task.subscription
              },
            ],
          });

          try {
            this.createTask(createTaskRequest);
          } catch (e) {
            this.logger.error(
              `Task salesReport service - error 9 - eventId: ${task.eventId}: ${e.message}`
            );
            span.setTag("error", true);
            span.log({ errors: e.message });
            span.finish();
          }

        } else if (result <= 7 && result >= 0 && currentDate < endDate) {
          const createTaskRequest = pb.CreateTaskRequest.create({
            spanContext: span.context().toString(),
            task: [
              {
                eventId: task.eventId,
                taskType: TaskTypes.SalesReport,
                executeAt: endDate,
                orgId: task.orgId,
                subscription: task.subscription,
              },
            ],
          });

          const createLastTaskRequest = pb.CreateTaskRequest.create({
            spanContext: span.context().toString(),
            task: [
              {
                eventId: task.eventId,
                taskType: TaskTypes.SalesReport,
                executeAt: endDate + 1 * 24 * 60 * 60,
                orgId: task.orgId,
                subscription: task.subscription,
              },
            ],
          });

          try {
            this.createTask(createTaskRequest);
            this.createTask(createLastTaskRequest);
          } catch (e) {
            this.logger.error(
              `Task salesReport service - error 9 - eventId: ${task.eventId}: ${e.message}`
            );
            span.setTag("error", true);
            span.log({ errors: e.message });
            span.finish();
          }


        }
      }

      const sendSalesReportEmailRequest =
        pb.salesReportEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: task.subscription.email,
          orgName: "Yogesh Org",
          pdf: url
        });

      try {

        let salesReportEmail1 = await this.proxy.emailService.salesReportEmail(
          sendSalesReportEmailRequest
        );

        console.log("salesReportEmail1", salesReportEmail1)
      } catch (e) {
        this.logger.error(`salesReportEmail - error: ${e.message}`);

        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        // return response;
      }

    } catch (e) {
      this.logger.error(`salesReport - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    task.endedAt = Time.now();
    span.finish();
    return task;
  }

  public notifyEvent = async (spanContext: string, task: ITask): Promise<ITask> => {
    const span = tracer.startSpan('notifyEvent', spanContext);
    const request = pb.NotifyMeReportRequest.create({
      spanContext,
      eventId: task.eventId,
    });
    let event;
    try {
      event = await this.proxy.eventService.findEventById(request);
      const venueRequest = new pb.FindVenueByIdRequest.create({
        spanContext: spanContext,
        venueId: event.event.venueId
      });

      let venue: pb.FindVenueByIdResponse;
      try {
        venue = await this.proxy.venueService.findVenueById(venueRequest)
      } catch (e) {
        throw e;
      }
      const venueAddress1 = `${venue.venue.address.address1} ${venue.venue.address.address2}`;
      const venueAddress2 = `${venue.venue.address.city}, ${venue.venue?.address.state} ${venue.venue?.address.zip}`;
      const timezone =
        venue.venue && venue.venue?.address && venue.venue.address.timezone
          ? venue.venue?.address.timezone
          : "America/Denver";

          const performanceSchedules = event.event?.performances.reduce(
            (cur, next) => {
              if (next.schedule.length == 1) {
                cur.doorsAt.push(next.schedule[0].doorsAt);
                cur.startsAt.push(next.schedule[0].startsAt);
                cur.endsAt.push(next.schedule[0].endsAt);
              } else {
                next.schedule.map((sdl) => {
                  cur.doorsAt.push(sdl.doorsAt);
                  cur.startsAt.push(sdl.startsAt);
                  cur.endsAt.push(sdl.endsAt);
                });
              }
              return cur;
            },
            {
              doorsAt: [],
              startsAt: [],
              endsAt: [],
            }
          );
          let dayIds = [];
          let dayIdsTime = [];
          // let dayIdsTimeCalendar = [];
          const perfomancesArray = performanceSchedules.startsAt.map(
            (date, index) => {
              return {
                startsAt: date,
                endsAt: performanceSchedules.endsAt[index],
                doorsAt: performanceSchedules.doorsAt[index],
              };
            }
          );
          dayIdsTime = perfomancesArray.filter(
            (start, index) => !dayIds.includes(start.startsAt)
          );
        const doorsAt = Math.min(...performanceSchedules?.doorsAt);
        const startsAt = Math.min(...performanceSchedules?.startsAt);

      const cityState = `${venue.venue?.address.city}, ${venue.venue.address.state}`;
      let description = `You have Notify for ${event.event?.name}.`
      const sendNotifyMeEmailRequest =
        pb.QueueOrderQRCodeEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: task.email,
          eventId: task.eventId,
          orgName: "",
          url: `${EMBED_URL}/?eventId=${task.eventId}`,
          eventName: event.event?.name,
          eventSubtitle: event.event.subtitle,
          venueName: venue.venue.name,
          eventPosterImageUrl: event.event.posterImageUrl,
          cityState,
          venueAddress1,
          venueAddress2,
          timezone,
          ticketDeliveryType: event.ticketDeliveryType,
          physicalDeliveryInstructions: event.physicalDeliveryInstructions,
          description,
          venuePosterImageUrl: venue.venue.imageUrls[0],
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          dayIdsTime,
        });
      try {
        await this.proxy.emailService.notifyEmail(
          sendNotifyMeEmailRequest
        );
      } catch (e) {
        this.logger.error(`notifyMeEmail - error: ${e.message}`);
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        // return response;
      }

    } catch (e) {
      this.logger.error(`notifyMeEmail - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    task.endedAt = Time.now();
    span.finish();
    return task;
  }

}
