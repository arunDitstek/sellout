import * as pb from '@sellout/models/.dist/sellout-proto';
import wait from '@sellout/utils/.dist/wait';
import * as Time from '@sellout/utils/.dist/time';
// import Joi from '@hapi/joi';
import BaseService from '@sellout/service/.dist/BaseService';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
// import joiToErrors  from '@sellout/service/.dist/joiToErrors';
// import Tracer  from '@sellout/service/.dist/Tracer';
import * as nodemailer from 'nodemailer';
import mjml from 'mjml';
import Handlebars, { compile } from 'handlebars';
import { readFileSync } from 'fs';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import {
  NATS_URL,
  SENDGRID_API_KEY,
  LOAD_TEST_ENABLED,
  DEBUG_ENABLED,
  DOMAIN_NAME
} from './env';
import * as fs from 'file-system';

Handlebars.registerHelper("if_eq", function (a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

Handlebars.registerHelper("hide_if_eq", function (a, b, opts) {
  if (a == b) {
    return "";
  } else {
    return a;
  }
});

export default class EmailService extends BaseService {

  private templateMapping = {
    // User
    userWelcomeEmail: 'templates/verify-email.mjml',
    userResetPassword: 'templates/user-reset-password-email.mjml',
    userAuthenticationCode: 'templates/user-authentication-code-email.mjml',
    // Organization
    inviteToOrganization: 'templates/invite-user-to-organization-email.mjml',
    // Order
    orderReceipt: 'templates/order-receipt.mjml',
    orderQRCode: 'templates/order-qr-code.mjml',
    seasonReceipt: 'templates/season-receipt.mjml',
    orderQRCodeOnDay: 'templates/order-qr-code-on-day.mjml',
    orderRefund: 'templates/order-refund-email.mjml',
    orderCanceled: 'templates/order-canceled-email.mjml',
    orderSheet: 'templates/order-sheet.mjml',
    customerSheet: 'templates/customer-sheet.mjml',
    updatedEmail: 'templates/updated-email.mjml',
    salesReport: 'templates/sales-report.mjml',
    waitList: 'templates/waitList.mjml',
    notifyMe: 'templates/notify-email.mjml',
    immediateNotifyMe:'templates/immediate-notify-email.mjml',
  };

  private templates = {};
  private mailer;

  constructor(opts) {
    super(opts);

    this.initialize();
  }
  public static main() {
    const serviceName = pb.EmailService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new EmailService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
    });
    service.run();
  }
  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on('connect', () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }
  public register() {
    this.connectionMgr.subscribe(this.serviceName, 'api', {
      /**
       * Incoming Message Handlers
       */

      // User
      queueUserWelcomeEmail: new PbMessageHandler(
        this.queueUserWelcomeEmail,
        pb.QueueUserWelcomeEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueUpdatedEmail: new PbMessageHandler(
        this.queueUpdatedEmail,
        pb.QueueUpdatedEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueUserResetPasswordEmail: new PbMessageHandler(
        this.queueUserResetPasswordEmail,
        pb.QueueUserResetPasswordEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueUserAuthenticationCodeEmail: new PbMessageHandler(
        this.queueUserAuthenticationCodeEmail,
        pb.QueueUserAuthenticationCodeEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueInviteToOrganizationEmailRequest: new PbMessageHandler(
        this.queueInviteToOrganizationEmailRequest,
        pb.QueueInviteToOrganizationEmailRequest,
        pb.google.protobuf.Empty,
      ),
      // Order
      queueOrderReceiptEmail: new PbMessageHandler(
        this.queueOrderReceiptEmail,
        pb.QueueOrderReceiptEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueOrderQRCodeEmail: new PbMessageHandler(
        this.queueOrderQRCodeEmail,
        pb.QueueOrderQRCodeEmailRequest,
        pb.google.protobuf.Empty,
      ), queueSeasonOrderReceiptEmail: new PbMessageHandler(
        this.queueSeasonOrderReceiptEmail,
        pb.QueueSeasonOrderReceiptEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueOrderRefundEmail: new PbMessageHandler(
        this.queueOrderRefundEmail,
        pb.QueueOrderRefundEmailRequest,
        pb.google.protobuf.Empty,
      ),
      queueOrderCanceledEmail: new PbMessageHandler(
        this.queueOrderCanceledEmail,
        pb.QueueOrderCanceledEmailRequest,
        pb.google.protobuf.Empty,
      ),
      orderSheetEmail: new PbMessageHandler(
        this.orderSheetEmail,
        pb.orderSheetEmailRequest,
        pb.google.protobuf.Empty,
      ),
      waitListEmail: new PbMessageHandler(
        this.waitListEmail,
        pb.QueueOrderQRCodeEmailRequest,
        pb.google.protobuf.Empty,
      ),
      orderQRCodeEmailOnDay: new PbMessageHandler(
        this.orderQRCodeEmailOnDay,
        pb.QueueOrderQRCodeEmailRequest,
        pb.google.protobuf.Empty,
      ),
      salesReportEmail: new PbMessageHandler(
        this.salesReportEmail,
        pb.salesReportEmailRequest,
        pb.google.protobuf.Empty,
      ),
      customerSheetEmail: new PbMessageHandler(
        this.customerSheetEmail,
        pb.customerSheetEmailRequest,
        pb.google.protobuf.Empty,
      ),
      notifyEmail: new PbMessageHandler(
        this.notifyEmail,
        pb.QueueOrderQRCodeEmailRequest,
        pb.google.protobuf.Empty,
      ),
      immediateNotifyEmail: new PbMessageHandler(
        this.immediateNotifyEmail,
        pb.QueueOrderQRCodeEmailRequest,
        pb.google.protobuf.Empty,
      ),
    });

  }
  private initialize() {
    this.loadTemplates();
    this.mailer = this.createTransport(
      nodemailerSendgrid({
        apiKey: SENDGRID_API_KEY,
      }),
    );
  }
  private createTransport(config) {
    const transport = nodemailer.createTransport(config);
    transport.verify((error, success) => {
      if (error) {
        console.error(error);
        process.exit(1);
      }
    });
    return transport;
  }
  private loadTemplates = async (): Promise<void> => {
    for (const tpl in this.templateMapping) {
      if (this.templateMapping.hasOwnProperty(tpl)) {
        const path = this.templateMapping[tpl];
        const raw = await readFileSync(path, 'utf8');
        const mjmlHtml = mjml(raw, {
          filePath: './includes',
        }).html;

        this.templates[tpl] = await compile(mjmlHtml);
      }
    }
  }
  public sendEmail = async (template: string, subject: string, toAddress: string, fromName: string = null, context: any): Promise<any> => {
    if (DEBUG_ENABLED) {
      this.logger.info(`Sending ${template} email to ${toAddress} with context ${JSON.stringify(context)}`);
    }

    if (LOAD_TEST_ENABLED) {
      return wait(50);
    }

    const markup = this.templates[template](context);
    const validEmailRegex = /[^-A-Za-z0-9!#$%&'*+/=?^_`{|}~\s]/;
    if (!fromName) fromName = 'Team Sellout';
    const needsEscaping = fromName.match(validEmailRegex);
    if (needsEscaping) fromName = `"${fromName}"`;
    const fromAddress = `${fromName} <hello@${DOMAIN_NAME}>`;
    const email = {
      subject,
      html: markup,
      to: toAddress,
      from: fromAddress,
      headers: { 'X-SES-CONFIGURATION-SET': 'sellout-default' },
    };

    try {
      return await this.mailer.sendMail(email);
    } catch (e) {
      throw e;
    }
  }


  public sendEmailWithFile = async (template: string, subject: string, toAddress: string, fromName: string = null, context: any, firstName: string = null): Promise<any> => {
    if (DEBUG_ENABLED) {
      this.logger.info(`Sending ${template} email to ${toAddress} with context ${JSON.stringify(context)}`);
    }

    if (LOAD_TEST_ENABLED) {
      return wait(50);
    }

    const markup = this.templates[template](context);
    const validEmailRegex = /[^-A-Za-z0-9!#$%&'*+/=?^_`{|}~\s]/;
    if (!fromName) fromName = 'Team Sellout';
    const needsEscaping = fromName.match(validEmailRegex);
    if (needsEscaping) fromName = `"${fromName}"`;
    const fromAddress = `${fromName} <hello@${DOMAIN_NAME}>`;
    let data = fs.readFileSync(__dirname + '/' + firstName + 'invitation.txt')
    const email = {
      subject,
      html: markup,
      to: toAddress,
      from: fromAddress,
      headers: { 'X-SES-CONFIGURATION-SET': 'sellout-default' },
      attachments: [
        {
          filename: `iCalendar.ics`,
          content: data,
          type: 'application/text',
          disposition: 'attachment'
        }
      ]
    };

    try {
      return await this.mailer.sendMail(email);
    } catch (e) {
      throw e;
    }

  }

  /****************************************************************************************
  * User
  ****************************************************************************************/

  public queueUserWelcomeEmail = async (request: pb.QueueUserWelcomeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'userWelcomeEmail',
      'Verify your email',
      request.toAddress,
      null,
      {
        firstName: request.firstName,
        lastName: request.lastName,
        redirectUrl: request.redirectUrl,
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }


  public queueUpdatedEmail = async (request: pb.QueueUpdatedEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'updatedEmail',
      'Updated email',
      request.toAddress,
      null,

      {
        firstName: request.firstName,
        lastName: request.lastName,
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
  public queueUserResetPasswordEmail = async (request: pb.QueueUserResetPasswordEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'userResetPassword',
      'Reset your password',
      request.toAddress,
      null,
      {
        resetPasswordUrl: request.resetPasswordUrl,
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
  public queueUserAuthenticationCodeEmail = async (request: pb.QueueUserAuthenticationCodeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'userAuthenticationCode',
      'Your Sellout authentication code',
      request.toAddress,
      null,
      {
        authCode: request.authCode,
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
  public queueInviteToOrganizationEmailRequest = async (request: pb.QueueInviteToOrganizationEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'inviteToOrganization',
      `Join ${request.orgName} on Sellout`,
      request.toAddress,
      null,
      {
        orgName: request.orgName,
        redirectUrl: request.redirectUrl,
        orgLogo: request.orgLogo,
        roleName: request.roleName,
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  /****************************************************************************************
  * Order
  ****************************************************************************************/
  public queueOrderReceiptEmail = async (request: pb.QueueOrderReceiptEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let data;
    if (request.dayIdsTime.length > 0) {
      data = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:1234\n"
      data += request.dayIdsTime.map(day => "BEGIN:VEVENT\nDTSTART;TZID=" + request.timezone + ":" + Time.format(day.startsAt, 'YYYYMMDDTHHmmss', request.timezone) + "\nDTEND;TZID=" + request.timezone + ":" + Time.format(day.endsAt, 'YYYYMMDDTHHmmss', request.timezone) + "\nSUMMARY:" + request.eventName + "\nLOCATION:" + request.venueAddress1 + " " + request.venueAddress1 + "\nEND:VEVENT".replace('Section', '')).filter(Boolean).join('\n');
      data += "\nEND:VCALENDAR"
      // data = `BEGIN:VCALENDARVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:adamgibbons/ics\nBEGIN:VEVENT\nUID:3c6d44e8-79a7-428d-acac-9586c9e06e5c\nSUMMARY:Lunch\nDTSTAMP:20180210T093900Z\nDTSTART:20180115T191500Z\nDURATION:PT45M\nEND:VEVENT\nBEGIN:VEVENT\nUID:253cc897-fc26-4f25-9a01-b6bb57fa174d\nSUMMARY:Dinner\nDTSTAMP:20180210T093900Z\nDTSTART:20180115T191500Z\nDURATION:PT1H30M\nEND:VEVENT\nEND:VCALENDAR`
    } else {
      data = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;TZID=" + request.timezone + ":" + Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone) + "\nDTEND;TZID=" + request.timezone + ":" + Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone) + "\nSUMMARY:" + request.eventName + "\nLOCATION:" + request.venueAddress1 + " " + request.venueAddress1 + "\nEND:VEVENT\nEND:VCALENDAR";
    }

    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    let dayIdsTimeCalendar = this.dateCommonFunForTimeChange(request.dayIdsTimeCalendar, request);
    fs.writeFileSync(__dirname + "/" + request.firstName + "invitation.txt", data);
    await this.sendEmailWithFile(
      'orderReceipt',
      `[TICKET CONFIRMATION] ${request.eventName} - ${request.eventDate}`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `${request.firstName}, here's your order confirmation for ${request.eventName}. Mark ${request.eventDate} on the calendar!`,
        firstName: request.firstName,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        eventStart: Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone),
        eventEnd: Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone),
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        qrCodeAt: request.qrCodeAt,
        confirmationCode: request.confirmationCode,
        orgEmail: request.orgEmail,
        orgPhoneNumber: request.orgPhoneNumber,
        orgAddress1: request.orgAddress1,
        orgAddress2: request.orgAddress2,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        orderSubtotal: request.orderSubtotal,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        orderType: request.isRSVP ? 'reservation' : 'order',
        tax: request.orderTax,
        dayIdsTime: dayIdsTime,
        dayIdsTimeCalendar,
        ticketDeliveryType: request.ticketDeliveryType,
        physicalDeliveryInstructions: request.physicalDeliveryInstructions,
        discount: request.discount

      },
      request.firstName
    );
    // await this.sendEmail(
    //   'orderQRCode',
    //   `[TICKET ARRIVAL] ${request.eventName} tickets`,
    //   request.toAddress,
    //   request.orgName,
    //   {
    //     preTextHeader: `${request.firstName}, here's your ticket for ${request.eventName}. We hope you have a blast!`,
    //     firstName: request.firstName,
    //     eventName: request.eventName,
    //     orgName: request.orgName,
    //     eventSubtitle: request.eventSubtitle,
    //     eventDate: request.eventDate,
    //     venueName: request.venueName,
    //     doorsAt: request.doorsAt,
    //     showAt: request.showAt,
    //     qrCodeAt: request.qrCodeAt,
    //     confirmationCode: request.confirmationCode,
    //     orgEmail: request.orgEmail,
    //     orgPhoneNumber: request.orgPhoneNumber,
    //     orgAddress1: request.orgAddress1,
    //     orgAddress2: request.orgAddress2,
    //     eventPosterImageUrl: request.eventPosterImageUrl,
    //     cityState: request.cityState,
    //     orgLogoUrl: request.orgLogoUrl,
    //     orderItems: request.orderItems,
    //     orderTotal: request.orderTotal,
    //     orderFees: request.orderFees,
    //     tax: request.orderTax,
    //     orderSubtotal: request.orderSubtotal,
    //     qrCodeUrl: request.qrCodeUrl,
    //     venuePosterImageUrl: request.venuePosterImageUrl,
    //     venueAddress1: request.venueAddress1,
    //     venueAddress2: request.venueAddress2,
    //     orderType: request.isRSVP ? 'reservation' : 'order',
    //   },
    // );
    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public queueSeasonOrderReceiptEmail = async (request: pb.QueueSeasonOrderReceiptEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let data;
    let events = []
    if (request.dayIdsTime.length > 0) {
      data = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:1234\n"
      data += request.dayIdsTime.map(day => "BEGIN:VEVENT\nDTSTART;TZID=" + request.timezone + ":" + Time.format(day.startsAt, 'YYYYMMDDTHHmmss', request.timezone) + "\nDTEND;TZID=" + request.timezone + ":" + Time.format(day.endsAt, 'YYYYMMDDTHHmmss', request.timezone) + "\nSUMMARY:" + request.eventName + "\nLOCATION:" + request.venueAddress1 + " " + request.venueAddress1 + "\nEND:VEVENT".replace('Section', '')).filter(Boolean).join('\n');
      data += "\nEND:VCALENDAR"
      // data = `BEGIN:VCALENDARVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:adamgibbons/ics\nBEGIN:VEVENT\nUID:3c6d44e8-79a7-428d-acac-9586c9e06e5c\nSUMMARY:Lunch\nDTSTAMP:20180210T093900Z\nDTSTART:20180115T191500Z\nDURATION:PT45M\nEND:VEVENT\nBEGIN:VEVENT\nUID:253cc897-fc26-4f25-9a01-b6bb57fa174d\nSUMMARY:Dinner\nDTSTAMP:20180210T093900Z\nDTSTART:20180115T191500Z\nDURATION:PT1H30M\nEND:VEVENT\nEND:VCALENDAR`
    } else {
      data = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;TZID=" + request.timezone + ":" + Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone) + "\nDTEND;TZID=" + request.timezone + ":" + Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone) + "\nSUMMARY:" + request.eventName + "\nLOCATION:" + request.venueAddress1 + " " + request.venueAddress1 + "\nEND:VEVENT\nEND:VCALENDAR";
    }

    for (let event of request.events) {
      let eventDateFormate = this.eventDateCommonFunForTimeChange(event.performances[0].schedule, event.name, request);
      events.push(eventDateFormate[0]);
    }

    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    let dayIdsTimeCalendar = this.dateCommonFunForTimeChange(request.dayIdsTimeCalendar, request);
    fs.writeFileSync(__dirname + "/" + request.firstName + "invitation.txt", data);
    await this.sendEmailWithFile(
      'seasonReceipt',
      `[TICKET ARRIVAL] ${request.eventName} tickets`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `${request.firstName}, here's your ticket for ${request.eventName}. We hope you have a blast!`,
        firstName: request.firstName,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        eventStart: Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone),
        eventEnd: Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone),
        eventOutlookStart: Time.formatToUTC(request.eventStart, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.eventEnd, 'YYYY-MM-DDTHH:mm:ss'),
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        qrCodeAt: request.qrCodeAt,
        confirmationCode: request.confirmationCode,
        orgEmail: request.orgEmail,
        orgPhoneNumber: request.orgPhoneNumber,
        orgAddress1: request.orgAddress1,
        orgAddress2: request.orgAddress2,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        tax: request.orderTax,
        orderSubtotal: request.orderSubtotal,
        qrCodeUrl: request.qrCodeUrl,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        orderType: request.isRSVP ? 'reservation' : 'order',
        dayIdsTime: dayIdsTime,
        dayIdsTimeCalendar,
        events: events,
        promoterFee: request.promoterFee,
        processingFee: request.processingFee,
        discount: request.discount

      },
      request.firstName
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public queueOrderQRCodeEmail = async (request: pb.QueueOrderQRCodeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let data;
    if (request.dayIdsTime.length > 0) {
      data = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:1234\n"
      data += request.dayIdsTime.map(day => "BEGIN:VEVENT\nDTSTART;TZID=" + request.timezone + ":" + Time.format(day.startsAt, 'YYYYMMDDTHHmmss', request.timezone) + "\nDTEND;TZID=" + request.timezone + ":" + Time.format(day.endsAt, 'YYYYMMDDTHHmmss', request.timezone) + "\nSUMMARY:" + request.eventName + "\nLOCATION:" + request.venueAddress1 + " " + request.venueAddress1 + "\nEND:VEVENT".replace('Section', '')).filter(Boolean).join('\n');
      data += "\nEND:VCALENDAR"
      // data = `BEGIN:VCALENDARVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:adamgibbons/ics\nBEGIN:VEVENT\nUID:3c6d44e8-79a7-428d-acac-9586c9e06e5c\nSUMMARY:Lunch\nDTSTAMP:20180210T093900Z\nDTSTART:20180115T191500Z\nDURATION:PT45M\nEND:VEVENT\nBEGIN:VEVENT\nUID:253cc897-fc26-4f25-9a01-b6bb57fa174d\nSUMMARY:Dinner\nDTSTAMP:20180210T093900Z\nDTSTART:20180115T191500Z\nDURATION:PT1H30M\nEND:VEVENT\nEND:VCALENDAR`
    } else {
      data = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;TZID=" + request.timezone + ":" + Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone) + "\nDTEND;TZID=" + request.timezone + ":" + Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone) + "\nSUMMARY:" + request.eventName + "\nLOCATION:" + request.venueAddress1 + " " + request.venueAddress1 + "\nEND:VEVENT\nEND:VCALENDAR";
    }
    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    let dayIdsTimeCalendar = this.dateCommonFunForTimeChange(request.dayIdsTimeCalendar, request);
    fs.writeFileSync(__dirname + "/" + request.firstName + "invitation.txt", data);
    await this.sendEmailWithFile(
      'orderQRCode',
      `[TICKET ARRIVAL] ${request.eventName} tickets`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `${request.firstName}, here's your ticket for ${request.eventName}. We hope you have a blast!`,
        firstName: request.firstName,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        eventStart: Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone),
        eventEnd: Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone),
        eventOutlookStart: Time.formatToUTC(request.eventStart, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.eventEnd, 'YYYY-MM-DDTHH:mm:ss'),
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        qrCodeAt: request.qrCodeAt,
        confirmationCode: request.confirmationCode,
        orgEmail: request.orgEmail,
        orgPhoneNumber: request.orgPhoneNumber,
        orgAddress1: request.orgAddress1,
        orgAddress2: request.orgAddress2,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        tax: request.orderTax,
        orderSubtotal: request.orderSubtotal,
        qrCodeUrl: request.qrCodeUrl,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        orderType: request.isRSVP ? 'reservation' : 'order',
        dayIdsTime: dayIdsTime,
        dayIdsTimeCalendar,
        ticketDeliveryType: request.ticketDeliveryType,
        physicalDeliveryInstructions: request.physicalDeliveryInstructions,
        promoterFee: request.promoterFee,
        processingFee: request.processingFee,
        discount: request.discount
      },
      request.firstName
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  dateCommonFunForTimeChange = (item, request) => {
    return item.map((day, index) => {
      return {
        day: index + 1,
        eventDate: Time.format(day.startsAt, 'ddd, MMM Do', request.timezone),
        startsAt: Time.format(day.startsAt, 'YYYYMMDDTHHmmss', request.timezone),
        endsAt: Time.format(day.endsAt, 'YYYYMMDDTHHmmss', request.timezone),
        doorsAt: Time.formatTimeOfDay(day.doorsAt, request.timezone),
        showAt: Time.formatTimeOfDay(day.startsAt, request.timezone),
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        cityState: request.cityState,
        venueName: request.venueName,
        eventName: request.eventName,
        eventOutlookStart: Time.formatToUTC(request.startsAt, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.endsAt, 'YYYY-MM-DDTHH:mm:ss'),
      }
    })
  }

  eventDateCommonFunForTimeChange = (item, name, request) => {
    return item.map((day, index) => {
      return {
        name: name,
        eventDate: Time.format(day.startsAt, 'ddd, MMM Do', request.timezone),
        startsAt: Time.format(day.startsAt, 'YYYYMMDDTHHmmss', request.timezone),
        endsAt: Time.format(day.endsAt, 'YYYYMMDDTHHmmss', request.timezone),
        doorsAt: Time.formatTimeOfDay(day.doorsAt, request.timezone),
        showAt: Time.formatTimeOfDay(day.startsAt, request.timezone),
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        cityState: request.cityState,
        venueName: request.venueName,
        // eventName: request.eventName,
        eventName: name,
        eventOutlookStart: Time.formatToUTC(request.startsAt, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.endsAt, 'YYYY-MM-DDTHH:mm:ss'),
      }
    })
  }
  public queueOrderRefundEmail = async (request: pb.QueueOrderRefundEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let dayIdsTime = request.dayIdsTime.map((day) => {
      return {
        eventDate: Time.format(day.startsAt, 'ddd, MMM Do', request.timezone),
        startsAt: day.startsAt,
        endsAt: day.endsAt,
        doorsAt: Time.formatTimeOfDay(day.doorsAt, request.timezone),
        showAt: Time.formatTimeOfDay(day.startsAt, request.timezone),
      }
    })

    await this.sendEmail(
      'orderRefund',
      `[ORDER REFUNDED] ${request.eventName}`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `Order items for ${request.eventName} have been refunded.`,
        firstName: request.firstName,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        qrCodeAt: request.qrCodeAt,
        confirmationCode: request.confirmationCode,
        orgEmail: request.orgEmail,
        orgPhoneNumber: request.orgPhoneNumber,
        orgAddress1: request.orgAddress1,
        orgAddress2: request.orgAddress2,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        orderType: request.isRSVP ? 'reservation' : 'order',
        orderRefundItems: request.orderRefundItems,
        orderSubtotalRefunded: request.orderSubtotalRefunded,
        orderFeesRefunded: request.orderFeesRefunded,
        orderTotalRefunded: request.orderTotalRefunded,
        refundReason: request.refundReason,
        dayIdsTime: dayIdsTime,
        promoterFee: request.promoterFee,
        processingFee: request.processingFee,
        tax: request.tax
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
  public queueOrderCanceledEmail = async (request: pb.QueueOrderCanceledEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let dayIdsTime = request.dayIdsTime.map((day) => {
      return {
        eventDate: Time.format(day.startsAt, 'ddd, MMM Do', request.timezone),
        startsAt: day.startsAt,
        endsAt: day.endsAt,
        doorsAt: Time.formatTimeOfDay(day.doorsAt, request.timezone),
        showAt: Time.formatTimeOfDay(day.startsAt, request.timezone),
      }
    })

    await this.sendEmail(
      'orderCanceled',
      `[ORDER CANCELED] ${request.eventName}`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `Order items for ${request.eventName} have been canceled.`,
        firstName: request.firstName,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        qrCodeAt: request.qrCodeAt,
        confirmationCode: request.confirmationCode,
        orgEmail: request.orgEmail,
        orgPhoneNumber: request.orgPhoneNumber,
        orgAddress1: request.orgAddress1,
        orgAddress2: request.orgAddress2,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        orderType: request.isRSVP ? 'reservation' : 'order',
        orderRefundItems: request.orderRefundItems,
        orderSubtotalRefunded: request.orderSubtotalRefunded,
        orderFeesRefunded: request.orderFeesRefunded,
        orderTotalRefunded: request.orderTotalRefunded,
        refundReason: request.refundReason,
        dayIdsTime: dayIdsTime
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
  public orderSheetEmail = async (request: pb.orderSheetEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'orderSheet',
      `[ORDER SHEET]`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `Your order sheet is here.`,
        url: request.url
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public customerSheetEmail = async (request: pb.customerSheetEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'customerSheet',
      `[CUSTOMER SHEET]`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `Your customer sheet is here.`,
        url: request.url
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public waitListEmail = async (request: pb.QueueOrderQRCodeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    await this.sendEmail(
      'waitList',
      `[WAIT LIST] ${request.eventName}`,
      request.toAddress,
      request.orgName,

      // firstName: request.firstName,
      // orgName: request.orgName,
      // venueName: request.venueName,
      // eventDate: request.eventDate,
      {
        description: `You have successfully been added to the Wait List for ${request.eventName} at ${request.venueName} on ${request.eventDate}. A member of ${request.orgName} will contact you if tickets become available. Thank you and have a wonderful day.`,
        name: request.firstName,
        // orgName: request.orgName,
        // venueName: request.venueName,
        // eventDate: request.eventDate,
        // description: request.eventName,
        // url: request.url
        dayIdsTime: dayIdsTime,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        eventStart: Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone),
        eventEnd: Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone),
        eventOutlookStart: Time.formatToUTC(request.eventStart, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.eventEnd, 'YYYY-MM-DDTHH:mm:ss'),
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        url: request.url,
        toAddress: request.toAddress
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public orderQRCodeEmailOnDay = async (request: pb.QueueOrderQRCodeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    let dayIdsTimeCalendar = this.dateCommonFunForTimeChange(request.dayIdsTimeCalendar, request);
    await this.sendEmail(
      'orderQRCodeOnDay',
      `[TICKET ARRIVAL] ${request.eventName} tickets`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `${request.firstName}, here's the Day. We hope you have a blast!`,
        firstName: request.firstName,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        qrCodeAt: request.qrCodeAt,
        confirmationCode: request.confirmationCode,
        orgEmail: request.orgEmail,
        orgPhoneNumber: request.orgPhoneNumber,
        orgAddress1: request.orgAddress1,
        orgAddress2: request.orgAddress2,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        tax: request.orderTax,
        orderSubtotal: request.orderSubtotal,
        qrCodeUrl: request.qrCodeUrl,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        orderType: request.isRSVP ? 'reservation' : 'order',
        dayIdsTime: dayIdsTime,
        dayIdsTimeCalendar,
        ticketDeliveryType: request.ticketDeliveryType,
        physicalDeliveryInstructions: request.physicalDeliveryInstructions,
        promoterFee: request.promoterFee,
        processingFee: request.processingFee,
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
  //   public salesReportEmail = async (request: pb.salesReportEmailRequest): Promise<pb.google.protobuf.Empty> => {
  //     const validEmailRegex = /[^-A-Za-z0-9!#$%&'*+/=?^_`{|}~\s]/;
  //     let fromName;
  //     if (!fromName) fromName = 'Team Sellout';
  //     const needsEscaping = fromName.match(validEmailRegex);
  //     if (needsEscaping) fromName = `"${fromName}"`;
  //     const fromAddress = `${fromName} <hello@${DOMAIN_NAME}>`;
  //     const email = {
  //       subject: "Sales Report",
  //       html: 'salesReport',
  //       to: request.toAddress,
  //       from: fromAddress,
  //       headers: { 'X-SES-CONFIGURATION-SET': 'sellout-default' },

  //       attachments: [
  //         {
  //           filename: 'SalesReport.pdf',
  //           path: request.pdf,
  //           type: 'application/pdf',
  //           disposition: 'attachment'
  //         }

  //       ]
  //     };

  //     try {
  //       return await this.mailer.sendMail(email);
  //     } catch (e) {
  //       throw e;
  //     }
  //   }
  // }


  public salesReportEmail = async (request: pb.salesReportEmailRequest): Promise<pb.google.protobuf.Empty> => {
    await this.sendEmail(
      'salesReport',
      `[SALES REPORT]`,
      request.toAddress,
      request.orgName,
      {
        preTextHeader: `Your Sales Report is here.`,
        pdf: request.pdf,
      },
    );
    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public immediateNotifyEmail = async (request: pb.QueueOrderQRCodeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    await this.sendEmail(
      'immediateNotifyMe',
      `[NOTIFY ME] ${request.eventName}`,
      request.toAddress,
      request.orgName,
      {
        dayIdsTime:dayIdsTime,
        description: `You have successfully added your information to be notified when ${request.eventName} goes on sale. You will receive an email at ${request.toAddress} with a link to secure your tickets just before sales go live. Thank you and we hope to see you at the event.`,
        // description:`You requested to be notified when tickets to ${request.eventName} go on sale. Well, that time is coming up soon! In about an hour, click the button below to book your tickets. Thank you, and we hope to see you at the event.`,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        eventStart: Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone),
        eventEnd: Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone),
        eventOutlookStart: Time.formatToUTC(request.eventStart, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.eventEnd, 'YYYY-MM-DDTHH:mm:ss'),
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        url: request.url,
        toAddress: request.toAddress
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }

  public notifyEmail = async (request: pb.QueueOrderQRCodeEmailRequest): Promise<pb.google.protobuf.Empty> => {
    let dayIdsTime = this.dateCommonFunForTimeChange(request.dayIdsTime, request);
    await this.sendEmail(
      'notifyMe',
      `[NOTIFY ME] ${request.eventName}`,
      request.toAddress,
      request.orgName,
      {
        dayIdsTime:dayIdsTime,
        // description: `You have successfully added your information to be notified when ${request.eventName} goes on sale. You will receive an email at ${request.toAddress} with a link to secure your tickets just before sales go live. Thank you and we hope to see you at the event.`,
        description:`You requested to be notified when tickets to ${request.eventName} go on sale. Well, that time is coming up soon! In about an hour, click the button below to book your tickets. Thank you, and we hope to see you at the event.`,
        eventName: request.eventName,
        orgName: request.orgName,
        eventSubtitle: request.eventSubtitle,
        eventDate: request.eventDate,
        eventStart: Time.format(request.eventStart, 'YYYYMMDDTHHmmss', request.timezone),
        eventEnd: Time.format(request.eventEnd, 'YYYYMMDDTHHmmss', request.timezone),
        eventOutlookStart: Time.formatToUTC(request.eventStart, 'YYYY-MM-DDTHH:mm:ss'),
        eventOutlookEnd: Time.formatToUTC(request.eventEnd, 'YYYY-MM-DDTHH:mm:ss'),
        venueName: request.venueName,
        doorsAt: request.doorsAt,
        showAt: request.showAt,
        eventPosterImageUrl: request.eventPosterImageUrl,
        cityState: request.cityState,
        orgLogoUrl: request.orgLogoUrl,
        orderItems: request.orderItems,
        orderTotal: request.orderTotal,
        orderFees: request.orderFees,
        venuePosterImageUrl: request.venuePosterImageUrl,
        venueAddress1: request.venueAddress1,
        venueAddress2: request.venueAddress2,
        url: request.url,
        toAddress: request.toAddress
      },
    );

    const response = pb.google.protobuf.Empty.create();
    return response;
  }
}
