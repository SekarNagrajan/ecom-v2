// Modified by Sekar Nagarajan (2026-10-18 23:30)
/**
 * Every MSW handler of the portal, in registration order. Shared by the browser worker
 * (browser.ts) and the Node-side tests (msw/node), so both intercept exactly the same routes.
 * Order matters: on overlapping paths the earlier handler wins; the generic fixture-api
 * contract is registered last.
 */
import { accessibilityHandlers } from './accessibility.handlers';
import { adminHandlers } from './admin.handlers';
import { aiAssistHandlers } from './ai-assist.handlers';
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
import { fixtureApiHandlers } from './fixture-api/fixture-api.handlers';
import { landingHandlers } from './landing.handlers';
import { profilePhotoHandlers } from './profile-photo.handlers';
import { dashboardExportHandlers } from './dashboard-export.handlers';
import { hotlineHandlers } from './hotline.handlers';
import { publicTenantHandlers } from './public-tenant.handlers';
import { ratesHandlers } from './rates.handlers';
import { registrationHandlers } from './registration.handlers';
import { schedulesHandlers } from './schedules.handlers';
import { siHandlers } from './si.handlers';
import { trackingHandlers } from './tracking.handlers';
import { userCreationHandlers } from './user-creation.handlers';
import { userModulesHandlers } from './user-modules.handlers';
import { vgmHandlers } from './vgm.handlers';

export const handlers = [
  ...publicTenantHandlers,
  ...authAdminHandlers,
  ...landingHandlers,
  ...registrationHandlers,
  ...authHandlers,
  ...contactUsHandlers,
  ...hotlineHandlers,
  ...aiAssistHandlers,
  ...adminHandlers,
  ...userCreationHandlers,
  ...userModulesHandlers,
  ...accessibilityHandlers,
  ...profilePhotoHandlers,
  ...dashboardExportHandlers,
  ...ratesHandlers,
  ...schedulesHandlers,
  ...bookingHandlers,
  ...siHandlers,
  ...deliveryOrderHandlers,
  ...blHandlers,
  ...croHandlers,
  ...arrivalNoticeHandlers,
  ...customerStatementHandlers,
  ...carbonHandlers,
  ...vgmHandlers, // Modified by Sekar Nagarajan (2026-10-16 23:40) — fixture-backed /api/vgm/search + /api/vgm/submit
  ...trackingHandlers, // Modified by Sekar Nagarajan (2026-10-17 00:30) — fixture-backed /api/tracking/search + /api/tracking/samples
  // SQL-extracted fixtures (src/mocks/fixtures); registered last so hand-written routes win on overlap
  ...fixtureApiHandlers,
];
