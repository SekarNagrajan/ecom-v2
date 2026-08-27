// Modified by Sekar Nagarajan (2026-08-27 11:40)
import { setupWorker } from 'msw/browser';
import { adminHandlers } from './admin.handlers';
import { arrivalNoticeHandlers } from './arrival-notice.handlers';
import { authAdminHandlers } from './auth-admin.handlers';
import { authHandlers } from './auth.handlers';
import { blHandlers } from './bl.handlers';
import { bookingHandlers } from './booking.handlers';
import { carbonHandlers } from './carbon.handlers';
import { contactUsHandlers } from './contact-us.handlers';
import { croHandlers } from './cro.handlers';
import { customerStatementHandlers } from './customer-statement.handlers';
import { deliveryOrderHandlers } from './delivery-order.handlers';
import { landingHandlers } from './landing.handlers';
import { ratesHandlers } from './rates.handlers';
import { registrationHandlers } from './registration.handlers';
import { userCreationHandlers } from './user-creation.handlers';
import { userModulesHandlers } from './user-modules.handlers';

/**
 * MSW browser service worker — active in development only.
 * Import and start this in main.tsx before ReactDOM.createRoot.
 */
export const worker = setupWorker(
  ...authAdminHandlers,
  ...landingHandlers,
  ...registrationHandlers,
  ...authHandlers,
  ...contactUsHandlers,
  ...adminHandlers,
  ...userCreationHandlers,
  ...userModulesHandlers,
  ...ratesHandlers,
  ...bookingHandlers,
  ...deliveryOrderHandlers,
  ...blHandlers,
  ...croHandlers,
  ...arrivalNoticeHandlers,
  ...customerStatementHandlers,
  ...carbonHandlers,
);

