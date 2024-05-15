import {
  AuthenticationError,
} from "./../graphqlError";
import {
  STRIPE_CLIENT_ID,
  ADMIN_UI_BASE_URL,
  SELLOUT_WEBFLOW_SITE_ID,
} from './../env';
//import { roles, hasPermission } from './../permissions';

export const resolvers = {
  Query: {
    async platformSettings(_, args, context) {
     // let { req, proxy } = context;
      let { req } = context;
      const span = req.tracer.startSpan("PlatformSettings.settings", req.span);
     // const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // if (!await hasPermission(proxy, spanContext, req.user, roles.SCANNER)) {
      //   throw new AuthenticationError(
      //     "User does not have required permission level."
      //   );
      // }

      span.finish();
      return {
        stripeClientId: STRIPE_CLIENT_ID,
        stripeRedirectUrl: `${ADMIN_UI_BASE_URL}/account/createOrganization`,
        webFlowSiteId: SELLOUT_WEBFLOW_SITE_ID,
      };
    }
  },
};
