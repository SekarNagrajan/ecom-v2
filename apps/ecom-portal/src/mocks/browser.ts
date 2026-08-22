import { setupWorker } from 'msw/browser';
import { landingHandlers } from './landing.handlers';
import { registrationHandlers } from './registration.handlers';
import { authHandlers } from './auth.handlers';
import { contactUsHandlers } from './contact-us.handlers';
import { adminHandlers } from './admin.handlers';
import { userCreationHandlers } from './user-creation.handlers';
import { userModulesHandlers } from './user-modules.handlers';
import { ratesHandlers } from './rates.handlers';
import { bookingHandlers } from './booking.handlers';

/**
 * MSW browser service worker — active in development only.
 * Import and start this in main.tsx before ReactDOM.createRoot.
 */
export const worker = setupWorker(
  ...landingHandlers, 
  ...registrationHandlers,
  ...authHandlers,
  ...contactUsHandlers,
  ...adminHandlers,
  ...userCreationHandlers,
  ...userModulesHandlers,
  ...ratesHandlers,
  ...bookingHandlers
);

