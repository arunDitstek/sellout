import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import * as Query from '@sellout/models/.dist/interfaces/IQuery';
import Joi from '@hapi/joi';
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import { Role } from './Role';
import RoleStore from './RoleStore';
import IRole  from '@sellout/models/.dist/interfaces/IRole';
import Tracer  from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL, ADMIN_UI_BASE_URL } from './env';

const tracer = new Tracer('RoleService');

export default class RoleService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.RoleService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new RoleService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new RoleStore(Role),
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
      createRole: new PbMessageHandler(
        this.createRole,
        pb.CreateRoleRequest,
        pb.CreateRoleResponse,
      ),
      deleteRole: new PbMessageHandler(
        this.deleteRole,
        pb.DeleteRoleRequest,
        pb.DeleteRoleResponse,
      ),
      acceptRole: new PbMessageHandler(
        this.acceptRole,
        pb.AcceptRoleRequest,
        pb.AcceptRoleResponse,
      ),
      assignUserIdToRoles: new PbMessageHandler(
        this.assignUserIdToRoles,
        pb.AssignUserIdToRolesRequest,
        pb.AssignUserIdToRolesResponse,
      ),
      queryRoles: new PbMessageHandler(
        this.queryRoles,
        pb.QueryRolesRequest,
        pb.QueryRolesResponse,
      ),
      findRoleById: new PbMessageHandler(
        this.findRoleById,
        pb.FindRoleByIdRequest,
        pb.FindRoleByIdResponse,
      ),
      findUserRoles: new PbMessageHandler(
        this.findUserRoles,
        pb.FindUserRolesRequest,
        pb.FindUserRolesResponse,
      ),
      findUserRole: new PbMessageHandler(
        this.findUserRole,
        pb.FindUserRoleRequest,
        pb.FindUserRoleResponse,
      ),
      updateRoleEmail: new PbMessageHandler(
        this.updateRoleEmail,
        pb.UpdateRoleEmailRequest,
        pb.UpdateRoleEmailResponse,
      ),
    });
  }

  /**
   * Handles creating the role.
   * Will update the role instead if update is passed in with a role that currently exists.
   */
  public createRole = async (request: pb.CreateRoleRequest): Promise<pb.CreateRoleResponse> => {
    const span = tracer.startSpan('createRole', request.spanContext);
    const response: pb.CreateRoleResponse = pb.CreateRoleResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      creatorId: Joi.string().required(),
      update: Joi.boolean().optional(),
      role: Joi.object().keys({
        orgId: Joi.string().required(),
        userId: Joi.any().allow(null).optional(),
        userEmail: Joi.any().allow(null).optional(),
        role: Joi.string().required(),
      }).or('userId', 'userEmail'),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createRole - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let { creatorId, update, role: { orgId, userId, userEmail, role } } = params.value;


    if (!userEmail) {
      const findUserRequest = pb.FindUserByIdRequest.create({
        spanContext: span.context().toString(),
        userId,
      });

      try {
        const res = await this.proxy.userService.findUserById(findUserRequest);
        if (!res || !res.user) {
          throw new Error('User does not exist');
        }
        userEmail = res.user.email;
      } catch (e) {
        this.logger.error(`createRole - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Role creation was unsuccessful. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    if (!userId) {
      const findUserRequest = pb.FindUserByIdRequest.create({
        spanContext: span.context().toString(),
        email: userEmail,
      });

      try {
        const res = await this.proxy.userService.findUserByEmail(findUserRequest);
        if (!res || !res.user) {
          throw new Error('User does not exist');
        }
        // assign userId to role if user has verified email.
        // otherwise it will assign when they verify their email
        if (res.user.emailVerifiedAt) {
          userId = res.user._id;
        }
      } catch (e) {
        this.logger.error(`createRole - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Role creation was unsuccessful. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    // if not updating the role, throw error if role already exists in the organization.
    if (!update) {
      try {
        const res = await this.findUserRole({ spanContext: span.context().toString(), userId, orgId });
        if (res.role) {
          throw new Error('This user already has a role in this organization. You cannot add them again until they are removed.');
        }
      } catch (e) {
        this.logger.error(`createRole - error: ${e.message}`);
        response.status = pb.StatusCode.BAD_REQUEST;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId,
    });

    let findOrgResponse;
    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(findOrgRequest);
    } catch (e) {
      this.logger.error(`createRole - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Role creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { organization } = findOrgResponse;

    const newRole: IRole = {
      orgId,
      userId,
      userEmail,
      role,
      createdAt: Time.now(),
      createdBy: creatorId,
    };

    // If the org userId is the same as the userId, the user is creating
    // an organization and is given an accepted role automatically.
    if (organization.userId === userId) {
      newRole.acceptedAt = Time.now();
    }

    // update the role if it already exists
    let currentRole: IRole;
    try {
      currentRole = await this.storage.updateUserRole(span, userEmail, orgId, newRole);
    } catch (e) {
      this.logger.error(`createRole - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Role creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    if (currentRole) {
      response.status = pb.StatusCode.OK;
      response.role = pb.Role.fromObject(currentRole);
      return response;
    }

    let savedRole: IRole;
    try {
      savedRole = await this.storage.createRole(span, newRole);
      response.status = pb.StatusCode.OK;
      response.role = pb.Role.fromObject(savedRole);
    } catch (e) {
      this.logger.error(`createRole - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Role creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    if (organization.userId !== userId) {
      const inviteToOrganizationRequest = pb.QueueInviteToOrganizationEmailRequest.create({
        spanContext: span.context().toString(),
        toAddress: userEmail,
        orgName: organization.orgName,
        redirectUrl: `${ADMIN_UI_BASE_URL}${`/account`}`,
        orgLogo: organization.orgLogoUrl,
        roleName: role,
      });

      try {
        await this.proxy.emailService.queueInviteToOrganizationEmailRequest(inviteToOrganizationRequest);
      } catch (e) {
        this.logger.error(e);
      }
    }

    span.finish();
    return response;
  }
  public deleteRole = async (request: pb.DeleteRoleRequest): Promise<pb.DeleteRoleResponse> => {
    const span = tracer.startSpan('deleteRole', request.spanContext);
    const response: pb.DeleteRoleResponse = pb.DeleteRoleResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      roleId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`deleteRole - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { roleId } = params.value;

    let role: IRole;
    try {
      role = await this.storage.findRoleById(span, roleId);

      if (!role || !role._id) {
        throw new Error('Could not find role to delete. Please contact support.');
      }

    } catch (e) {
      this.logger.error(`deleteRole - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Could not find role to delete. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    try {
      await this.storage.deleteRole(span, roleId);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`deleteRole - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Role deletion was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    if (role.userId) {
      const setOrgRequest = pb.SetUserOrgContextIdRequest.create({
        spanContext: span.context().toString(),
        userId: role.userId,
        orgId: null,
      });

      try {
        await this.proxy.userService.setUserOrgContextId(setOrgRequest);
      } catch (e) {
        this.logger.error(`acceptRole - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: e.message,
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
      }
    }

    span.finish();
    return response;
  }

  public queryRoles = async(request: pb.QueryRolesRequest): Promise<pb.QueryRolesResponse> => {
    const span = tracer.startSpan('queryRoles', request.spanContext);
    const response: pb.QueryRolesResponse = pb.QueryRolesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryRoles - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    let { query, pagination } = params.value;


    query = Query.fromPb(query);

    let roles: IRole[];

    try {
      roles = await this.storage.queryRoles(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.roles = roles.map(v => pb.Role.fromObject(v));
    } catch (e) {
      this.logger.error(`queryRoles - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public acceptRole = async (request: pb.AcceptRoleRequest): Promise<pb.AcceptRoleResponse> => {
    const span = tracer.startSpan('acceptRole', request.spanContext);
    const response: pb.AcceptRoleResponse = pb.AcceptRoleResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      roleId: Joi.string().required(),
      accept: Joi.any().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`acceptRole - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { roleId, accept } = params.value;


    if (accept) {
      let role: IRole;
      try {
        role = await this.storage.updateOneRole(span, roleId, { acceptedAt: Time.now() });
        response.status = pb.StatusCode.OK;
        response.role = role ? pb.Role.fromObject(role) : null;
      } catch (e) {
        this.logger.error(`acceptRole - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }

      const setOrgRequest = pb.SetUserOrgContextIdRequest.create({
        spanContext: span.context().toString(),
        userId: role.userId,
        orgId: role.orgId,
      });

      try {
        await this.proxy.userService.setUserOrgContextId(setOrgRequest);
      } catch (e) {
        this.logger.error(`acceptRole - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: e.message,
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
      }

    } else {
      const deleteRequest = pb.DeleteRoleRequest.create({
        spanContext: span.context().toString(),
        roleId,
      });

      try {
        await this.deleteRole(deleteRequest);
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`acceptRole - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: e.message,
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    span.finish();
    return response;
  }
  public assignUserIdToRoles = async (request: pb.AssignUserIdToRolesRequest): Promise<pb.AssignUserIdToRolesResponse> => {
    const span = tracer.startSpan('assignUserIdToRoles', request.spanContext);
    const response: pb.AssignUserIdToRolesResponse = pb.AssignUserIdToRolesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
      userEmail: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`assignUserIdToRoles - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, userEmail } = params.value;

    try {
      await this.storage.assignUserIdToRoles(span, userId, userEmail);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`assignUserIdToRoles - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  public findRoleById = async (request: pb.FindRoleByIdRequest): Promise<pb.FindRoleByIdResponse> => {
    const span = tracer.startSpan('findRoleById', request.spanContext);
    const response: pb.FindRoleByIdResponse = pb.FindRoleByIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      roleId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findRoleById - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { roleId } = params.value;


    let role: IRole;
    try {
      role = await this.storage.findRoleById(span, roleId);
      response.status = pb.StatusCode.OK;
      response.role = role ? pb.Role.fromObject(role) : null;
    } catch (e) {
      this.logger.error(`findRoleById - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  /**
   * Finds the user's roles by email.
   * userId will only be present on the role if the user has verified their email
   * so we need to search by email in case the user hasn't verified
   */
  public findUserRoles = async (request: pb.FindUserRolesRequest): Promise<pb.FindUserRolesResponse> => {
    const span = tracer.startSpan('findUserRoles', request.spanContext);
    const response: pb.FindUserRolesResponse = pb.FindUserRolesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findUserRoles - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, } = params.value;


    const findUserRequest = pb.FindUserByIdRequest.create({
      spanContext: span.context().toString(),
      userId,
    });
    let userEmail: string;

    try {
      const res = await this.proxy.userService.findUserById(findUserRequest);
      if (!res || !res.user) {
        throw new Error('There was an error, please contact support');
      }
      userEmail = res.user.email;
    } catch (e) {
      this.logger.error(`findUserRoles - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Role creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    let roles: IRole[];
    try {
      roles = await this.storage.findUserRoles(span, userEmail);
      response.status = pb.StatusCode.OK;
      response.roles = roles.map(v => pb.Role.fromObject(v));
    } catch (e) {
      this.logger.error(`findUserRoles - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  /**
   * Finds a specific user role in an organization
   */
  public findUserRole = async (request: pb.FindUserRoleRequest): Promise<pb.FindUserRoleResponse> => {
    const span = tracer.startSpan('findUserRole', request.spanContext);
    const response: pb.FindUserRoleResponse = pb.FindUserRoleResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findUserRole - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, orgId } = params.value;


    let role: IRole;
    try {
      role = await this.storage.findUserRole(span, userId, orgId);
      response.status = pb.StatusCode.OK;
      response.role = role ? pb.Role.fromObject(role) : null;
    } catch (e) {
      this.logger.error(`findUserRole - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  public updateRoleEmail = async (request: pb.UpdateRoleEmailRequest): Promise<pb.UpdateRoleEmailResponse> => {
    const span = tracer.startSpan('UpdateRoleEmail', request.spanContext);
    const response: pb.UpdateRoleEmailResponse = pb.UpdateRoleEmailResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
      userEmail: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`UpdateRoleEmail - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, userEmail } = params.value;


    try {
      await this.storage.UpdateRoleEmail(span, userId, userEmail);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`UpdateRoleEmail - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
}
