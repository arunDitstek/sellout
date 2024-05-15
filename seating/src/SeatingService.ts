import * as pb from "@sellout/models/.dist/sellout-proto";
import * as Time from "@sellout/utils/.dist/time";
import Joi from "@hapi/joi";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from "@sellout/service/.dist/ConsoleLogManager";
import NatsConnectionManager from "@sellout/service/.dist/NatsConnectionManager";
import PbMessageHandler from "@sellout/service/.dist/PbMessageHandler";
import PbAsyncMessageHandler from "@sellout/service/.dist/PbAsyncMessageHandler";
import joiToErrors from "@sellout/service/.dist/joiToErrors";
import { Seating } from "./Seating";
import SeatingStore from "./SeatingStore";
import ISeating from "@sellout/models/.dist/interfaces/ISeating";
import Tracer from "@sellout/service/.dist/Tracer";
import { IServiceProxy, proxyProvider } from "./proxyProvider";
import { NATS_URL, SEATS_IO_SECRET_KEY } from "./env";
import { SeatsioClient, Region } from "seatsio";

const tracer = new Tracer("SeatingService");

export default class SeatingService extends BaseService {
  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }

  public static main() {
    const serviceName = pb.SeatingService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new SeatingService({
      serviceName,
      connectionMgr: new NatsConnectionManager(
        [<string>NATS_URL],
        logger,
        true
      ),
      logManager: logger,
      storageManager: new SeatingStore(Seating),
    });
    service.run();
  }

  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on("connect", () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }

  public register() {
    this.connectionMgr.subscribe(this.serviceName, "api", {
      /**
       * Incoming Message Handlers
       */
      createSeating: new PbMessageHandler(
        this.createSeating,
        pb.CreateSeatingRequest,
        pb.CreateSeatingResponse
      ),
      bookSeasonSeats: new PbMessageHandler(
        this.bookSeasonSeats,
        pb.BookSeasonSeatsRequest,
        pb.BookSeasonSeatsResponse
      ),
      bookSeats: new PbMessageHandler(
        this.bookSeats,
        pb.BookSeatsRequest,
        pb.BookSeatsResponse
      ),
      releaseSeats: new PbMessageHandler(
        this.releaseSeats,
        pb.ReleaseSeatsRequest,
        pb.ReleaseSeatsResponse
      ),
      findOrganizationSeating: new PbMessageHandler(
        this.findOrganizationSeating,
        pb.FindOrganizationSeatingRequest,
        pb.FindOrganizationSeatingResponse
      ),
    });

    this.connectionMgr.subscribeBroadcast(this.serviceName, {
      // Organization
      organizationCreated: new PbAsyncMessageHandler(
        this.organizationCreated,
        pb.Broadcast.OrganizationCreatedNotification
      ),
    });
  }

  private client(secretKey = null) {
    return new SeatsioClient(Region.EU(), secretKey || SEATS_IO_SECRET_KEY);
    // return new SeatsioClient(secretKey || SEATS_IO_SECRET_KEY);
  }

  public createSeating = async (
    request: pb.CreateSeatingRequest
  ): Promise<pb.CreateSeatingResponse> => {
    const span = tracer.startSpan("createSeating", request.spanContext);
    const response: pb.CreateSeatingResponse =
      pb.CreateSeatingResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `createSeating - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId } = params.value;

    let publicKey, secretKey, designerKey;
    try {
      const seatsio = this.client();
      const res = await seatsio.subaccounts.create(orgId);
      publicKey = res.publicKey;
      secretKey = res.secretKey;
      designerKey = res.designerKey;
    } catch (e) {
      this.logger.error(`createSeating - error: ${e}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to create seating sub account.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e });
      span.finish();
      return response;
    }

    const createdAt = Time.now();
    const attributes: ISeating = {
      orgId,
      createdAt,
      publicKey,
      secretKey,
      designerKey,
      updatedAt: createdAt,
    };

    let seating: ISeating;
    try {
      seating = await this.storage.createSeating(span, attributes);
      response.status = pb.StatusCode.OK;
      response.seating = pb.Seating.fromObject(seating);
    } catch (e) {
      this.logger.error(`createSeating - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to save seating configuration.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public bookSeats = async (
    request: pb.BookSeatsRequest
  ): Promise<pb.BookSeatsResponse> => {
    const span = tracer.startSpan("bookSeats", request.spanContext);
    const response: pb.BookSeatsResponse = pb.BookSeatsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      holdToken: Joi.string().required(),
      seats: Joi.array().items(Joi.string()).required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`bookSeats - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId, holdToken, seats } = params.value;

    let seating: ISeating;
    try {
      seating = await this.storage.findOrganizationSeating(span, orgId);
      if (!Boolean(seating)) {
        throw new Error(
          "Could not find seating configuration for this organization"
        );
      }
    } catch (e) {
      this.logger.error(`bookSeats - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    try {
      const seatsio = this.client(seating.secretKey);
      const seatingId = EventUtil.seatingId({ _id: eventId });
      await seatsio.events.book(seatingId, seats, holdToken);
      // if (eventSeatBooking?.objects) {
      //   const bookedSeats = seats.map(seat => {
      //     return {
      //       seat: seat,
      //       status: eventSeatBooking?.objects[seat]?.status || ""
      //     }
      //   })
      //   const allBooked = bookedSeats.every(seat => seat.status === "booked");
      //   if (!allBooked) {
      //     const nonBooked = bookedSeats.filter(seat => seat.status != 'booked');
      //     const releaseSeatsRequest = pb.ReleaseSeatsRequest.create({
      //       spanContext: span.context().toString(),
      //       orgId,
      //       eventId,
      //       seats: nonBooked.map(seat => seat.seat),
      //     });
      //     try {
      //       await this.releaseSeats(releaseSeatsRequest);
      //     } catch (e) {
      //       // this.logger.error(`bookSeats Seating Error - error: ${e.message}`);
      //       // span.setTag("error", true);
      //       // span.log({ errors: e.message });
      //     }

      //     this.logger.error(`bookSeats - error: ${JSON.stringify(nonBooked)}`);
      //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      //     response.errors = [
      //       pb.Error.create({
      //         key: "Error",
      //         message:
      //           "One or more of the selected seats is already taken. Please select a different seat.",
      //       }),
      //     ];
      //     span.setTag("error", true);
      //     span.log({ errors: nonBooked });
      //     span.finish();
      //     return response;
      //   }
      // }

    } catch (e) {
      this.logger.error(`bookSeats - error: ${JSON.stringify(e)}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message:
            "One or more of the selected seats is already taken. Please select a different seat.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public bookSeasonSeats = async (
    request: pb.BookSeasonSeatsRequest
  ): Promise<pb.BookSeasonSeatsResponse> => {
    const span = tracer.startSpan("bookSeasonSeats", request.spanContext);
    const response: pb.BookSeasonSeatsResponse =
      pb.BookSeasonSeatsResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      seasonId: Joi.string().required(),
      holdToken: Joi.string().required(),
      seats: Joi.array().items(Joi.string()).required(),
      // eventIds: Joi.array(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `bookSeasonSeats - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, seasonId, holdToken, seats } = params.value;

    let seating: ISeating;
    try {
      seating = await this.storage.findOrganizationSeating(span, orgId);
      if (!Boolean(seating)) {
        throw new Error(
          "Could not find seating configuration for this organization"
        );
      }
    } catch (e) {
      this.logger.error(`bookSeasonSeats - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    try {
      const seatsio = this.client(seating.secretKey);
      const seatingId = EventUtil.seatingId({ _id: seasonId });
      const seasonSeatBooking = await seatsio.events.book(seatingId, seats, holdToken);
      if (seasonSeatBooking?.objects) {
        const bookedSeats = seats.map(seat => {
          return {
            seat: seat,
            status: seasonSeatBooking?.objects[seat]?.status || ""
          }
        })
        const allBooked = bookedSeats.every(seat => seat.status === "booked");
        if (!allBooked) {
          const nonBooked = bookedSeats.filter(seat => seat.status != 'booked');
          const releaseSeatsRequest = pb.ReleaseSeatsRequest.create({
            spanContext: span.context().toString(),
            orgId,
            eventId: seasonId,
            seats: nonBooked.map(seat => seat.seat),
          });
          try {
            await this.releaseSeats(releaseSeatsRequest);
          } catch (e) {
            // this.logger.error(`bookSeats Seating Error - error: ${e.message}`);
            // span.setTag("error", true);
            // span.log({ errors: e.message });
          }

          this.logger.error(`bookSeasonSeats - error: ${JSON.stringify(nonBooked)}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message:
                "One or more of the selected seats is already taken. Please select a different seat.",
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: nonBooked });
          span.finish();
          return response;
        }
      }
    } catch (e) {
      this.logger.error(`bookSeasonSeats - error: ${JSON.stringify(e)}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message:
            "One or more of the selected seats is already taken. Please select a different seat.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public releaseSeats = async (
    request: pb.ReleaseSeatsRequest
  ): Promise<pb.ReleaseSeatsResponse> => {
    const span = tracer.startSpan("retrieveSeats", request.spanContext);
    const response: pb.ReleaseSeatsResponse = pb.ReleaseSeatsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      seats: Joi.array().items(Joi.string()).required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `releaseSeats - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId, seats } = params.value;

    let seating: ISeating;
    try {
      seating = await this.storage.findOrganizationSeating(span, orgId);
      if (!Boolean(seating)) {
        throw new Error(
          "Could not find seating configuration for this organization"
        );
      }
    } catch (e) {
      this.logger.error(`bookSeats - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    try {
      const seatsio = this.client(seating.secretKey);
      const seatingId = EventUtil.seatingId({ _id: eventId });
      await seatsio.events.release(seatingId, seats);
    } catch (e) {
      this.logger.error(`releaseSeats - error: ${JSON.stringify(e)}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  };

  public findOrganizationSeating = async (
    request: pb.FindOrganizationSeatingRequest
  ): Promise<pb.FindOrganizationSeatingResponse> => {
    const span = tracer.startSpan(
      "findOrganizationSeating",
      request.spanContext
    );
    const response: pb.FindOrganizationSeatingResponse =
      pb.FindOrganizationSeatingResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `findOrganizationSeating - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId } = params.value;

    let seating: ISeating;
    try {
      seating = await this.storage.findOrganizationSeating(span, orgId);
      response.status = pb.StatusCode.OK;
      response.seating = seating ? pb.Seating.fromObject(seating) : null;
    } catch (e) {
      this.logger.error(`findOrganizationSeating - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: "Failed to find organization seating configuration.",
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  };

  public organizationCreated = async (
    request: pb.Broadcast.OrganizationCreatedNotification
  ): Promise<void> => {
    const span = tracer.startSpan("organizationCreated", request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `organizationCreated - error: ${JSON.stringify(params.error)}`
      );
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId } = params.value;

    const createRequest = pb.CreateSeatingRequest.create({
      spanContext: span.context().toString(),
      orgId,
    });

    try {
      await this.createSeating(createRequest);
    } catch (e) {
      this.logger.error(
        `organizationCreated - error: ${JSON.stringify(e.message)}`
      );
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    span.finish();
    return;
  };
}
